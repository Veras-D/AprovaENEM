package com.aprovaenem.auth.infrastructure.adapter.in.web;

import com.aprovaenem.auth.domain.model.SchoolType;
import com.aprovaenem.auth.domain.model.User;
import com.aprovaenem.auth.domain.model.UserRole;
import com.aprovaenem.auth.domain.port.in.AuthUseCase;
import com.aprovaenem.auth.domain.port.in.EmailVerificationUseCase;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.LoginRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.RegisterRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.ResendVerificationRequest;
import com.aprovaenem.auth.infrastructure.adapter.in.web.dto.VerifyEmailRequest;
import com.aprovaenem.auth.infrastructure.adapter.out.security.CustomUserDetailsService;
import com.aprovaenem.auth.infrastructure.adapter.out.security.DelegatingAccessDeniedHandler;
import com.aprovaenem.auth.infrastructure.adapter.out.security.DelegatingAuthenticationEntryPoint;
import com.aprovaenem.auth.infrastructure.adapter.out.security.JwtAuthenticationFilter;
import com.aprovaenem.auth.infrastructure.adapter.out.security.JwtTokenProvider;
import com.aprovaenem.auth.infrastructure.adapter.out.security.SecurityConfig;
import com.aprovaenem.common.exception.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, DelegatingAuthenticationEntryPoint.class, DelegatingAccessDeniedHandler.class, GlobalExceptionHandler.class})
@DisplayName("AuthController WebMvc & Spring Security Integration Tests")
class AuthControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthUseCase authUseCase;

    @MockBean
    private EmailVerificationUseCase emailVerificationUseCase;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/auth/register should create user and return HTTP 201 Created")
    void shouldRegisterStudentSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();
        RegisterRequest request = new RegisterRequest();
        request.setEmail("pedro.santos@escola.gov.br");
        request.setPassword("Password123!");
        request.setFullName("Pedro Santos");
        request.setSchoolType(SchoolType.PUBLIC_SCHOOL);
        request.setTargetDegree("Medicina");

        User createdUser = User.builder()
                .id(userId)
                .email(request.getEmail())
                .fullName(request.getFullName())
                .schoolType(request.getSchoolType())
                .targetDegree(request.getTargetDegree())
                .role(UserRole.ROLE_STUDENT)
                .isEmailVerified(false)
                .build();

        AuthUseCase.AuthResult authResult = new AuthUseCase.AuthResult(createdUser, "jwt.token.sample", 86400L);

        when(authUseCase.register(eq(request.getEmail()), eq(request.getPassword()), eq(request.getFullName()), eq(request.getSchoolType()), eq(request.getTargetDegree())))
                .thenReturn(createdUser);
        when(authUseCase.login(eq(request.getEmail()), eq(request.getPassword())))
                .thenReturn(authResult);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId", is(userId.toString())))
                .andExpect(jsonPath("$.email", is("pedro.santos@escola.gov.br")))
                .andExpect(jsonPath("$.role", is("ROLE_STUDENT")))
                .andExpect(jsonPath("$.token", is("jwt.token.sample")))
                .andExpect(jsonPath("$.expiresInSeconds", is(86400)));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should return HTTP 400 with RFC 7807 problem details when email is invalid")
    void shouldReturnBadRequestWhenRegistrationEmailInvalid() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("not-an-email");
        request.setPassword("Password123!");
        request.setFullName("Pedro Santos");
        request.setSchoolType(SchoolType.PUBLIC_SCHOOL);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")))
                .andExpect(jsonPath("$.validationErrors[0].field", is("email")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should return HTTP 200 OK with JWT token")
    void shouldLoginSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();
        LoginRequest request = new LoginRequest();
        request.setEmail("beatriz@escola.gov.br");
        request.setPassword("SecurePassword123!");

        User user = User.builder()
                .id(userId)
                .email(request.getEmail())
                .fullName("Beatriz Lima")
                .role(UserRole.ROLE_STUDENT)
                .isEmailVerified(true)
                .build();

        AuthUseCase.AuthResult authResult = new AuthUseCase.AuthResult(user, "valid.jwt.token", 86400L);

        when(authUseCase.login(request.getEmail(), request.getPassword()))
                .thenReturn(authResult);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.toString())))
                .andExpect(jsonPath("$.token", is("valid.jwt.token")))
                .andExpect(jsonPath("$.expiresInSeconds", is(86400)));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should return HTTP 400 when invalid credentials are provided")
    void shouldReturnBadRequestOnLoginFailure() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("beatriz@escola.gov.br");
        request.setPassword("WrongPassword");

        when(authUseCase.login(request.getEmail(), request.getPassword()))
                .thenThrow(new BusinessException("Invalid email or credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Invalid email or credentials")));
    }

    @Test
    @WithMockUser(username = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", roles = "STUDENT")
    @DisplayName("GET /api/v1/auth/me should return HTTP 200 with current user profile when authenticated")
    void shouldGetCurrentUserProfileWhenAuthenticated() throws Exception {
        UUID userId = UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
        User user = User.builder()
                .id(userId)
                .email("student@escola.gov.br")
                .fullName("Aluno SISU")
                .schoolType(SchoolType.PUBLIC_SCHOOL)
                .targetDegree("Engenharia de Software")
                .role(UserRole.ROLE_STUDENT)
                .isEmailVerified(true)
                .createdAt(Instant.now())
                .build();

        when(authUseCase.getCurrentUser(userId)).thenReturn(user);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(userId.toString())))
                .andExpect(jsonPath("$.email", is("student@escola.gov.br")))
                .andExpect(jsonPath("$.role", is("ROLE_STUDENT")));
    }

    @Test
    @WithAnonymousUser
    @DisplayName("GET /api/v1/auth/me should return HTTP 401 Unauthorized when unauthenticated")
    void shouldReturnUnauthorizedForMeWhenAnonymous() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @WithMockUser(username = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", roles = "STUDENT")
    @DisplayName("GET /api/v1/auth/export should return HTTP 200 with LGPD Art. 18 data export payload")
    void shouldExportUserDataUnderLgpd() throws Exception {
        UUID userId = UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
        AuthUseCase.GamificationExport gamificationExport = new AuthUseCase.GamificationExport(
                2,
                "Calouro Iniciante",
                250,
                400,
                25.0,
                3,
                1,
                10,
                5,
                List.of(new AuthUseCase.BadgeExport(
                        "STREAK_3_DAYS",
                        "Começando Firme",
                        "3 dias de estudo",
                        "🔥",
                        true,
                        Instant.now()
                ))
        );

        AuthUseCase.UserDataExport export = new AuthUseCase.UserDataExport(
                userId,
                "student@escola.gov.br",
                "Aluno SISU",
                "PUBLIC_SCHOOL",
                "Engenharia",
                "ROLE_STUDENT",
                true,
                Instant.now(),
                Instant.now(),
                "LGPD Art. 18, V - Data Portability",
                "2026.1-v1.0",
                gamificationExport
        );

        when(authUseCase.exportUserData(userId)).thenReturn(export);

        mockMvc.perform(get("/api/v1/auth/export"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.toString())))
                .andExpect(jsonPath("$.email", is("student@escola.gov.br")))
                .andExpect(jsonPath("$.legalBasis", containsString("LGPD")))
                .andExpect(jsonPath("$.gamification.currentLevel", is(2)))
                .andExpect(jsonPath("$.gamification.currentXp", is(250)))
                .andExpect(jsonPath("$.gamification.streakDays", is(3)))
                .andExpect(jsonPath("$.gamification.badges[0].code", is("STREAK_3_DAYS")));
    }

    @Test
    @WithMockUser(username = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", roles = "STUDENT")
    @DisplayName("DELETE /api/v1/auth/me should return HTTP 204 No Content under LGPD Art. 18 right to erasure")
    void shouldDeleteAccountPermanently() throws Exception {
        UUID userId = UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");

        mockMvc.perform(delete("/api/v1/auth/me"))
                .andExpect(status().isNoContent());

        verify(authUseCase).deleteAccount(userId);
    }

    @Test
    @DisplayName("POST /api/v1/auth/verify-email should return HTTP 200 OK when token is valid")
    void shouldVerifyEmailSuccessfully() throws Exception {
        VerifyEmailRequest request = new VerifyEmailRequest();
        request.setToken("valid-verification-token-123");

        when(emailVerificationUseCase.verifyEmail(request.getToken())).thenReturn(true);

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailVerified", is(true)))
                .andExpect(jsonPath("$.message", containsString("Email address successfully verified")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/resend-verification should return HTTP 200 OK")
    void shouldResendVerificationSuccessfully() throws Exception {
        ResendVerificationRequest request = new ResendVerificationRequest();
        request.setEmail("student@escola.gov.br");

        when(emailVerificationUseCase.resendVerificationEmail(request.getEmail())).thenReturn(true);

        mockMvc.perform(post("/api/v1/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dispatched", is(true)))
                .andExpect(jsonPath("$.message", containsString("If an account with this email exists")));
    }
}
