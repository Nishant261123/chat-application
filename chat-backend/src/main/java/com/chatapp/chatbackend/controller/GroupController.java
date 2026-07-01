package com.chatapp.chatbackend.controller;

import com.chatapp.chatbackend.entity.ChatGroup;
import com.chatapp.chatbackend.entity.GroupMember;
import com.chatapp.chatbackend.entity.GroupMessage;
import com.chatapp.chatbackend.repository.ChatGroupRepository;
import com.chatapp.chatbackend.repository.GroupMemberRepository;
import com.chatapp.chatbackend.repository.GroupMessageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin("*")
public class GroupController {

    @Autowired
    private ChatGroupRepository chatGroupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    @PostMapping("/create")
    public ChatGroup createGroup(@RequestBody Map<String, Object> request) {

        String groupName = String.valueOf(request.get("groupName"));
        String createdBy = String.valueOf(request.get("createdBy"));

        ChatGroup group = new ChatGroup();
        group.setGroupName(groupName);
        group.setCreatedBy(createdBy);
        group.setGroupImage("");
        group.setCreatedAt(LocalDateTime.now());
        group.setOnlyAdminCanSend(false);

        ChatGroup savedGroup = chatGroupRepository.save(group);

        GroupMember creator = new GroupMember();
        creator.setGroupId(savedGroup.getId());
        creator.setUserName(createdBy);
        groupMemberRepository.save(creator);

        Object membersObj = request.get("members");

        if (membersObj instanceof List<?>) {
            List<?> members = (List<?>) membersObj;

            for (Object memberObj : members) {
                String memberName = String.valueOf(memberObj);

                if (!memberName.equals(createdBy)) {
                    GroupMember member = new GroupMember();
                    member.setGroupId(savedGroup.getId());
                    member.setUserName(memberName);
                    groupMemberRepository.save(member);
                }
            }
        }

        saveSystemMessage(
                savedGroup.getId(),
                createdBy + " created group " + groupName
        );

        return savedGroup;
    }

    @GetMapping("/user/{userName}")
    public List<ChatGroup> getGroupsByUser(@PathVariable String userName) {

        List<GroupMember> memberships =
                groupMemberRepository.findByUserName(userName);

        List<ChatGroup> groups = new ArrayList<>();

        for (GroupMember member : memberships) {
            chatGroupRepository
                    .findById(member.getGroupId())
                    .ifPresent(groups::add);
        }

        return groups;
    }

    @GetMapping("/{groupId}/members")
    public List<GroupMember> getGroupMembers(@PathVariable Long groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }

    @PostMapping("/{groupId}/add-member")
    public GroupMember addMember(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> request
    ) {
        String userName = request.get("userName");
        String addedBy = request.get("addedBy");

        if (userName == null || userName.trim().isEmpty()) {
            throw new RuntimeException("User name is required");
        }

        if (addedBy == null || addedBy.trim().isEmpty()) {
            addedBy = "Admin";
        }

        if (!chatGroupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found");
        }

        if (groupMemberRepository.existsByGroupIdAndUserName(groupId, userName)) {
            throw new RuntimeException("User already in group");
        }

        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserName(userName);

        GroupMember savedMember = groupMemberRepository.save(member);

        saveSystemMessage(
                groupId,
                addedBy + " added " + userName
        );

        return savedMember;
    }

    @DeleteMapping("/{groupId}/remove-member/{userName}/{removedBy}")
    @Transactional
    public ResponseEntity<String> removeMember(
            @PathVariable Long groupId,
            @PathVariable String userName,
            @PathVariable String removedBy
    ) {
        ChatGroup group =
                chatGroupRepository
                        .findById(groupId)
                        .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getCreatedBy().equals(userName)) {
            throw new RuntimeException("Admin cannot be removed");
        }

        groupMemberRepository.deleteByGroupIdAndUserName(groupId, userName);

        saveSystemMessage(
                groupId,
                removedBy + " removed " + userName
        );

        return ResponseEntity.ok("Member removed successfully");
    }

    @DeleteMapping("/{groupId}/leave/{userName}")
    @Transactional
    public ResponseEntity<String> leaveGroup(
            @PathVariable Long groupId,
            @PathVariable String userName
    ) {
        ChatGroup group =
                chatGroupRepository
                        .findById(groupId)
                        .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getCreatedBy().equals(userName)) {
            throw new RuntimeException("Admin must transfer admin before leaving");
        }

        groupMemberRepository.deleteByGroupIdAndUserName(groupId, userName);

        saveSystemMessage(
                groupId,
                userName + " left the group"
        );

        return ResponseEntity.ok("Left group successfully");
    }

    @PutMapping("/{groupId}/transfer-admin")
    public ChatGroup transferAdmin(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> request
    ) {
        String newAdmin = request.get("newAdmin");

        if (newAdmin == null || newAdmin.trim().isEmpty()) {
            throw new RuntimeException("New admin is required");
        }

        ChatGroup group =
                chatGroupRepository
                        .findById(groupId)
                        .orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isMember =
                groupMemberRepository.existsByGroupIdAndUserName(
                        groupId,
                        newAdmin
                );

        if (!isMember) {
            throw new RuntimeException("New admin must be a group member");
        }

        String oldAdmin = group.getCreatedBy();

        group.setCreatedBy(newAdmin);

        ChatGroup updatedGroup = chatGroupRepository.save(group);

        saveSystemMessage(
                groupId,
                oldAdmin + " made " + newAdmin + " admin"
        );

        return updatedGroup;
    }

    @PutMapping("/{groupId}/announcement-mode")
    public ChatGroup updateAnnouncementMode(
            @PathVariable Long groupId,
            @RequestBody Map<String, Boolean> request
    ) {
        ChatGroup group =
                chatGroupRepository
                        .findById(groupId)
                        .orElseThrow(() -> new RuntimeException("Group not found"));

        Boolean enabled = request.get("onlyAdminCanSend");

        group.setOnlyAdminCanSend(enabled != null && enabled);

        ChatGroup updatedGroup =
                chatGroupRepository.save(group);

        saveSystemMessage(
                groupId,
                updatedGroup.isOnlyAdminCanSend()
                        ? "Only admins can send messages"
                        : "All members can send messages"
        );

        return updatedGroup;
    }

    @DeleteMapping("/{groupId}")
    @Transactional
    public ResponseEntity<String> deleteGroup(@PathVariable Long groupId) {

        groupMessageRepository.deleteByGroupId(groupId);
        groupMemberRepository.deleteByGroupId(groupId);
        chatGroupRepository.deleteById(groupId);

        return ResponseEntity.ok("Group deleted successfully");
    }

    private void saveSystemMessage(Long groupId, String content) {
        GroupMessage systemMessage = new GroupMessage();

        systemMessage.setGroupId(groupId);
        systemMessage.setSender("SYSTEM");
        systemMessage.setContent(content);
        systemMessage.setMessageType("SYSTEM");
        systemMessage.setFileUrl("");
        systemMessage.setFileName("");
        systemMessage.setTimestamp(LocalDateTime.now());

        groupMessageRepository.save(systemMessage);
    }
}