package com.aprovaenem.auth.application.service;

import com.aprovaenem.auth.domain.model.AchievementBadge;
import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserGamificationProfile;
import com.aprovaenem.auth.domain.model.UserRole;
import com.aprovaenem.auth.domain.port.in.AuthUseCase;
import com.aprovaenem.auth.domain.port.out.GamificationRepositoryPort;
import com.aprovaenem.auth.domain.port.out.OutboxRepositoryPort;
import com.aprovaenem.auth.domain.port.out.PasswordEncoderPort;
import com.aprovaenem.auth.domain.port.out.TokenProviderPort;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Application Service Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepositoryPort userRepository;

    @Mock
    private OutboxRepositoryPort outboxRepository;

    @Mock
    private GamificationRepositoryPort gamificationRepository;

    @Mock
    private PasswordEncoderPort passwordEncoder;

    @Mock
    private TokenProviderPort tokenProvider;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Should successfully register student user and publish outbox events")
    void shouldRegisterStudentSuccessfully() {
        String email = "mariana.souza@escola.gov.br";
        String rawPassword = "SecurePassword123!";
        String fullName = "Mariana Souza";
        SchoolType schoolType = SchoolType.PUBLIC_SCHOOL;
        String targetDegree = "Direito - UFRJ";

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        User registered = authService.register(email, rawPassword, fullName, schoolType, targetDegree);

        assertThat(registered).isNotNull();
        assertThat(registered.getId()).isNotNull();
        assertThat(registered.getEmail()).isEqualTo(email);
        assertThat(registered.getFullName()).isEqualTo(fullName);
        assertThat(registered.getSchoolType()).isEqualTo(SchoolType.PUBLIC_SCHOOL);
        assertThat(registered.getRole()).isEqualTo(UserRole.ROLE_STUDENT);
        assertThat(registered.isActive()).isTrue();
        assertThat(registered.isEmailVerified()).isFalse();
        assertThat(registered.getEmailVerificationToken()).isNotNull();

        verify(userRepository).save(any(User.class));
        // Verifies both UserRegisteredEvent and EmailVerificationRequestedEvent are dispatched to transactional outbox
        verify(outboxRepository, times(2)).save(any());
    }

    @Test
    @DisplayName("Should throw BusinessException when registering an email that already exists")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        String email = "existing@escola.gov.br";
        when(userRepository.existsByEmail(email)).thenReturn(true);

        assertThatThrownBy(() -> authService.register(email, "pass123", "Nome", SchoolType.PUBLIC_SCHOOL, "Med"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
        verify(outboxRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should login successfully with valid credentials and return JWT token")
    void shouldLoginSuccessfully() {
        String email = "lucas@escola.gov.br";
        String rawPassword = "ValidPassword123";
        String passwordHash = "$2a$12$hashed";

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash(passwordHash)
                .fullName("Lucas Silva")
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, passwordHash)).thenReturn(true);
        when(tokenProvider.generateToken(user)).thenReturn("jwt.token.here");
        when(tokenProvider.getExpirationSeconds()).thenReturn(86400L);

        AuthUseCase.AuthResult result = authService.login(email, rawPassword);

        assertThat(result).isNotNull();
        assertThat(result.token()).isEqualTo("jwt.token.here");
        assertThat(result.expiresInSeconds()).isEqualTo(86400L);
        assertThat(result.user().getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should seamlessly upgrade legacy unpeppered password hash to peppered on login")
    void shouldSeamlesslyUpgradeLegacyPasswordHashOnLogin() {
        String email = "legacy@escola.gov.br";
        String rawPassword = "OldPassword123!";
        String legacyHash = "$2a$10$oldLegacyUnpepperedHash";
        String pepperedHash = "$2a$10$newPepperedHashWithHmac";

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash(legacyHash)
                .fullName("Aluno Antigo")
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, legacyHash)).thenReturn(true);
        when(passwordEncoder.isLegacyHash(rawPassword, legacyHash)).thenReturn(true);
        when(passwordEncoder.encode(rawPassword)).thenReturn(pepperedHash);
        when(tokenProvider.generateToken(user)).thenReturn("jwt.token.migrated");
        when(tokenProvider.getExpirationSeconds()).thenReturn(86400L);

        AuthUseCase.AuthResult result = authService.login(email, rawPassword);

        assertThat(result).isNotNull();
        assertThat(result.token()).isEqualTo("jwt.token.migrated");
        assertThat(user.getPasswordHash()).isEqualTo(pepperedHash);
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should throw BusinessException when logging in with incorrect password")
    void shouldThrowExceptionWhenPasswordIncorrect() {
        String email = "lucas@escola.gov.br";
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash("$2a$12$hashed")
                .isActive(true)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(email, "WrongPassword"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid email or credentials");

        verify(tokenProvider, never()).generateToken(any());
    }

    @Test
    @DisplayName("Should throw BusinessException when account is deactivated")
    void shouldThrowExceptionWhenAccountDeactivated() {
        String email = "deactivated@escola.gov.br";
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash("$2a$12$hashed")
                .isActive(false) // deactivated
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", user.getPasswordHash())).thenReturn(true);

        assertThatThrownBy(() -> authService.login(email, "pass"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("deactivated");
    }

    @Test
    @DisplayName("Should export user data under LGPD Art. 18 data portability")
    void shouldExportUserDataUnderLgpd() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("student@escola.gov.br")
                .fullName("Estudante LGPD")
                .schoolType(SchoolType.PUBLIC_SCHOOL)
                .targetDegree("Engenharia")
                .role(UserRole.ROLE_STUDENT)
                .isEmailVerified(true)
                .isActive(true)
                .build();

        UserGamificationProfile profile = UserGamificationProfile.builder()
                .userId(userId)
                .currentLevel(3)
                .currentXp(540)
                .streakDays(5)
                .streakFreezeAvailable(1)
                .dailyGoalQuestions(10)
                .dailyQuestionsCompleted(8)
                .build();

        AchievementBadge badge = AchievementBadge.builder()
                .code("STREAK_7_DAYS")
                .name("Guerreiro da Semana")
                .description("Estudou 7 dias consecutivos")
                .icon("🔥")
                .unlocked(true)
                .unlockedAt(Instant.now())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.of(profile));
        when(gamificationRepository.findBadgesByUserId(userId)).thenReturn(List.of(badge));

        AuthUseCase.UserDataExport export = authService.exportUserData(userId);

        assertThat(export).isNotNull();
        assertThat(export.userId()).isEqualTo(userId);
        assertThat(export.email()).isEqualTo("student@escola.gov.br");
        assertThat(export.legalBasis()).contains("LGPD");
        assertThat(export.exportTimestamp()).isNotNull();
        assertThat(export.gamification()).isNotNull();
        assertThat(export.gamification().currentLevel()).isEqualTo(3);
        assertThat(export.gamification().currentXp()).isEqualTo(540);
        assertThat(export.gamification().streakDays()).isEqualTo(5);
        assertThat(export.gamification().badges()).hasSize(1);
        assertThat(export.gamification().badges().get(0).code()).isEqualTo("STREAK_7_DAYS");
    }

    @Test
    @DisplayName("Should export user data with default gamification profile when profile not found")
    void shouldExportUserDataWithDefaultGamificationWhenProfileNotFound() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("newbie@escola.gov.br")
                .fullName("Novo Aluno")
                .schoolType(SchoolType.PUBLIC_SCHOOL)
                .targetDegree("Medicina")
                .role(UserRole.ROLE_STUDENT)
                .isEmailVerified(false)
                .isActive(true)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(gamificationRepository.findProfileByUserId(userId)).thenReturn(Optional.empty());
        when(gamificationRepository.findBadgesByUserId(userId)).thenReturn(List.of());

        AuthUseCase.UserDataExport export = authService.exportUserData(userId);

        assertThat(export).isNotNull();
        assertThat(export.gamification()).isNotNull();
        assertThat(export.gamification().currentLevel()).isEqualTo(1);
        assertThat(export.gamification().currentXp()).isEqualTo(0);
        assertThat(export.gamification().badges()).isEmpty();
    }

    @Test
    @DisplayName("Should delete user account permanently under LGPD Art. 18 right to erasure")
    void shouldDeleteAccountPermanently() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("delete.me@escola.gov.br")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        authService.deleteAccount(userId);

        ArgumentCaptor<OutboxEvent> outboxCaptor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(outboxCaptor.capture());
        OutboxEvent outboxEvent = outboxCaptor.getValue();
        assertThat(outboxEvent.getEventType()).isEqualTo("UserDeletedEvent");
        assertThat(outboxEvent.getAggregateId()).isEqualTo(userId);
        assertThat(outboxEvent.getPayload()).contains("delete.me@escola.gov.br");
        assertThat(outboxEvent.getPayload()).contains("Art. 18, VI da Lei 13.709/2018 (LGPD)");

        verify(userRepository).deleteById(userId);
    }
}
