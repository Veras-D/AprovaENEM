package com.aprovaenem.auth.infrastructure.adapter.in.web.dto;

import com.aprovaenem.auth.domain.model.SchoolType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    private SchoolType schoolType;

    @Size(max = 100, message = "Target degree cannot exceed 100 characters")
    private String targetDegree;

    private String currentPassword;

    @Size(min = 8, max = 100, message = "New password must be between 8 and 100 characters")
    private String newPassword;
}
