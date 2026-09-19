# Multi-Stage Build Dockerfile for notification-service
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY common-core/pom.xml common-core/
COPY frontend-api/pom.xml frontend-api/
COPY auth-service/pom.xml auth-service/
COPY exam-service/pom.xml exam-service/
COPY notification-service/pom.xml notification-service/

COPY common-core/src common-core/src
COPY notification-service/src notification-service/src

RUN mvn clean package -pl common-core,notification-service -am -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/notification-service/target/*.jar app.jar

EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
