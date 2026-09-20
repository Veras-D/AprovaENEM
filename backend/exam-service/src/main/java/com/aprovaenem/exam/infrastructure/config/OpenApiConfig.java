package com.aprovaenem.exam.infrastructure.config;

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
    public OpenAPI examServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AprovaENEM — Examination, Assessment & Socratic AI API")
                        .description("Microservice managing the official INEP question bank, practice session simulation, "
                                + "instant evaluation, diagnostic skill radar calculation, and pgvector RAG-augmented Google Gemini Socratic AI Tutor.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AprovaENEM Engineering")
                                .email("contato@aprovaenem.com.br")
                                .url("https://github.com/Veras-D/AprovaENEM"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("/").description("Default Gateway / BFF Proxy")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Required Bearer JWT authentication for Socratic AI Tutor sessions and question status updates."))
                        .addSecuritySchemes("sessionIdAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-Session-Id")
                                .description("Anonymous practice session UUID header for guest students.")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .addSecurityItem(new SecurityRequirement().addList("sessionIdAuth"));
    }
}
