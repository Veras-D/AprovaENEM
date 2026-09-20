package com.aprovaenem.auth.infrastructure.adapter.out.security;

import com.aprovaenem.auth.domain.port.out.PasswordEncoderPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Slf4j
@Component
public class BCryptPasswordEncoderAdapter implements PasswordEncoderPort {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private final PasswordEncoder passwordEncoder;
    private final String pepper;

    public BCryptPasswordEncoderAdapter(
            @Value("${auth.password-pepper:}") String pepper
    ) {
        this.passwordEncoder = new BCryptPasswordEncoder(10);
        this.pepper = (pepper != null && !pepper.isBlank()) ? pepper.trim() : "";
        if (this.pepper.isEmpty()) {
            log.warn("Application password pepper is not configured or is empty. Passwords will be processed using standard BCrypt without HMAC secret pepper.");
        }
    }

    public BCryptPasswordEncoderAdapter() {
        this("");
    }

    @Override
    public String encode(String rawPassword) {
        if (rawPassword == null) {
            throw new IllegalArgumentException("Raw password cannot be null");
        }
        String peppered = applyPepper(rawPassword);
        return passwordEncoder.encode(peppered);
    }

    @Override
    public boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }

        // 1. Primary check: verify against HMAC-SHA256 peppered password hash
        if (!pepper.isEmpty()) {
            String peppered = applyPepper(rawPassword);
            if (passwordEncoder.matches(peppered, encodedPassword)) {
                return true;
            }
        }

        // 2. Dual-check fallback: verify legacy unpeppered password for seamless backward compatibility
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    @Override
    public boolean isLegacyHash(String rawPassword, String encodedPassword) {
        if (pepper.isEmpty() || rawPassword == null || encodedPassword == null) {
            return false;
        }
        String peppered = applyPepper(rawPassword);
        // If it matches the peppered version, it's already using the pepper
        if (passwordEncoder.matches(peppered, encodedPassword)) {
            return false;
        }
        // If it matches unpeppered, it is a legacy hash that can be upgraded
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    private String applyPepper(String rawPassword) {
        if (pepper.isEmpty()) {
            return rawPassword;
        }
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKey = new SecretKeySpec(pepper.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(rawPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256 password pepper", e);
        }
    }
}
