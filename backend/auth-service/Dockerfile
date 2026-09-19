# Multi-Stage Build Dockerfile for auth-service
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy parent and submodule descriptors for caching
COPY pom.xml .
COPY common-core/pom.xml common-core/
COPY frontend-api/pom.xml frontend-api/
COPY auth-service/pom.xml auth-service/
COPY exam-service/pom.xml exam-service/
COPY notification-service/pom.xml notification-service/

# Copy sources
COPY common-core/src common-core/src
COPY auth-service/src auth-service/src

# Package auth-service
RUN mvn clean package -pl common-core,auth-service -am -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/auth-service/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
