package com.chatapp.chatbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChatGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupName;

    private String createdBy;

    private String groupImage;

    private LocalDateTime createdAt;

    // NEW FIELD
    private boolean onlyAdminCanSend;

    public Long getId() {
        return id;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getGroupImage() {
        return groupImage;
    }

    public void setGroupImage(String groupImage) {
        this.groupImage = groupImage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isOnlyAdminCanSend() {
        return onlyAdminCanSend;
    }

    public void setOnlyAdminCanSend(boolean onlyAdminCanSend) {
        this.onlyAdminCanSend = onlyAdminCanSend;
    }
}