package com.aprovaenem.auth.infrastructure.adapter.out.persistence.adapter;

import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.port.out.UserRepositoryPort;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository.SpringDataUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final SpringDataUserRepository userRepository;

    @Override
    public User save(User user) {
        UserEntity entity = toEntity(user);
        UserEntity saved = userRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmailVerificationToken(String token) {
        return userRepository.findByEmailVerificationToken(token).map(this::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private UserEntity toEntity(User user) {
        return UserEntity.builder()
                .id(user.getId())
                .email(user.getEmail())
                .passwordHash(user.getPasswordHash())
                .fullName(user.getFullName())
                .schoolType(user.getSchoolType())
                .targetDegree(user.getTargetDegree())
                .role(user.getRole())
                .isActive(user.isActive())
                .isEmailVerified(user.isEmailVerified())
                .emailVerificationToken(user.getEmailVerificationToken())
                .emailVerificationExpiresAt(user.getEmailVerificationExpiresAt())
                .passwordResetToken(user.getPasswordResetToken())
                .passwordResetExpiresAt(user.getPasswordResetExpiresAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private User toDomain(UserEntity entity) {
        return User.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .passwordHash(entity.getPasswordHash())
                .fullName(entity.getFullName())
                .schoolType(entity.getSchoolType())
                .targetDegree(entity.getTargetDegree())
                .role(entity.getRole())
                .isActive(entity.isActive())
                .isEmailVerified(entity.isEmailVerified())
                .emailVerificationToken(entity.getEmailVerificationToken())
                .emailVerificationExpiresAt(entity.getEmailVerificationExpiresAt())
                .passwordResetToken(entity.getPasswordResetToken())
                .passwordResetExpiresAt(entity.getPasswordResetExpiresAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
