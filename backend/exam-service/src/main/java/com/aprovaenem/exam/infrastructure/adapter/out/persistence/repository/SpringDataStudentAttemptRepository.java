package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.StudentAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataStudentAttemptRepository extends JpaRepository<StudentAttemptEntity, UUID> {

    boolean existsBySession_IdAndQuestion_Id(UUID sessionId, UUID questionId);

    List<StudentAttemptEntity> findBySession_IdOrderBySubmittedAtAsc(UUID sessionId);
}
