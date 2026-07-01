package com.chatapp.chatbackend.repository;

import com.chatapp.chatbackend.entity.Message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiver(
            String sender,
            String receiver
    );

    @Query("""
        SELECT m FROM Message m
        WHERE (m.sender = :sender AND m.receiver = :receiver)
           OR (m.sender = :receiver AND m.receiver = :sender)
        ORDER BY m.timestamp ASC
    """)
    List<Message> findChatBetweenUsers(
            @Param("sender") String sender,
            @Param("receiver") String receiver
    );

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM Message m
        WHERE (m.sender = :sender AND m.receiver = :receiver)
           OR (m.sender = :receiver AND m.receiver = :sender)
    """)
    void deleteChatBetweenUsers(
            @Param("sender") String sender,
            @Param("receiver") String receiver
    );
}