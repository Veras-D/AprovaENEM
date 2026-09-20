package com.aprovaenem.notification.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDeviceTokenRequest {

    @NotBlank(message = "deviceToken is required")
    private String deviceToken;

    @NotBlank(message = "platform is required")
    @Pattern(regexp = "^(WEB_PUSH|ANDROID|IOS)$", message = "Platform must be WEB_PUSH, ANDROID, or IOS")
    private String platform;
}
