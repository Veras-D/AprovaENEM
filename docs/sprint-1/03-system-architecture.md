# System Architecture & Topology — AprovaENEM

> **Architecture Style**: Microservices with Hexagonal Architecture (Ports & Adapters)  
> **Ingress & Perimeter**: Nginx Load Balancer + Spring Cloud Gateway with Token Bucket Rate Limiter  
> **Backend Framework**: Java 21 LTS + Spring Boot 3.3+  
> **Persistence**: PostgreSQL 16  
> **Telemetry**: Prometheus + Micrometer Tracing (Datadog-style root-cause diagnostics)  

---

## 1. Global Topology & C4 Container Architecture

The system is deployed as a resilient, containerized multi-service ecosystem. Incoming public traffic passes through an outer Nginx perimeter proxy, moves through an authenticated and rate-limited API Gateway, and is dispatched to the downstream microservices.

```mermaid
flowchart TD
    User([📱 Student Client / Browser])
    
    subgraph DockerComposePlatform ["Unified Docker Compose Platform"]
        subgraph Perimeter ["Edge & Perimeter Ingress"]
            LB["🛡️ Nginx Load Balancer / Reverse Proxy<br/>Port 80/443<br/>• Routes / to Frontend<br/>• Routes /api/** to Gateway"]
            APIGW["⚡ Spring Cloud API Gateway (Port 8080)<br/>• Route Dispatcher<br/>• Token Bucket Rate Limiter (Redis/Memory)<br/>• W3C Distributed Trace Injector (`traceId`)<br/>• Dual-Auth Evaluator (Anonymous vs JWT)"]
        end

        subgraph FrontendLayer ["Frontend Container"]
            FrontendUI["🖥️ frontend (Port 80/internal)<br/>React 18 + TypeScript PWA / Nginx Static Serve"]
        end

        subgraph Services ["Microservices Layer (Hexagonal Architecture)"]
            AuthSvc["🔐 Auth & Identity Service (Port 8081)<br/>• Anonymous Session Provisioning<br/>• Student JWT Registration & Login<br/>• Profile Management"]
            ExamSvc["📚 Exam & Assessment Service (Port 8082)<br/>• Question Bank & INEP Taxonomy<br/>• Practice Session State Machine<br/>• Automated Grading & Scoring<br/>• Diagnostic Weak-Spot Engine<br/>• Socratic Question Resolution (Google Gemini)"]
        end

        subgraph DataLayer ["Persistence & Cache Layer"]
            PostgresAuth[("🗄️ PostgreSQL (Auth DB)<br/>Port 5432 - users, credentials")]
            PostgresExam[("🗄️ PostgreSQL (Exam DB)<br/>Port 5433 - questions, sessions, attempts")]
        end

        subgraph ObservabilityStack ["Observability & Diagnostics Stack"]
            Prometheus["📊 Prometheus Server (Port 9090)<br/>Scrapes `/actuator/prometheus`"]
            Grafana["📈 Grafana Dashboard (Port 3001)<br/>APM Latency & Error Heatmaps"]
        end
    end

    subgraph ExternalAI ["External AI Intelligence"]
        GeminiAPI["🤖 Google Gemini API<br/>gemini-1.5-flash Socratic Explanations"]
    end

    User -->|HTTP / HTTPS Port 80| LB
    LB -->|/| FrontendUI
    LB -->|/api/**| APIGW
    
    APIGW -->|`/api/v1/auth/**`| AuthSvc
    APIGW -->|`/api/v1/exams/**`<br/>`/api/v1/sessions/**`<br/>`/api/v1/questions/**`| ExamSvc

    AuthSvc --> PostgresAuth
    ExamSvc --> PostgresExam
    ExamSvc -.->|Step-by-step resolution & Socratic hints| GeminiAPI

    APIGW -.->|Metrics Scraping| Prometheus
    AuthSvc -.->|Metrics Scraping| Prometheus
    ExamSvc -.->|Metrics Scraping| Prometheus
    Prometheus --> Grafana
```

---

## 2. Ingress, Perimeter & Rate Limiting Strategy

### Nginx Perimeter
The front-facing Nginx container acts as the L7 reverse proxy, providing:
1. **Request Buffering**: Absorbs slow mobile client uploads, freeing application threads.
2. **Security Headers**: Injects HTTP security headers (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).
3. **Keep-Alive Connection Pooling**: Maintains persistent upstream connections to the Spring Cloud Gateway.

### API Gateway & Token Bucket Rate Limiting
To protect the backend from denial-of-service, aggressive question scraping, and exhaustion of upstream **Google Gemini API rate limits and quotas**, the Gateway enforces a **Token Bucket** rate limiting algorithm:

```mermaid
stateDiagram-v2
    [*] --> RequestArrived : Client Request Arrives
    RequestArrived --> CheckBucket : Inspect IP / Session Bucket
    
    state CheckBucket <<choice>>
    CheckBucket --> DeductToken : Tokens Available (>= 1)
    CheckBucket --> DropRequest : Bucket Empty (Tokens = 0)
    
    DeductToken --> DispatchUpstream : Forward to Microservice (200 OK)
    DropRequest --> Return429 : Return HTTP 429 Too Many Requests
    Return429 --> [*]
    DispatchUpstream --> [*]
```

#### Rate Limiting Policies
1. **General Examination Routes** (`GET /api/v1/questions/**`):
   - Capacity: **60 tokens**.
   - Refill Rate: **1 token / second** (allows bursts up to 60 req/min).
2. **AI Tutor Inquiries** (`POST /api/v1/questions/{id}/ask`):
   - Capacity: **10 tokens**.
   - Refill Rate: **10 tokens / minute** (strict guardrail protecting upstream LLM API consumption and rate limits).
3. **HTTP 429 Payload Structure**:
   ```json
   {
     "error": "TOO_MANY_REQUESTS",
     "message": "Rate limit exceeded. Please wait before asking another question.",
     "retryAfterSeconds": 15,
     "timestamp": "2026-09-17T19:30:00Z"
   }
   ```

---

## 3. Hexagonal Architecture (Ports and Adapters)

Both microservices (`auth-service` and `exam-service`) strictly adhere to **Hexagonal Architecture**. Business logic resides in a pure Java domain layer with zero dependencies on Spring Boot, JPA, or web frameworks.

```mermaid
flowchart TD
    subgraph Infrastructure_In ["Infrastructure (Inbound Adapters)"]
        RestCtrl["🌐 Web REST Controller<br/>(`QuestionController`)"]
        DTO["📦 Request / Response DTOs"]
    end

    subgraph Application_In ["Application Layer (Inbound Ports)"]
        InPort["📥 Inbound Port / Use Case<br/>(`SubmitAnswerUseCase`, `GetQuestionQuery`)"]
    end

    subgraph CoreDomain ["Hexagon Core (Pure Domain)"]
        DomainService["⚙️ Application Service<br/>(`AssessmentService`)"]
        Entities["🏛️ Domain Entities & Rules<br/>(`Question`, `Attempt`, `ScorePolicy`)"]
        Exceptions["⚠️ Domain Exceptions<br/>(`QuestionNotFoundException`)"]
    end

    subgraph Application_Out ["Application Layer (Outbound Ports)"]
        RepoPort["📤 Outbound Port: Repository<br/>(`QuestionRepositoryPort`)"]
        AIPort["📤 Outbound Port: Tutor AI<br/>(`TutorAiPort`)"]
    end

    subgraph Infrastructure_Out ["Infrastructure (Outbound Adapters)"]
        JPAAdapter["🗄️ Spring Data JPA Adapter<br/>(`PostgresQuestionRepository`)"]
        GeminiAdapter["🤖 Gemini AI Tutor Adapter<br/>(`GeminiTutorClient`)"]
    end

    RestCtrl --> DTO
    DTO --> InPort
    InPort --> DomainService
    DomainService --> Entities
    DomainService --> Exceptions
    DomainService --> RepoPort
    DomainService --> AIPort
    RepoPort --> JPAAdapter
    AIPort --> GeminiAdapter
```

### Standardized Package Layout
```text
com.openenem.assessment/
├── domain/                      # PURE JAVA (No Spring, No JPA)
│   ├── model/
│   │   ├── Question.java        # Aggregate root
│   │   ├── Option.java          # Value object (A, B, C, D, E)
│   │   ├── ExamSession.java     # Session entity with lifecycle states
│   │   ├── Attempt.java         # Student answer submission
│   │   └── DiagnosticReport.java# Performance calculation & weak topics
│   └── exception/
│       ├── DomainException.java
│       └── SessionCompletedException.java
├── application/                 # USE CASES & INTERFACES
│   ├── port/
│   │   ├── in/                  # Driving / Inbound Ports
│   │   │   ├── StartSessionUseCase.java
│   │   │   ├── SubmitAnswerUseCase.java
│   │   │   ├── GetDiagnosticReportUseCase.java
│   │   │   └── AskTutorQuestionUseCase.java
│   │   └── out/                 # Driven / Outbound Ports (SPIs)
│   │       ├── QuestionRepositoryPort.java
│   │       ├── ExamSessionRepositoryPort.java
│   │       └── TutorAiPort.java
│   └── service/                 # Orchestrators
│       ├── AssessmentApplicationService.java
│       └── TutorApplicationService.java
└── infrastructure/              # FRAMEWORK ADAPTERS (Spring Boot, JPA, HTTP)
    ├── adapter/
    │   ├── in/web/
    │   │   ├── QuestionRestController.java
    │   │   ├── ExamSessionRestController.java
    │   │   ├── dto/             # Web DTOs & Validation annotations
    │   │   └── GlobalExceptionHandler.java
    │   ├── out/persistence/
    │   │   ├── entity/          # JPA @Entity models (Postgres tables)
    │   │   ├── repository/      # Spring Data JPA interfaces
    │   │   └── PostgresQuestionAdapter.java # Implements QuestionRepositoryPort
    │   └── out/gemini/
    │       ├── GeminiProperties.java
    │       └── GeminiTutorClientAdapter.java # Implements TutorAiPort
    └── config/
        ├── BeanConfiguration.java # Wires domain services as Spring Beans
        ├── MetricsConfiguration.java # Micrometer Prometheus bindings
        └── SecurityFilterConfiguration.java
```

---

## 4. Spring Security 6 Architecture & Dual-Mode Access Control

To satisfy enterprise portfolio requirements (matching Alma Career / Teamio standards), AprovaENEM integrates **Spring Security 6.3+** with a component-based `SecurityFilterChain` model, stateless JWT authentication, and fine-grained Role-Based Access Control (RBAC).

```mermaid
flowchart TD
    ClientReq["Incoming HTTP Request<br/>(Optional: `Authorization: Bearer <token>` or `X-Session-Id`)"] --> SecurityFilterChain
    
    subgraph SpringSecurity ["Spring Security 6 Filter Chain"]
        CorsFilter["CorsFilter<br/>Strict Allowed Origins & Headers"] --> CsrfFilter["CsrfFilter<br/>Disabled (Stateless REST API)"]
        CsrfFilter --> RateLimitFilter["RateLimitFilter<br/>Token Bucket Ingress Check"]
        RateLimitFilter --> JwtAuthFilter["JwtAuthenticationFilter<br/>(OncePerRequestFilter)<br/>Validates HMAC-SHA256 & Expiry"]
        JwtAuthFilter --> AnonFilter["AnonymousAuthenticationFilter<br/>Assigns `ROLE_ANONYMOUS_STUDENT` if unauthenticated"]
        AnonFilter --> AuthzFilter["AuthorizationFilter<br/>Evaluates Route Permissions & Method Rules"]
    end
    
    AuthzFilter -->|Authorized| RestController["Target RestController<br/>(`@PreAuthorize`)"]
    AuthzFilter -->|Invalid JWT / Expired| AuthEntryPoint["Custom AuthenticationEntryPoint<br/>(RFC 7807 401 Unauthorized)"]
    AuthzFilter -->|Insufficient Role| AccessDenied["Custom AccessDeniedHandler<br/>(RFC 7807 403 Forbidden)"]
```

### 4.1 SecurityFilterChain Configuration (`SecurityConfiguration.java`)
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomAuthenticationEntryPoint authEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfiguration(
            JwtAuthenticationFilter jwtAuthFilter,
            CustomAuthenticationEntryPoint authEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authEntryPoint = authEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                // Public & Anonymous Endpoints
                .requestMatchers(HttpMethod.GET, "/api/v1/questions/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/session").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/prometheus").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Practice Session & Tutor Endpoints (Anonymous or Registered Student)
                .requestMatchers("/api/v1/sessions/**").hasAnyRole("ANONYMOUS_STUDENT", "STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/v1/questions/*/ask").hasAnyRole("ANONYMOUS_STUDENT", "STUDENT")
                // Registered Student Account & Sync Endpoints
                .requestMatchers("/api/v1/student/**").hasRole("STUDENT")
                // Admin Ingestion & Taxonomy Management
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .anonymous(anon -> anon
                .principal("anonymousStudent")
                .authorities("ROLE_ANONYMOUS_STUDENT"))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
```

### 4.2 Role-Based Access Control (RBAC) Matrix
| Role | Assigned When | Permitted Operations |
| :--- | :--- | :--- |
| `ROLE_ANONYMOUS_STUDENT` | No JWT provided (Guest student browsing or practicing). | Query catalog, generate practice quizzes, submit answers, get Socratic hints. No persistent cross-device account syncing. |
| `ROLE_STUDENT` | Valid JWT signed by `auth-service` presented. | All anonymous operations + persistent diagnostic profile, cross-device history synchronization, saved sessions. |
| `ROLE_ADMIN` | Authenticated teacher/curator credentials. | Batch ingest INEP question archives, edit distractor taxonomies, monitor telemetry. |

### 4.3 Method-Level Security (`@PreAuthorize`)
Service methods enforce authorization via Spring Security annotations:
```java
@PreAuthorize("hasRole('STUDENT')")
public StudentProfileDTO getStudentProfile(UUID studentId) { ... }

@PreAuthorize("hasRole('ADMIN')")
public IngestionReportDTO ingestExamPackage(ExamPackageDTO packageDTO) { ... }
```

---

## 5. Inter-Service Communication & Distributed Tracing

### Synchronous Communication Contract
The Gateway communicates with downstream microservices via HTTP/1.1 REST with persistent connections. All service-to-service calls carry the standard **W3C Trace Context headers**:
- `traceparent`: `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`
- `X-Session-Id`: The anonymous student session UUID or authenticated user ID.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Mobile Client
    participant GW as API Gateway
    participant Exam as Exam Service
    participant Gemini as Google Gemini API

    Student->>GW: POST /api/v1/questions/1024/ask (X-Session-Id: a8b9-...)
    Note over GW: Injects W3C traceId: 4bf92f...
    GW->>Exam: Forward with traceparent + X-Session-Id
    Note over Exam: MDC.put("traceId", "4bf92f...")
    Exam->>Gemini: POST https://generativelanguage.googleapis.com/...
    alt Gemini Success
        Gemini-->>Exam: 200 OK (Socratic guidance)
        Exam-->>GW: 200 OK (Resolution JSON)
        GW-->>Student: 200 OK (With traceId header)
    else Gemini Quota / Error
        Gemini-->>Exam: 429 Too Many Requests
        Note over Exam: Log ERROR with traceId: 4bf92f...
        Exam-->>GW: 503 Service Unavailable (Fallback to static resolution)
        GW-->>Student: 200 OK (Static resolution with degraded flag)
    end
```

### Trace-to-Error Log Correlation
Every log line emitted by any microservice automatically includes `[serviceName, traceId, spanId]` via Logback MDC:
```text
2026-09-17 19:35:10.142 ERROR [exam-service,4bf92f3577b34da6,00f067aa0ba902b7] c.o.a.i.a.o.g.GeminiTutorClientAdapter : Gemini API rate limit hit. Falling back to cached INEP static explanation.
```
When an anomaly occurs in production, entering the `traceId` into Grafana/Prometheus immediately reveals the entire request lifecycle and exact failure point.

---

## 6. Internationalization (i18n) Architecture

The backend supports bilingual operations out of the box:
- **English (`en`)**: System error messages, validation errors, developer documentation, and API keys.
- **Portuguese (`pt-BR`)**: Domain-specific ENEM questions, subject names, distractor rationales, and Brazilian student feedback.

```mermaid
flowchart LR
    Request["Incoming HTTP Request<br/>Header: `Accept-Language: pt-BR`"] --> Resolver["Spring LocaleResolver<br/>(AcceptHeaderLocaleResolver)"]
    Resolver --> MessageSource["MessageSource<br/>• `messages.properties` (EN)<br/>• `messages_pt_BR.properties` (PT)"]
    MessageSource --> LocalizedResponse["Localized API Response<br/>(Custom error text & validation feedback)"]
```

### Localization Implementation Details
1. **Spring Locale Resolver**: Standard `AcceptHeaderLocaleResolver` defaulted to `pt-BR` with fallback to `en`.
2. **Database Content Localization**:
   - The `questions` table includes a `content_language` column (default `'pt-BR'`).
   - Enables seamlessly adding translated international practice sets in the future without schema changes.

---

## 7. Future Scaling Path: Decoupling the AI Tutor

While starting with 2 microservices (`auth-service` and `exam-service`), the Hexagonal Ports & Adapters design guarantees that extracting the Socratic AI Tutor into an independent 3rd microservice (`tutor-service`) requires **zero changes to core business logic**:

```mermaid
flowchart LR
    subgraph CurrentTopology ["Current Phase (Sprint 1-2)"]
        ExamCurrent["exam-service<br/>(Questions + Sessions + Gemini Adapter)"]
    end

    subgraph FutureTopology ["Future Scale (Sprint 3+)"]
        ExamFuture["exam-service<br/>(Questions + Sessions)"]
        TutorFuture["tutor-service<br/>(Gemini Adapter + Prompt Cache)"]
        ExamFuture -->|HTTP / gRPC Client implementing `TutorAiPort`| TutorFuture
    end

    CurrentTopology -. Seamless Migration .-> FutureTopology
```
The outbound port `TutorAiPort` remains identical; only the infrastructure adapter swaps from a local Gemini client bean to a remote HTTP/gRPC client bean.
