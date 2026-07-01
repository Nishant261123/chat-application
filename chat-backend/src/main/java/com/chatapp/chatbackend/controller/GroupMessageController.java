package com.chatapp.chatbackend.controller;

import com.chatapp.chatbackend.entity.ChatGroup;
import com.chatapp.chatbackend.entity.GroupMessage;
import com.chatapp.chatbackend.entity.GroupMember;
import com.chatapp.chatbackend.entity.GroupMessageSeen;

import com.chatapp.chatbackend.repository.ChatGroupRepository;
import com.chatapp.chatbackend.repository.GroupMessageRepository;
import com.chatapp.chatbackend.repository.GroupMemberRepository;
import com.chatapp.chatbackend.repository.GroupMessageSeenRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/group-messages")
@CrossOrigin("*")
public class GroupMessageController {

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ChatGroupRepository chatGroupRepository;

    @Autowired
    private GroupMessageSeenRepository groupMessageSeenRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public GroupMessage sendGroupMessage(
            @RequestBody GroupMessage message
    ) {

        ChatGroup group =
                chatGroupRepository
                        .findById(message.getGroupId())
                        .orElseThrow(
                                () -> new RuntimeException("Group not found")
                        );

        if (
                group.isOnlyAdminCanSend() &&
                        !group.getCreatedBy().equals(message.getSender())
        ) {
            throw new RuntimeException(
                    "Only admin can send messages"
            );
        }

        message.setTimestamp(
                LocalDateTime.now()
        );

        GroupMessage savedMessage =
                groupMessageRepository.save(message);

        sendToGroupMembers(savedMessage);

        return savedMessage;
    }

    @PutMapping("/reaction/{id}")
    public GroupMessage reactToGroupMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {

        GroupMessage message =
                groupMessageRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException("Message not found")
                        );

        if ("SYSTEM".equals(message.getMessageType())) {
            throw new RuntimeException(
                    "Cannot react to system message"
            );
        }

        if ("DELETED".equals(message.getMessageType())) {
            throw new RuntimeException(
                    "Cannot react to deleted message"
            );
        }

        String reaction =
                request.get("reaction");

        message.setReaction(reaction);

        GroupMessage updatedMessage =
                groupMessageRepository.save(message);

        sendToGroupMembers(updatedMessage);

        return updatedMessage;
    }

    @PostMapping("/seen/{messageId}/{userName}")
    public GroupMessageSeen markGroupMessageSeen(
            @PathVariable Long messageId,
            @PathVariable String userName
    ) {

        GroupMessage message =
                groupMessageRepository
                        .findById(messageId)
                        .orElseThrow(
                                () -> new RuntimeException("Message not found")
                        );

        if ("SYSTEM".equals(message.getMessageType())) {
            throw new RuntimeException(
                    "System message cannot be marked as seen"
            );
        }

        if (message.getSender().equals(userName)) {
            throw new RuntimeException(
                    "Sender cannot mark own message as seen"
            );
        }

        boolean alreadySeen =
                groupMessageSeenRepository
                        .existsByMessageIdAndUserName(
                                messageId,
                                userName
                        );

        if (alreadySeen) {
            List<GroupMessageSeen> seenList =
                    groupMessageSeenRepository.findByMessageId(
                            messageId
                    );

            return seenList.stream()
                    .filter(seen -> seen.getUserName().equals(userName))
                    .findFirst()
                    .orElseThrow();
        }

        GroupMessageSeen seen =
                new GroupMessageSeen();

        seen.setMessageId(messageId);
        seen.setGroupId(message.getGroupId());
        seen.setUserName(userName);
        seen.setSeenAt(LocalDateTime.now());

        GroupMessageSeen savedSeen =
                groupMessageSeenRepository.save(seen);

        sendToGroupMembers(message);

        return savedSeen;
    }

    @GetMapping("/seen/{messageId}")
    public List<GroupMessageSeen> getSeenUsers(
            @PathVariable Long messageId
    ) {
        return groupMessageSeenRepository.findByMessageId(
                messageId
        );
    }

    @GetMapping("/{groupId}")
    public List<GroupMessage> getGroupMessages(
            @PathVariable Long groupId
    ) {
        return groupMessageRepository
                .findByGroupIdOrderByTimestampAsc(groupId);
    }

    private void sendToGroupMembers(GroupMessage message) {

        List<GroupMember> members =
                groupMemberRepository.findByGroupId(
                        message.getGroupId()
                );

        for (GroupMember member : members) {
            messagingTemplate.convertAndSend(
                    "/topic/user/" + member.getUserName(),
                    message
            );
        }
    }
}