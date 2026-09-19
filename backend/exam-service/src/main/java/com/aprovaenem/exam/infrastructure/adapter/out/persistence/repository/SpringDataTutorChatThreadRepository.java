package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.TutorChatThreadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataTutorChatThreadRepository extends JpaRepository<TutorChatThreadEntity, UUID> {

    Optional<TutorChatThreadEntity> findByUserIdAndQuestion_IdAndStatus(UUID userId, UUID questionId, String status);
}
