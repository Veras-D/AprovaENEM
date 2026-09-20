package com.aprovaenem.auth.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("User Domain Model Unit Tests")
class UserTest {

    @Test
    @DisplayName("Should build a complete student user with target degree and school type")
    void shouldBuildCompleteStudentUser() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();

        User user = User.builder()
                .id(id)
                .email("lucas.silva@escola.sp.gov.br")
                .passwordHash("$2a$12$e8Y4V...hash")
                .fullName("Lucas Silva")
                .schoolType(SchoolType.PUBLIC_SCHOOL)
                .targetDegree("Medicina - USP")
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .isEmailVerified(false)
                .emailVerificationToken("verify-token-123")
                .emailVerificationExpiresAt(now.plus(24, ChronoUnit.HOURS))
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getEmail()).isEqualTo("lucas.silva@escola.sp.gov.br");
        assertThat(user.getFullName()).isEqualTo("Lucas Silva");
        assertThat(user.getSchoolType()).isEqualTo(SchoolType.PUBLIC_SCHOOL);
        assertThat(user.getTargetDegree()).isEqualTo("Medicina - USP");
        assertThat(user.getRole()).isEqualTo(UserRole.ROLE_STUDENT);
        assertThat(user.isActive()).isTrue();
        assertThat(user.isEmailVerified()).isFalse();
        assertThat(user.getEmailVerificationToken()).isEqualTo("verify-token-123");
    }

    @ParameterizedTest(name = "UserRole: {0}")
    @EnumSource(UserRole.class)
    @DisplayName("Should support all platform roles (STUDENT, PREMIUM, ADMIN)")
    void shouldSupportAllRoles(UserRole role) {
        User user = User.builder()
                .role(role)
                .build();

        assertThat(user.getRole()).isEqualTo(role);
    }

    @ParameterizedTest(name = "SchoolType: {0}")
    @EnumSource(SchoolType.class)
    @DisplayName("Should support all socio-demographic school types (PUBLIC, PRIVATE, SCHOLARSHIP)")
    void shouldSupportAllSchoolTypes(SchoolType schoolType) {
        User user = User.builder()
                .schoolType(schoolType)
                .build();

        assertThat(user.getSchoolType()).isEqualTo(schoolType);
    }

    @Test
    @DisplayName("Should update email verification status and clear token upon confirmation")
    void shouldConfirmEmailVerification() {
        User user = User.builder()
                .email("mariana.souza@escola.rj.gov.br")
                .isEmailVerified(false)
                .emailVerificationToken("token-xyz")
                .build();

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);

        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getEmailVerificationToken()).isNull();
        assertThat(user.getEmailVerificationExpiresAt()).isNull();
    }
}
