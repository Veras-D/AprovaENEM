package com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.WeeklyLeaderboardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataWeeklyLeaderboardRepository extends JpaRepository<WeeklyLeaderboardEntity, UUID> {

    Optional<WeeklyLeaderboardEntity> findByUserIdAndWeekNumberAndYear(UUID userId, int weekNumber, int year);

    List<WeeklyLeaderboardEntity> findByWeekNumberAndYearAndLeagueTierOrderByWeeklyXpDesc(int weekNumber, int year, String leagueTier);
}
