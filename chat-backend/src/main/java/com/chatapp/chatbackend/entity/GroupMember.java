package com.chatapp.chatbackend.entity;

import jakarta.persistence.*;

@Entity
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;
    private String userName;

    public Long getId() { return id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}