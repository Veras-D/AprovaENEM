package com.aprovaenem.auth.infrastructure.adapter.out.persistence;

import com.aprovaenem.auth.domain.model.AnonymousSession;
import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.UserRole;
import com.aprovaenem.auth.domain.port.out.AnonymousSessionRepositoryPort;
import com.aprovaenem.auth.domain.port.out.GamificationRepositoryPort;
import com.aprovaenem.auth.domain.port.out.LeaderboardRedisPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@DisplayName("AuthRepository & Flyway PostgreSQL 16 Testcontainers Integration Test")
class AuthRepositoryAndFlywayIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("auth_db")
            .withUsername("aprovaenem_user")
            .withPassword("secret");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private ConnectionFactory connectionFactory;

    @MockBean
    private LeaderboardRedisPort leaderboardRedisPort;

    @Autowired
    private Flyway flyway;

    @Autowired
    private UserRepositoryPort userRepository;

    @Autowired
    private GamificationRepositoryPort gamificationRepository;

    @Autowired
    private AnonymousSessionRepositoryPort sessionRepository;

    @Test
    @DisplayName("Flyway migrations V1, V2, V3 should execute cleanly and seed data should be present")
    void shouldExecuteFlywayMigrationsAndVerifySeedData() {
        assertThat(flyway.info().applied()).isNotEmpty();
        assertThat(flyway.info().applied()).hasSizeGreaterThanOrEqualTo(3);

        Optional<User> seedStudent = userRepository.findByEmail("student@aprovaenem.com.br");
        assertThat(seedStudent).isPresent();
        assertThat(seedStudent.get().getFullName()).contains("Lucas Silva");
        assertThat(seedStudent.get().getRole()).isEqualTo(UserRole.ROLE_STUDENT);
        assertThat(seedStudent.get().getSchoolType()).isEqualTo(SchoolType.PUBLIC_SCHOOL);
        assertThat(seedStudent.get().isActive()).isTrue();
    }

    @Test
    @DisplayName("UserRepositoryAdapter should perform complete CRUD against real PostgreSQL 16")
    void shouldPersistAndRetrieveUserInPostgres() {
        String uniqueEmail = "mariana." + UUID.randomUUID().toString().substring(0, 8) + "@escola.sp.gov.br";
        User newUser = User.builder()
                .email(uniqueEmail)
                .passwordHash("$2a$10$hashedPasswordHereForIntegrationTest12345")
                .fullName("Mariana Costa")
                .schoolType(SchoolType.PUBLIC_SCHOOL)
                .targetDegree("Medicina")
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .isEmailVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        User saved = userRepository.save(newUser);
        assertThat(saved.getId()).isNotNull();

        Optional<User> retrieved = userRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getEmail()).isEqualTo(uniqueEmail);
        assertThat(retrieved.get().getFullName()).isEqualTo("Mariana Costa");
        assertThat(retrieved.get().getTargetDegree()).isEqualTo("Medicina");

        assertThat(userRepository.existsByEmail(uniqueEmail)).isTrue();
        assertThat(userRepository.existsByEmail("nonexistent@domain.com")).isFalse();

        retrieved.get().setFullName("Mariana Costa Santos");
        User updated = userRepository.save(retrieved.get());
        assertThat(updated.getFullName()).isEqualTo("Mariana Costa Santos");
    }

    @Test
    @DisplayName("GamificationRepositoryAdapter should manage student profile, XP, streak, and daily goal")
    void shouldManageGamificationProfileInPostgres() {
        UUID studentUserId = UUID.randomUUID();

        // Create parent user first for foreign key constraint
        User student = User.builder()
                .id(studentUserId)
                .email("student." + studentUserId + "@teste.com")
                .passwordHash("hashedPass")
                .fullName("Estudante Gamificado")
                .schoolType(SchoolType.PUBLIC_SCHOOL)
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .isEmailVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        User savedStudent = userRepository.save(student);
        UUID actualUserId = savedStudent.getId();

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(actualUserId)
                .currentLevel(1)
                .currentXp(0)
                .streakDays(3)
                .streakFreezeAvailable(1)
                .lastActivityDate(LocalDate.now())
                .dailyGoalQuestions(5)
                .dailyQuestionsCompleted(2)
                .optInReminders(true)
                .build();

        UserGamificationProfile savedProfile = gamificationRepository.saveProfile(profile);
        assertThat(savedProfile).isNotNull();
        assertThat(savedProfile.getUserId()).isEqualTo(actualUserId);

        Optional<UserGamificationProfile> found = gamificationRepository.findProfileByUserId(actualUserId);
        assertThat(found).isPresent();
        assertThat(found.get().getCurrentLevel()).isEqualTo(1);
        assertThat(found.get().getStreakDays()).isEqualTo(3);
        assertThat(found.get().getDailyGoalQuestions()).isEqualTo(5);

        // Update XP and level
        found.get().setCurrentXp(250);
        found.get().setCurrentLevel(2);
        gamificationRepository.saveProfile(found.get());

        Optional<UserGamificationProfile> updated = gamificationRepository.findProfileByUserId(actualUserId);
        assertThat(updated).isPresent();
        assertThat(updated.get().getCurrentXp()).isEqualTo(250);
        assertThat(updated.get().getCurrentLevel()).isEqualTo(2);
    }

    @Test
    @DisplayName("AnonymousSessionRepositoryAdapter should persist and claim guest sessions")
    void shouldPersistAndClaimAnonymousSessionInPostgres() {
        String sessionUuid = "anon-pg-" + UUID.randomUUID();
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.DAYS);

        AnonymousSession session = AnonymousSession.builder()
                .sessionUuid(sessionUuid)
                .ipHash("sha256_ip_hash_abc")
                .createdAt(Instant.now())
                .lastActiveAt(Instant.now())
                .expiresAt(expiresAt)
                .build();

        AnonymousSession saved = sessionRepository.save(session);
        assertThat(saved.getId()).isNotNull();

        Optional<AnonymousSession> found = sessionRepository.findBySessionUuid(sessionUuid);
        assertThat(found).isPresent();
        assertThat(found.get().getSessionUuid()).isEqualTo(sessionUuid);
        assertThat(found.get().getClaimedByUserId()).isNull();

        // Claim session post-registration
        UUID registeredUserId = UUID.fromString("22222222-2222-2222-2222-222222222222"); // seeded student
        found.get().setClaimedByUserId(registeredUserId);
        sessionRepository.save(found.get());

        Optional<AnonymousSession> claimed = sessionRepository.findBySessionUuid(sessionUuid);
        assertThat(claimed).isPresent();
        assertThat(claimed.get().getClaimedByUserId()).isEqualTo(registeredUserId);
    }
}
