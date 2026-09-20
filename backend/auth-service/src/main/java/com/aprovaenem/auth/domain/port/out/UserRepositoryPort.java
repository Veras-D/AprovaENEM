package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.auth.domain.model.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepositoryPort {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    boolean existsByEmail(String email);

    void deleteById(UUID id);
}
