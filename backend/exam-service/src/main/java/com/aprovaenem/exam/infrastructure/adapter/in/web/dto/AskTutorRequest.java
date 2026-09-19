package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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

    @Size(max = 2000, message = "Message must not exceed 2000 characters.")
    @JsonAlias({"studentQuery", "prompt", "query"})
    private String message;

    public String getEffectiveMessage() {
        if (message != null && !message.isBlank()) {
            return message.trim();
        }
        return "";
    }
}
