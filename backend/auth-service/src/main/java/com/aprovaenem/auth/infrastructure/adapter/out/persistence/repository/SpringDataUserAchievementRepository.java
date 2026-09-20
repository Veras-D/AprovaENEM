package com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserAchievementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataUserAchievementRepository extends JpaRepository<UserAchievementEntity, UUID> {

    List<UserAchievementEntity> findByUserId(UUID userId);

    boolean existsByUserIdAndBadgeCode(UUID userId, String badgeCode);
}
