package com.chatapp.chatbackend.repository;

import com.chatapp.chatbackend.entity.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
}