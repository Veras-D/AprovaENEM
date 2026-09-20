package com.aprovaenem.exam.infrastructure.adapter.out.redis;

import com.aprovaenem.exam.domain.model.AiQuotaStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = {RedisAutoConfiguration.class, RedisTutorQuotaAdapter.class})
@Testcontainers
@DisplayName("RedisTutorQuotaAdapter Testcontainers Integration Test")
class RedisTutorQuotaIT {

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7.2-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        registry.add("spring.data.redis.password", () -> "");
    }

    @Autowired
    private RedisTutorQuotaAdapter tutorQuotaAdapter;

    @Test
    @DisplayName("ROLE_STUDENT should have 1 free consultation per day, enforced via Redis atomic increment")
    void shouldEnforceDailyQuotaForStandardStudent() {
        UUID studentId = UUID.randomUUID();

        // 1. Initial status: 1 daily limit, 0 used, 1 remaining
        AiQuotaStatus initial = tutorQuotaAdapter.getQuotaStatus(studentId, "ROLE_STUDENT");
        assertThat(initial.isUnlimited()).isFalse();
        assertThat(initial.getDailyLimit()).isEqualTo(1);
        assertThat(initial.getUsedToday()).isEqualTo(0);
        assertThat(initial.getRemainingToday()).isEqualTo(1);

        // 2. First consultation: acquisition succeeds
        boolean acquiredFirst = tutorQuotaAdapter.tryAcquireQuota(studentId, "ROLE_STUDENT");
        assertThat(acquiredFirst).isTrue();

        // 3. Status after 1st consultation: 1 used, 0 remaining
        AiQuotaStatus afterFirst = tutorQuotaAdapter.getQuotaStatus(studentId, "ROLE_STUDENT");
        assertThat(afterFirst.getUsedToday()).isEqualTo(1);
        assertThat(afterFirst.getRemainingToday()).isEqualTo(0);

        // 4. Second consultation on same day: acquisition fails (quota exhausted)
        boolean acquiredSecond = tutorQuotaAdapter.tryAcquireQuota(studentId, "ROLE_STUDENT");
        assertThat(acquiredSecond).isFalse();
    }

    @Test
    @DisplayName("ROLE_PREMIUM_STUDENT should bypass daily quota and have unlimited access")
    void shouldAllowUnlimitedConsultationsForPremiumStudent() {
        UUID premiumStudentId = UUID.randomUUID();

        AiQuotaStatus status = tutorQuotaAdapter.getQuotaStatus(premiumStudentId, "ROLE_PREMIUM_STUDENT");
        assertThat(status.isUnlimited()).isTrue();

        // Premium student can acquire multiple times without restriction
        assertThat(tutorQuotaAdapter.tryAcquireQuota(premiumStudentId, "ROLE_PREMIUM_STUDENT")).isTrue();
        assertThat(tutorQuotaAdapter.tryAcquireQuota(premiumStudentId, "ROLE_PREMIUM_STUDENT")).isTrue();
        assertThat(tutorQuotaAdapter.tryAcquireQuota(premiumStudentId, "ROLE_PREMIUM_STUDENT")).isTrue();
    }

    @Test
    @DisplayName("Quotas should be strictly isolated per user key in Redis")
    void shouldIsolateQuotasBetweenDifferentUsers() {
        UUID studentA = UUID.randomUUID();
        UUID studentB = UUID.randomUUID();

        // Student A exhausts quota
        assertThat(tutorQuotaAdapter.tryAcquireQuota(studentA, "ROLE_STUDENT")).isTrue();
        assertThat(tutorQuotaAdapter.tryAcquireQuota(studentA, "ROLE_STUDENT")).isFalse();

        // Student B still has full quota available
        AiQuotaStatus statusB = tutorQuotaAdapter.getQuotaStatus(studentB, "ROLE_STUDENT");
        assertThat(statusB.getRemainingToday()).isEqualTo(1);
        assertThat(tutorQuotaAdapter.tryAcquireQuota(studentB, "ROLE_STUDENT")).isTrue();
    }
}
