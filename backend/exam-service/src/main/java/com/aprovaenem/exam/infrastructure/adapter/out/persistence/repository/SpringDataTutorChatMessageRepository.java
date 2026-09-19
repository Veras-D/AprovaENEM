package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TutorChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataTutorChatMessageRepository extends JpaRepository<TutorChatMessageEntity, UUID> {

    List<TutorChatMessageEntity> findByThread_IdOrderByCreatedAtAsc(UUID threadId);
}
