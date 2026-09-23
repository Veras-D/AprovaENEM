package com.aprovaenem.notification.infrastructure.persistence.repository;

import com.aprovaenem.notification.infrastructure.persistence.entity.UserDeviceTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceTokenEntity, UUID> {

    List<UserDeviceTokenEntity> findByUserIdAndIsActiveTrue(UUID userId);

    Optional<UserDeviceTokenEntity> findByDeviceToken(String deviceToken);

    @Modifying
    @Transactional
    void deleteByUserId(UUID userId);
}
