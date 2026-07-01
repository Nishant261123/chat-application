package com.chatapp.chatbackend.controller;

import com.chatapp.chatbackend.entity.Message;
import com.chatapp.chatbackend.repository.MessageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin("*")
public class MessageRestController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @GetMapping("/chat/{sender}/{receiver}")
    public List<Message> getChatBetweenUsers(
            @PathVariable String sender,
            @PathVariable String receiver
    ) {
        return messageRepository.findChatBetweenUsers(
                sender,
                receiver
        );
    }

    @PutMapping("/seen/{id}")
    public Message seenMessage(@PathVariable Long id) {
        Message message =
                messageRepository.findById(id).orElseThrow();

        message.setSeen(true);

        Message updatedMessage =
                messageRepository.save(message);

        sendToBothUsers(updatedMessage);

        return updatedMessage;
    }

    @PutMapping("/edit/{id}")
    public Message editMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        Message message =
                messageRepository.findById(id).orElseThrow();

        String newContent = request.get("content");

        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        if (
                "DELETED".equals(message.getMessageType()) ||
                        "IMAGE".equals(message.getMessageType()) ||
                        "FILE".equals(message.getMessageType())
        ) {
            throw new RuntimeException("Only text messages can be edited");
        }

        message.setContent(newContent);
        message.setEdited(true);

        Message updatedMessage =
                messageRepository.save(message);

        sendToBothUsers(updatedMessage);

        return updatedMessage;
    }

    @PutMapping("/reaction/{id}")
    public Message reactToMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        Message message =
                messageRepository.findById(id).orElseThrow();

        if ("DELETED".equals(message.getMessageType())) {
            throw new RuntimeException("Cannot react to deleted message");
        }

        message.setReaction(request.get("reaction"));

        Message updatedMessage =
                messageRepository.save(message);

        sendToBothUsers(updatedMessage);

        return updatedMessage;
    }

    @DeleteMapping("/{id}")
    public Message deleteMessageForEveryone(@PathVariable Long id) {
        Message message =
                messageRepository.findById(id).orElseThrow();

        message.setContent("This message was deleted");
        message.setMessageType("DELETED");
        message.setFileUrl("");
        message.setFileName("");
        message.setReaction(null);

        Message updatedMessage =
                messageRepository.save(message);

        sendToBothUsers(updatedMessage);

        return updatedMessage;
    }

    @DeleteMapping("/chat/{sender}/{receiver}")
    public ResponseEntity<String> deleteChat(
            @PathVariable String sender,
            @PathVariable String receiver
    ) {
        messageRepository.deleteChatBetweenUsers(
                sender,
                receiver
        );

        return ResponseEntity.ok("Chat deleted successfully");
    }

    private void sendToBothUsers(Message message) {
        messagingTemplate.convertAndSend(
                "/topic/user/" + message.getSender(),
                message
        );

        messagingTemplate.convertAndSend(
                "/topic/user/" + message.getReceiver(),
                message
        );
    }
}