package com.chatapp.chatbackend.repository;

import com.chatapp.chatbackend.entity.GroupMessageSeen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMessageSeenRepository extends JpaRepository<GroupMessageSeen, Long> {

    boolean existsByMessageIdAndUserName(Long messageId, String userName);

    List<GroupMessageSeen> findByMessageId(Long messageId);

    void deleteByGroupId(Long groupId);
}