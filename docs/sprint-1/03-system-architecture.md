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
            ExamSvc["📚 Exam & Assessment Service (Port 8082)<br/>• Question Bank & INEP Taxonomy<br/>• Practice Session State Machine<br/>• Automated Grading & Scoring<br/>• RAG Pipeline & Vector Search (`pgvector`)<br/>• Socratic AI Resolution Engine"]
        end

        subgraph DataLayer ["Persistence & Cache Layer"]
            PostgresAuth[("🗄️ PostgreSQL (Auth DB)<br/>Port 5432 - users, credentials")]
            PostgresExam[("🗄️ PostgreSQL 16 + pgvector (Exam DB)<br/>Port 5433 - questions, sessions, vector embeddings")]
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
    │   │   ├── mapper/          # MapStruct / Domain-Entity Mappers
    │   │   ├── repository/      # Spring Data JPA interfaces
    │   │   └── PostgresQuestionAdapter.java # Implements QuestionRepositoryPort
    │   └── out/gemini/
    │       ├── GeminiProperties.java
    │       └── GeminiTutorClientAdapter.java # Implements TutorAiPort
    ├── config/
    │   ├── BeanConfiguration.java # Wires domain services as Spring Beans
    │   ├── MetricsConfiguration.java # Micrometer Prometheus bindings
    │   └── SecurityFilterConfiguration.java
    └── resources/
        ├── application.yml
        └── db/migration/        # Flyway SQL scripts (V1__..., V2__...)
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
                // Future Premium Essay Evaluation & OCR (Phase 2)
                .requestMatchers("/api/v1/essays/**").hasRole("PREMIUM_STUDENT")
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
| `ROLE_PREMIUM_STUDENT` | Subscribed student or voucher holder. | All student operations + upload handwritten essay photos for multimodal OCR extraction and in-depth 5-competency grading (*Redação Nota 1000*). |
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

## 7. Future Scaling & Architecture Roadmap (Phase 2 Post-Base App)

### 7.1 Decoupling the AI Tutor (`tutor-service`)
While starting with 2 microservices (`auth-service` and `exam-service`), the Hexagonal Ports & Adapters design guarantees that extracting the Socratic AI Tutor into an independent 3rd microservice (`tutor-service`) requires **zero changes to core business logic**:

```mermaid
flowchart LR
    subgraph CurrentTopology ["Current Phase (Sprint 1-3: Base App)"]
        ExamCurrent["exam-service<br/>(Questions + Sessions + Gemini Adapter)"]
    end

    subgraph FutureTopology ["Future Scale (Phase 2+)"]
        ExamFuture["exam-service<br/>(Questions + Sessions)"]
        TutorFuture["tutor-service<br/>(Gemini Adapter + Prompt Cache)"]
        ExamFuture -->|HTTP / gRPC Client implementing `TutorAiPort`| TutorFuture
    end

    CurrentTopology -. Seamless Migration .-> FutureTopology
```

### 7.2 Premium AI Essay Evaluator & Multimodal Vision OCR (`essay-service`)

In the Brazilian ENEM, the essay (**Redação**) accounts for **20% of the entire final score** (up to 1,000 points out of 5,000) and is often the deciding criterion in SISU university admissions.

Evaluating handwritten essays requires **multimodal vision OCR** and high-token generative reasoning models. To safeguard infrastructure sustainability while keeping the base objective exam platform 100% free, this capability is architected as a **Phase 2 premium microservice (`essay-service`)** protected by `ROLE_PREMIUM_STUDENT` (or sponsored public school micro-vouchers).

#### 1. Provider-Agnostic Design & Empirical Model Evaluation (LLM Evals)
The architecture does **not hardcode a single AI provider**. Instead, the system uses an empirical **Evaluation Harness (`evals/`)** to benchmark candidate models against historical INEP human-graded ground-truth essays to select the model offering the best accuracy at the lowest cost:

```mermaid
flowchart LR
    Dataset["Ground Truth Dataset<br/>(100 Scanned INEP Essays with official grades)"] --> EvalHarness["LLM Evaluation Harness<br/>(`evals/run_benchmarks.py`)"]
    
    subgraph Candidates ["Candidate Foundation Models"]
        M1["Google Gemini (Flash / Pro)"]
        M2["Anthropic Claude (Haiku / Sonnet)"]
        M3["OpenAI (GPT-4o-mini / GPT-4o)"]
        M4["Open-Weights (Llama 3.2 Vision / Qwen 2.5 VL)"]
    end
    
    EvalHarness --> Candidates
    Candidates --> Pareto["Cost vs. Quality Pareto Frontier<br/>• OCR Transcription WER / CER<br/>• Score Mean Absolute Error (MAE)<br/>• Cost per Evaluation (Cents/Essay)"]
    Pareto --> ActiveAdapter["Selected Primary Evaluator & Judge Models"]
```

#### 2. INEP-Inspired Dual-Evaluator & LLM-as-a-Judge Protocol
In the official INEP protocol, every essay is independently evaluated by **two human graders**. If their total scores differ by more than **100 points**, or any single competency differs by more than **80 points**, a **third arbitrator (*avaliador de desempate*)** is called. 

AprovaENEM mirrors this exact rigorous protocol using **Dual Evaluators + LLM-as-a-Judge**:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Mobile Client
    participant GW as API Gateway
    participant EssaySvc as Essay Service
    participant S3 as Object Storage (MinIO / S3)
    participant OCR as Vision OCR Adapter
    participant Eval1 as Evaluator Model A
    participant Eval2 as Evaluator Model B
    participant Judge as LLM-as-a-Judge Arbitrator
    participant DB as PostgreSQL (essay_db)

    Student->>GW: POST /api/v1/essays/upload (image + Bearer JWT)
    Note over GW: Spring Security verifies ROLE_PREMIUM_STUDENT
    GW->>EssaySvc: Dispatch essay image
    EssaySvc->>S3: Store raw handwritten photo
    EssaySvc->>OCR: Extract handwritten Portuguese text
    OCR-->>EssaySvc: Transcribed text
    
    par Dual Independent Evaluation
        EssaySvc->>Eval1: Grade Competencies 1 to 5 (Prompt A)
        EssaySvc->>Eval2: Grade Competencies 1 to 5 (Prompt B)
    end
    Eval1-->>EssaySvc: Score A (e.g., 840 pts)
    Eval2-->>EssaySvc: Score B (e.g., 720 pts)
    
    Note over EssaySvc: Discrepancy Gate Check:<br/>|Score A - Score B| = 120 pts (> 100 pts threshold)
    
    EssaySvc->>Judge: Arbitrate (Essay + Scores A & B + INEP Rubric)
    Note over Judge: LLM Judge analyzes both rationales,<br/>reconciles criteria, and assigns calibrated grade
    Judge-->>EssaySvc: Final Score (e.g., 800 pts) + Arbitration Rationale
    
    EssaySvc->>DB: Persist transcription, scores, and judge notes
    EssaySvc-->>GW: 201 Created (EssayEvaluationDTO)
    GW-->>Student: 201 Created (Diagnostic Report + Competency Radar)
```

#### 3. Hexagonal Ports & Adapters Architecture
The core domain defines three pure Java outbound ports:
* `VisionOcrPort`: Abstracts handwritten Portuguese text extraction.
* `EssayEvaluatorPort`: Abstracts rubric scoring across Competencies 1 to 5.
* `LlmJudgePort`: Abstracts discrepancy arbitration and calibration.

Pluggable infrastructure adapters implement these ports (e.g., `GeminiVisionAdapter`, `OpenAiVisionAdapter`, `ClaudeJudgeAdapter`), enabling zero-downtime model switching based on benchmark results and API pricing updates.

#### 4. The 5 INEP Competencies Rubric
1. **Competência 1 (0–200 pts)**: Formal standard Portuguese syntax, concord, and spelling.
2. **Competência 2 (0–200 pts)**: Comprehending the proposed theme and integrating multidisciplinary knowledge (sociology, history, philosophy).
3. **Competência 3 (0–200 pts)**: Thesis defense: selecting, relating, and organizing arguments logically.
4. **Competência 4 (0–200 pts)**: Cohesion: appropriate use of inter- and intra-paragraph conjunctions and connectors.
5. **Competência 5 (0–200 pts)**: *Proposta de Intervenção*: Detailed actionable solution addressing the 5 required elements (*Agente, Ação, Meio/Modo, Efeito, Detalhamento*) respecting human rights.

---

## 8. Retrieval-Augmented Generation (RAG) & Vector Search Architecture

To eliminate model hallucinations and anchor all AI explanations in verified Brazilian high school curriculum standards, AprovaENEM implements an end-to-end **Retrieval-Augmented Generation (RAG)** pipeline powered by **PostgreSQL 16 with `pgvector`**:

```mermaid
flowchart TD
    StudentQuery["Student Inbound Query<br/>(e.g., 'Why is alternative B wrong?')"] --> EmbedEngine["Dense Embedding Generator<br/>(`text-embedding-004` / 768-dim)"]
    
    EmbedEngine --> QueryVec["Query Vector `v_q`"]
    
    subgraph VectorSearch ["PostgreSQL 16 + pgvector (HNSW Index)"]
        QueryVec --> ANN["Approximate Nearest Neighbor Search<br/>`embedding <=> v_q` (Cosine Distance)"]
        Corpus[("Pedagogical Knowledge Corpus<br/>• INEP Matriz de Referência<br/>• Curated Step-by-Step Resolutions<br/>• Distractor Fallacy Catalog<br/>• Redação Grader Manual")] --> ANN
        ANN --> TopK["Top-k Relevant Chunks (k=3)<br/>Similarity Score > 0.78"]
    end
    
    TopK --> PromptAssembler["Contextual Prompt Synthesizer"]
    QuestionCtx["Question Statement, Options & Topic Context"] --> PromptAssembler
    PedagogicalRules["Socratic Pedagogical Guardrails"] --> PromptAssembler
    
    PromptAssembler --> AugmentedPrompt["Enriched Context Prompt<br/>[Guardrails] + [Retrieved Chunks] + [Question] + [Query]"]
    AugmentedPrompt --> TargetLLM["Foundation Model<br/>(Provider-Agnostic / Socratic Generation)"]
    TargetLLM --> VerifiedResponse["Factual, Hallucination-Free Socratic Response"]
```

### 8.1 Vector Store Engine: PostgreSQL with `pgvector`
Rather than introducing the operational complexity, hosting costs, and network latency of an external standalone vector database cluster (e.g., Pinecone or Milvus), AprovaENEM utilizes **`pgvector` inside the existing PostgreSQL 16 container**:
- **Dimensionality**: 768 dimensions (`vector(768)`).
- **Index Type**: **HNSW (Hierarchical Navigable Small World)** with `vector_cosine_ops`, delivering sub-5ms cosine similarity searches under concurrent student traffic.
- **Index Definition**:
  ```sql
  CREATE INDEX idx_knowledge_chunks_hnsw 
  ON knowledge_chunks 
  USING hnsw (embedding vector_cosine_ops) 
  WITH (m = 16, ef_construction = 64);
  ```

### 8.2 Twofold Application of RAG in AprovaENEM
1. **Socratic AI Study Tutor (Core Feature)**:
   - Retrieves official INEP curriculum competencies, verified formulas, and distractor traps before prompting the tutor, ensuring the AI never gives incorrect scientific information or spoils answers.
2. **Redação AI Evaluator (Phase 2 Premium)**:
   - Retrieves the official INEP *Manual do Corretor de Redação*, thematic motivating texts, and exemplar benchmark criteria for the specific exam year, providing grounded evaluation across the 5 competencies.

---

## 9. Gamification & Habit-Loop Engine Architecture

To maximize student retention, combat prep fatigue, and provide a game-like educational journey for Brazilian public school students, AprovaENEM implements an event-driven **Gamification Engine** integrated across practice sessions:

```mermaid
flowchart TD
    StudentAttempt["Student Submits Answer<br/>(`SubmitAnswerUseCase`)"] --> DomainEvent["Publish Domain Event<br/>(`QuestionAnsweredEvent`)"]
    
    subgraph GamificationEngine ["Gamification & Habit-Loop Engine"]
        DomainEvent --> XPCalculator["XP & Level Calculator<br/>• +10 XP Correct<br/>• +50 XP Complete Session<br/>• +30 XP Daily Goal Achieved"]
        DomainEvent --> StreakTracker["Streak Tracker (Ofensiva)<br/>• Evaluates `last_activity_date`<br/>• Increments consecutive days<br/>• Applies Monthly Freeze if missed"]
        DomainEvent --> GoalValidator["Daily Goal Validator<br/>• Evaluates `daily_questions_completed`<br/>• Triggers goal unlocked celebration"]
        
        XPCalculator --> ProfileUpdate["Update `user_gamification_profiles`"]
        StreakTracker --> ProfileUpdate
        GoalValidator --> ProfileUpdate
        
        XPCalculator --> LeaderboardUpdater["Update `weekly_leaderboards`<br/>• Ingests Weekly XP into current week<br/>• Assigns League Tier: Bronze ➔ Diamond"]
    end
    
    ProfileUpdate --> PushNotifier["Notification Scheduler<br/>• Web Push API & In-App Alert<br/>• 19:00 BRT: 'Proteja sua ofensiva!'"]
```

### 9.1 XP & Level Progression System
- **Level Scaling Formula**: $XP_{required}(Level) = 100 \times Level^{1.5}$
- **Level Tiers & Titles**:
  - **Levels 1–4**: *Calouro do ENEM*
  - **Levels 5–9**: *Vestibulando Focado*
  - **Levels 10–19**: *Mestre dos Simulados*
  - **Levels 20–29**: *Aspirante a Federal*
  - **Level 30+**: *Nota 1000 Implacável*

### 9.2 Weekly Reset Leaderboards & League Tiers
- **Reset Frequency**: Every Sunday at 23:59:59 BRT.
- **Tiers & Progression**:
  - 🥉 **Bronze League**: Default entry league for newly registered students. Top 20% promote.
  - 🥈 **Silver League**: Top 20% promote to Gold; bottom 10% relegate to Bronze.
  - 🥇 **Gold League**: Top 15% promote to Diamond; bottom 15% relegate to Silver.
  - 💎 **Diamond League**: Top 10 nationally recognized on the public Hall of Fame.

### 9.3 Daily Study Reminders & Streak Protection
- **Daily Goals**: Configurable question targets (5, 10, 15, or 25 questions/day).
- **Streak Freeze (*Bloqueio de Ofensiva*)**: Students receive 1 emergency streak freeze per calendar month to accommodate school exam weeks or emergencies without losing motivation.
- **Smart Push Reminders**: An asynchronous Spring `@Scheduled` worker scans for active registered users with `opt_in_reminders = true` who have not completed their daily goal by 19:00 BRT, triggering a friendly reminder notification.

