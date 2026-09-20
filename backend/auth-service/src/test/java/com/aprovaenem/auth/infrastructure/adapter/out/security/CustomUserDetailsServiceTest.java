package com.aprovaenem.auth.infrastructure.adapter.out.security;

import com.aprovaenem.auth.domain.model.UserRole;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomUserDetailsService Unit Tests")
class CustomUserDetailsServiceTest {

    @Mock
    private SpringDataUserRepository userRepository;

    private CustomUserDetailsService service;

    @BeforeEach
    void setUp() {
        service = new CustomUserDetailsService(userRepository);
    }

    @Test
    @DisplayName("Should load user by UUID string")
    void shouldLoadUserByUuid() {
        UUID userId = UUID.randomUUID();
        UserEntity user = UserEntity.builder()
                .id(userId)
                .email("student@enem.com.br")
                .passwordHash("hashedPass")
                .role(UserRole.ROLE_STUDENT)
                .isActive(true)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserDetails details = service.loadUserByUsername(userId.toString());
        assertThat(details.getUsername()).isEqualTo(userId.toString());
        assertThat(details.getPassword()).isEqualTo("hashedPass");
        assertThat(details.isEnabled()).isTrue();
        assertThat(details.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
    }

    @Test
    @DisplayName("Should load user by email string when username is not a valid UUID")
    void shouldLoadUserByEmail() {
        UUID userId = UUID.randomUUID();
        UserEntity user = UserEntity.builder()
                .id(userId)
                .email("student@enem.com.br")
                .passwordHash("hashedPass")
                .role(UserRole.ROLE_ADMIN)
                .isActive(true)
                .build();

        when(userRepository.findByEmail("student@enem.com.br")).thenReturn(Optional.of(user));

        UserDetails details = service.loadUserByUsername("STUDENT@ENEM.COM.BR");
        assertThat(details.getUsername()).isEqualTo(userId.toString());
        assertThat(details.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when user UUID not found")
    void shouldThrowWhenUuidNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername(userId.toString()))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found with id: " + userId);
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when email not found")
    void shouldThrowWhenEmailNotFound() {
        when(userRepository.findByEmail("unknown@enem.com.br")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("unknown@enem.com.br"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found with email: unknown@enem.com.br");
    }
}
