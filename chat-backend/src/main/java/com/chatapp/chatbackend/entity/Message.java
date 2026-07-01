package com.chatapp.chatbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;

    private String receiver;

    private String content;

    private LocalDateTime timestamp;

    private boolean delivered;

    private boolean seen;

    // EDITED MESSAGE
    private boolean edited;

    // MESSAGE REACTION
    private String reaction;

    // TEXT, IMAGE, FILE, DELETED
    private String messageType;

    private String fileUrl;

    private String fileName;

    // =========================
    // ID
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // =========================
    // SENDER
    // =========================

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    // =========================
    // RECEIVER
    // =========================

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    // =========================
    // CONTENT
    // =========================

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    // =========================
    // TIMESTAMP
    // =========================

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    // =========================
    // DELIVERED
    // =========================

    public boolean isDelivered() {
        return delivered;
    }

    public void setDelivered(boolean delivered) {
        this.delivered = delivered;
    }

    // =========================
    // SEEN
    // =========================

    public boolean isSeen() {
        return seen;
    }

    public void setSeen(boolean seen) {
        this.seen = seen;
    }

    // =========================
    // EDITED
    // =========================

    public boolean isEdited() {
        return edited;
    }

    public void setEdited(boolean edited) {
        this.edited = edited;
    }

    // =========================
    // REACTION
    // =========================

    public String getReaction() {
        return reaction;
    }

    public void setReaction(String reaction) {
        this.reaction = reaction;
    }

    // =========================
    // MESSAGE TYPE
    // =========================

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    // =========================
    // FILE URL
    // =========================

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    // =========================
    // FILE NAME
    // =========================

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}