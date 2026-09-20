package com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserGamificationProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataGamificationProfileRepository extends JpaRepository<UserGamificationProfileEntity, UUID> {

    @Query("SELECT p FROM UserGamificationProfileEntity p WHERE p.optInReminders = true AND p.dailyQuestionsCompleted < p.dailyGoalQuestions")
    List<UserGamificationProfileEntity> findPendingStudyReminderProfiles();
}
