package com.aprovaenem.auth.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI authServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AprovaENEM — Identity, Authentication & Gamification API")
                        .description("Microservice managing user authentication, stateless JWT tokens, "
                                + "anonymous study sessions, XP progression, daily study streaks, and Redis-backed weekly league leaderboards.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AprovaENEM Engineering")
                                .email("contato@aprovaenem.com.br")
                                .url("https://github.com/Veras-D/AprovaENEM"))
                        .license(new License()
                                .name("PolyForm Noncommercial License 1.0.0")
                                .url("https://polyformproject.org/licenses/noncommercial/1.0.0")))
                .servers(List.of(
                        new Server().url("/").description("Default Gateway / BFF Proxy")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Standard Bearer JWT authentication for registered students (ROLE_STUDENT, ROLE_PREMIUM_STUDENT, ROLE_ADMIN)."))
                        .addSecuritySchemes("sessionIdAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-Session-Id")
                                .description("Anonymous practice session UUID header for guest students.")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .addSecurityItem(new SecurityRequirement().addList("sessionIdAuth"));
    }
}
