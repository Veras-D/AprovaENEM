package com.aprovaenem.exam.infrastructure.adapter.in.web;

import com.aprovaenem.common.dto.ErrorResponse;
import com.aprovaenem.common.exception.BusinessException;
import com.aprovaenem.common.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(com.aprovaenem.exam.domain.model.RegistrationRequiredException.class)
    public ResponseEntity<java.util.Map<String, Object>> handleRegistrationRequiredException(
            com.aprovaenem.exam.domain.model.RegistrationRequiredException ex, HttpServletRequest request) {
        log.warn("Unauthorized AI tutor access on [{}]: {}", request.getRequestURI(), ex.getMessage());

        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("type", "https://aprovaenem.org/errors/REGISTRATION_REQUIRED_FOR_AI");
        body.put("title", "Registration Required For AI Tutor");
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("detail", ex.getMessage());
        body.put("signupUrl", "https://aprovaenem.com.br/register");
        body.put("path", request.getRequestURI());
        body.put("timestamp", Instant.now());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(com.aprovaenem.exam.domain.model.DailyQuotaExceededException.class)
    public ResponseEntity<java.util.Map<String, Object>> handleDailyQuotaExceededException(
            com.aprovaenem.exam.domain.model.DailyQuotaExceededException ex, HttpServletRequest request) {
        log.warn("Daily AI quota exhausted on [{}]: {}", request.getRequestURI(), ex.getMessage());

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        if (ex.getQuotaStatus() != null) {
            headers.add("X-AI-Quota-Limit", String.valueOf(ex.getQuotaStatus().getDailyLimit()));
            headers.add("X-AI-Quota-Remaining", String.valueOf(ex.getQuotaStatus().getRemainingToday()));
            headers.add("X-AI-Quota-Reset", ex.getQuotaStatus().getResetsAt().toString());
        }

        java.util.Map<String, Object> quotaMap = new java.util.HashMap<>();
        if (ex.getQuotaStatus() != null) {
            quotaMap.put("dailyLimit", ex.getQuotaStatus().getDailyLimit());
            quotaMap.put("usedToday", ex.getQuotaStatus().getUsedToday());
            quotaMap.put("remainingToday", ex.getQuotaStatus().getRemainingToday());
            quotaMap.put("resetsAt", ex.getQuotaStatus().getResetsAt());
        }

        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("type", "https://aprovaenem.org/errors/DAILY_AI_QUOTA_EXHAUSTED");
        body.put("title", "Daily AI Tutor Quota Exhausted");
        body.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        body.put("detail", ex.getMessage());
        body.put("quota", quotaMap);
        body.put("upgradeUrl", "https://aprovaenem.com.br/pro");
        body.put("path", request.getRequestURI());
        body.put("timestamp", Instant.now());

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).headers(headers).body(body);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        log.warn("Business validation error on [{}]: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found on [{}]: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
            NoResourceFoundException ex, HttpServletRequest request) {
        log.warn("Path not found on [{}]: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message("The requested endpoint was not found on this server.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ErrorResponse.ValidationError> validationErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toValidationError)
                .toList();

        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("One or more request parameters failed validation.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .validationErrors(validationErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Malformed HTTP request body on [{}]: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "Malformed request body.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled error on [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private ErrorResponse.ValidationError toValidationError(FieldError fieldError) {
        return ErrorResponse.ValidationError.builder()
                .field(fieldError.getField())
                .rejectedValue(fieldError.getRejectedValue() != null ? fieldError.getRejectedValue().toString() : null)
                .message(fieldError.getDefaultMessage())
                .build();
    }
}
