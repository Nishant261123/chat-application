package com.chatapp.chatbackend.controller;

import com.chatapp.chatbackend.entity.Message;
import com.chatapp.chatbackend.entity.User;
import com.chatapp.chatbackend.repository.MessageRepository;
import com.chatapp.chatbackend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendMessage")
    public void sendMessage(Message message) {

        message.setTimestamp(LocalDateTime.now());

        if (message.getMessageType() == null) {
            message.setMessageType("TEXT");
        }

        User receiver =
                userRepository
                        .findByName(message.getReceiver())
                        .orElse(null);

        if (receiver != null && receiver.isOnline()) {
            message.setDelivered(true);
        } else {
            message.setDelivered(false);
        }

        message.setSeen(false);

        Message savedMessage =
                messageRepository.save(message);

        messagingTemplate.convertAndSend(
                "/topic/user/" + savedMessage.getSender(),
                savedMessage
        );

        if (receiver != null && receiver.isOnline()) {
            messagingTemplate.convertAndSend(
                    "/topic/user/" + savedMessage.getReceiver(),
                    savedMessage
            );
        }
    }

    @MessageMapping("/typing")
    public void typing(Map<String, String> data) {

        String receiver = data.get("receiver");

        messagingTemplate.convertAndSend(
                "/topic/user/" + receiver + "/typing",
                data
        );
    }
}