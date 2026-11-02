package com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserGamificationProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataGamificationProfileRepository extends JpaRepository<UserGamificationProfileEntity, UUID> {

    @Query("""
        SELECT p FROM UserGamificationProfileEntity p, UserEntity u
        WHERE p.userId = u.id
          AND u.isBot = false
          AND p.optInReminders = true
          AND p.dailyQuestionsCompleted < p.dailyGoalQuestions
          AND u.email NOT LIKE '%@simulado.enem.br'
          AND u.email NOT LIKE '%@example.com'
          AND u.email NOT LIKE '%@test.com'
          AND u.email NOT LIKE '%.local'
          AND u.email NOT LIKE '%.test'
    """)
    List<UserGamificationProfileEntity> findPendingStudyReminderProfiles();
}
