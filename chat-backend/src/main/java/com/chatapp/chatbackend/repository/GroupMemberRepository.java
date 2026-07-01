package com.chatapp.chatbackend.repository;

import com.chatapp.chatbackend.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMemberRepository
        extends JpaRepository<GroupMember, Long> {

    List<GroupMember> findByUserName(
            String userName
    );

    List<GroupMember> findByGroupId(
            Long groupId
    );

    boolean existsByGroupIdAndUserName(
            Long groupId,
            String userName
    );

    void deleteByGroupId(
            Long groupId
    );


    void deleteByGroupIdAndUserName(
            Long groupId,
            String userName
    );
}