package com.aprovaenem.auth.infrastructure.adapter.out.security;

import com.aprovaenem.auth.domain.model.PasswordVerificationResult;
import com.aprovaenem.auth.domain.port.out.PasswordEncoderPort;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;

@Slf4j
@Component
public class BCryptPasswordEncoderAdapter implements PasswordEncoderPort {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private final PasswordEncoder passwordEncoder;
    private final String pepper;

    @Autowired(required = false)
    private Environment environment;

    @Autowired
    public BCryptPasswordEncoderAdapter(
            @Value("${auth.password-pepper:}") String pepper
    ) {
        this.passwordEncoder = new BCryptPasswordEncoder(10);
        this.pepper = (pepper != null && !pepper.isBlank()) ? pepper.trim() : "";
        if (this.pepper.isEmpty()) {
            log.warn("Application password pepper is not configured or is empty. "
                    + "Passwords will be processed using standard BCrypt without HMAC secret pepper.");
        }
    }

    @PostConstruct
    public void validatePepper() {
        if (this.pepper.isEmpty()) {
            boolean isTest = environment != null && Arrays.asList(environment.getActiveProfiles()).contains("test");
            if (!isTest) {
                throw new IllegalStateException("Production security violation: auth.password-pepper must be configured in non-test profiles.");
            }
        }
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
    public PasswordVerificationResult verify(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return PasswordVerificationResult.failed();
        }

        // 1. Primary check: verify against HMAC-SHA256 peppered password hash
        if (!pepper.isEmpty()) {
            String peppered = applyPepper(rawPassword);
            if (passwordEncoder.matches(peppered, encodedPassword)) {
                return PasswordVerificationResult.matched();
            }
        }

        // 2. Dual-check fallback: verify legacy unpeppered password for seamless backward compatibility
        if (passwordEncoder.matches(rawPassword, encodedPassword)) {
            return pepper.isEmpty() ? PasswordVerificationResult.matched() : PasswordVerificationResult.upgradeNeeded();
        }

        return PasswordVerificationResult.failed();
    }

    @Override
    public boolean matches(String rawPassword, String encodedPassword) {
        return verify(rawPassword, encodedPassword).matches();
    }

    @Override
    public boolean isLegacyHash(String rawPassword, String encodedPassword) {
        return verify(rawPassword, encodedPassword).needsUpgrade();
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
