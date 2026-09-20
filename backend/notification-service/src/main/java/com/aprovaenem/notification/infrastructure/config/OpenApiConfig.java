package com.aprovaenem.notification.infrastructure.config;

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
    public OpenAPI notificationServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AprovaENEM — Multi-Channel Notification API")
                        .description("Microservice managing device push token registration (Web Push, Android FCM, iOS APNs), "
                                + "student in-app notifications inbox, unread badges, and RabbitMQ event-driven study reminder alerts.")
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
                                .description("Standard Bearer JWT token required for user notification feed, "
                                        + "device token registration, and read status updates.")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
