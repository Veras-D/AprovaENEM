package com.aprovaenem.common;

import com.aprovaenem.common.dto.ApiResponse;
import com.aprovaenem.common.dto.ErrorResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Common DTO Unit Tests")
class ApiResponseTest {

    @Test
    @DisplayName("Should create successful ApiResponse using ok(data) factory")
    void shouldCreateOkResponse() {
        ApiResponse<String> response = ApiResponse.ok("test-data");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isEqualTo("test-data");
        assertThat(response.getMessage()).isNull();
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    @DisplayName("Should create successful ApiResponse using ok(message, data) factory")
    void shouldCreateOkResponseWithMessage() {
        ApiResponse<Integer> response = ApiResponse.ok("Operation completed", 42);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Operation completed");
        assertThat(response.getData()).isEqualTo(42);
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    @DisplayName("Should build complete ErrorResponse with validation errors")
    void shouldBuildErrorResponseWithValidationErrors() {
        ErrorResponse.ValidationError validationError = ErrorResponse.ValidationError.builder()
                .field("email")
                .rejectedValue("invalid-email")
                .message("Email must be valid")
                .build();

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(400)
                .error("Bad Request")
                .message("Validation failed")
                .path("/api/v1/auth/register")
                .traceId("trace-123")
                .validationErrors(List.of(validationError))
                .build();

        assertThat(errorResponse.getStatus()).isEqualTo(400);
        assertThat(errorResponse.getError()).isEqualTo("Bad Request");
        assertThat(errorResponse.getMessage()).isEqualTo("Validation failed");
        assertThat(errorResponse.getPath()).isEqualTo("/api/v1/auth/register");
        assertThat(errorResponse.getTraceId()).isEqualTo("trace-123");
        assertThat(errorResponse.getValidationErrors()).hasSize(1);
        assertThat(errorResponse.getValidationErrors().get(0).getField()).isEqualTo("email");
        assertThat(errorResponse.getValidationErrors().get(0).getRejectedValue()).isEqualTo("invalid-email");
    }
}
