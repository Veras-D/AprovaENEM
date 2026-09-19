package com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataUserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByEmailVerificationToken(String emailVerificationToken);

    boolean existsByEmail(String email);
}
