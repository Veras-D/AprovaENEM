package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AskTutorRequest {

    @NotBlank(message = "Message cannot be empty.")
    @Size(max = 2000, message = "Message must not exceed 2000 characters.")
    private String message;
}
