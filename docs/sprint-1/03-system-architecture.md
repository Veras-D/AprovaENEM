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
    Client["📱 Mobile App / Web Browser / Cursinho Client"]
    
    subgraph Perimeter ["Edge & Perimeter Ingress"]
        LB["🛡️ Nginx Load Balancer / Reverse Proxy<br/>(Port 80/443, SSL Termination, Static Buffering)"]
        APIGW["⚡ Spring Cloud API Gateway (Port 8080)<br/>• Route Dispatcher<br/>• Token Bucket Rate Limiter (Redis/Memory)<br/>• W3C Distributed Trace Injector (`traceId`)<br/>• Dual-Auth Evaluator (Anonymous vs JWT)"]
    end

    subgraph Services ["Microservices Layer (Hexagonal Architecture)"]
        AuthSvc["🔐 Auth & Identity Service (Port 8081)<br/>• Anonymous Session Provisioning<br/>• Student JWT Registration & Login<br/>• Profile Management"]
        ExamSvc["📚 Exam & Assessment Service (Port 8082)<br/>• Question Bank & INEP Taxonomy<br/>• Practice Session State Machine<br/>• Automated Grading & Scoring<br/>• Diagnostic Weak-Spot Engine<br/>• Socratic Question Resolution (Gemini Free Tier)"]
    end

    subgraph DataLayer ["Persistence & Cache Layer"]
        PostgresAuth[("🗄️ PostgreSQL (Auth DB)<br/>Port 5432 - users, credentials")]
        PostgresExam[("🗄️ PostgreSQL (Exam DB)<br/>Port 5433 - questions, sessions, attempts")]
    end

    subgraph ExternalAI ["External AI Intelligence"]
        GeminiAPI["🤖 Google Gemini API (Free Tier)<br/>gemini-1.5-flash Socratic Explanations"]
    end

    subgraph ObservabilityStack ["Observability & Diagnostics (Docker Compose)"]
        Prometheus["📊 Prometheus Server (Port 9090)<br/>Scrapes `/actuator/prometheus`"]
        Grafana["📈 Grafana Dashboard (Port 3000)<br/>APM Latency & Error Heatmaps"]
    end

    Client -->|HTTP / HTTPS| LB
    LB -->|Reverse Proxy| APIGW
    
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
To protect the backend from denial-of-service, aggressive question scraping, and exhaustion of the **Google Gemini Free Tier rate limits (15 RPM / 1,500 RPD)**, the Gateway enforces a **Token Bucket** rate limiting algorithm:

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
   - Refill Rate: **10 tokens / minute** (strict guardrail protecting free-tier LLM quota).
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
        GeminiAdapter["🤖 Gemini Free-Tier Adapter<br/>(`GeminiTutorClient`)"]
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

## 4. Inter-Service Communication & Distributed Tracing

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

## 5. Internationalization (i18n) Architecture

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

## 6. Future Scaling Path: Decoupling the AI Tutor

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
