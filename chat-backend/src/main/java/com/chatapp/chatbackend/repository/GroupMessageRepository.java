package com.chatapp.chatbackend.repository;

import com.chatapp.chatbackend.entity.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    List<GroupMessage> findByGroupIdOrderByTimestampAsc(Long groupId);

    void deleteByGroupId(Long groupId);
}