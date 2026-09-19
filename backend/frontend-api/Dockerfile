# Multi-Stage Build Dockerfile for frontend-api
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy parent and submodule descriptors for optimized layer caching
COPY pom.xml .
COPY common-core/pom.xml common-core/
COPY frontend-api/pom.xml frontend-api/
COPY auth-service/pom.xml auth-service/
COPY exam-service/pom.xml exam-service/
COPY notification-service/pom.xml notification-service/

# Copy sources for common-core and frontend-api
COPY common-core/src common-core/src
COPY frontend-api/src frontend-api/src

# Package frontend-api
RUN mvn clean package -pl common-core,frontend-api -am -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Security: Run as unprivileged user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/frontend-api/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
