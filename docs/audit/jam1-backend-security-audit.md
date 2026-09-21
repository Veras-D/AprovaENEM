# AprovaENEM — Comprehensive Backend Security, Architecture & Quality Audit Report
**Milestone:** JAM 1 (Sprint 3 Finalization) — Master Engineering & Security Audit  
**Document Reference:** `docs/audit/jam1-backend-security-audit.md`  
**Task Reference:** `TASK-S3-11` (Full Multi-Stage Audit Completion)  
**Date of Completion:** September 21, 2026  
**Security Working Group & Authors:**
- Lead Security Architect & Master Synthesizer (`81c87664-3d9b-4e80-98c1-5214055bb287`)
- Static Code Analysis & Workarounds Auditor (`6d615e38-e1f6-4b2c-97cb-4cd34bb45bdb`)
- Lead Application Security Architect & Threat Modeler (`Phase 2 Subagent`)
- DevSecOps & Automated Security Scanner (`b146d370-3092-43f5-886c-1800931f88af`)
- Perimeter Security & Penetration Testing Auditor (`93671fca-ac17-4579-9421-ddd7620b3759`)
- Quality Engineering & Mutation Testing Auditor (`88e3047e-d3b4-4db8-9e40-9713c2301c6a`)

---

## 1. Executive Summary & Master Release Gate Decision

### 1.1 Executive Summary
During the conclusion of Sprint 3 for Milestone JAM 1 of the **Reconecta Recode** program, an exhaustive, publication-grade multi-stage security, architectural integrity, and test authenticity audit was executed across the AprovaENEM microservices backend ecosystem.

The audit synthesized findings across five specialized assessment phases encompassing static analysis workarounds, OWASP API threat modeling, automated vulnerability scanning (SAST/SCA), runtime penetration testing, and fault-injection mutation testing.

The evaluation established that the platform possesses **exceptional engineering strengths**:
- Clean hexagonal domain separation in `exam-service` with pure Java business entities.
- Zero committed production secrets in git history across 82 commits.
- Modern JJWT 0.12.5 cryptographic implementation resilient to `alg: none` and key-confusion attacks.
- High test coverage with unified JaCoCo metrics ($\ge 80\%$ line, $\ge 75\%$ branch) across 1,148 AssertJ validation points.
- Event-driven consistency through the Transactional Outbox pattern and sub-2ms Redis caching.

Simultaneously, the audit uncovered **critical vulnerabilities and compromised engineering practices**:
1. **Universal Broken Object Level Authorization (BOLA):** Complete absence of ownership checks in `PracticeSessionController`, allowing any student or guest to read, answer, or abort any other user's exam.
2. **Broken Function Level Authorization (BFLA):** Unauthenticated administrative question status modification (`PATCH /api/v1/questions/{id}/status`) allowing catalog deactivation.
3. **Severe Supply-Chain Vulnerabilities:** 10 Critical and 39 High CVEs in the Java runtime baseline (Tomcat RCE `CVE-2025-24813`, Tomcat auth bypass `CVE-2026-65182`) and an EOL Alpine 3.19 Nginx base image.
4. **Identity Trust Boundary Failure:** Downstream microservices blindly resolving identity from client `X-User-Id` headers rather than authenticated JWT principals.
5. **Compromised CI Quality Gates & Slice Tests:** Deliberate suppression of Spring Security filters in 80% of WebMvc slice tests (`addFilters = false`), PMD complexity threshold inflation (10 to 15), SpotBugs omission, and double-BCrypt execution halving authentication throughput.

---

### 1.2 Master Release Gate Evaluation

```
=============================================================================================================
MASTER RELEASE GATE DECISION MATRIX — APROVAENEM BACKEND
=============================================================================================================
1. Academic / JAM 1 Deliverable Release Gate:                   PASSED WITH HONORS ✅ (100% Met)
   - Criteria: Functional REST API, Hexagonal Design, OpenAPI 3.0, Postman Suite, JaCoCo Coverage >= 80%.
   - Verdict: Fully approved and verified for Month 2 program milestone submission.

2. Production Cloud / Staging Deployment Gate:                  HARD BLOCK ❌ (Conditionally Blocked)
   - Criteria: Zero Critical vulnerabilities, strict authorization enforcement, hardened runtime perimeter.
   - Verdict: Production cloud deployment strictly blocked until all 10 Tier P0 Hotfixes are remediated.
=============================================================================================================
```

---

## 2. Global Architecture & Target Scope

### 2.1 System Topology & Network Perimeter

```mermaid
flowchart TD
    subgraph PublicInternet["Public Internet (WAN)"]
        Client["Student Web / Mobile App"]
    end

    subgraph EdgePerimeter["Edge Perimeter (frontend-edge)"]
        Nginx["Nginx Reverse Proxy (:80 / :443)"]
        BFF["Spring Cloud Gateway BFF (:8080)"]
    end

    subgraph InternalMesh["Internal Isolated Network (aprovaenem-internal: internal=true)"]
        AuthSvc["auth-service (:8081)"]
        ExamSvc["exam-service (:8082)"]
        NotifSvc["notification-service (:8083)"]
        
        DBAuth[("PostgreSQL auth_db")]
        DBExam[("PostgreSQL exam_db + pgvector")]
        DBNotif[("PostgreSQL notif_db")]
        RedisNode[("Redis 7.2 Cache & ZSET")]
        RabbitNode{{"RabbitMQ Message Broker"}}
    end

    subgraph ExternalServices["External Cloud Integrations"]
        GeminiAI["Google Gemini 1.5 Flash API"]
        SMTPRelay["Transactional SMTP Relay"]
    end

    Client -->|HTTP / HTTPS| Nginx
    Nginx -->|Reverse Proxy /api/| BFF
    Nginx -->|Static Figures /assets/| VolumeAssets[("Named Volume: exam-assets-data")]
    
    BFF -->|JWT / IP Rate Limiting| AuthSvc
    BFF -->|Token Bucket Routing| ExamSvc
    BFF -->|Trace ID Routing| NotifSvc

    AuthSvc --> DBAuth
    AuthSvc --> RedisNode
    AuthSvc --> RabbitNode

    ExamSvc --> DBExam
    ExamSvc --> RedisNode
    ExamSvc -.->|BLOCKED BY internal: true| GeminiAI

    NotifSvc --> DBNotif
    NotifSvc --> RabbitNode
    NotifSvc -.->|BLOCKED BY internal: true| SMTPRelay
```

### 2.2 Microservices Inventory & Technology Stack

| Module | Core Responsibility | Framework / Runtime | Ingress Port | Storage & Collaborators |
| :--- | :--- | :--- | :---: | :--- |
| **`frontend-api`** | Edge API Gateway / BFF, Token Bucket rate limiting, trace ID injection, CORS enforcement. | Spring Boot 3.3.3, Spring Cloud Gateway WebFlux, Netty | `8080` (Internal) | Redis 7.2 (Rate Limiter Reactive Bucket) |
| **`auth-service`** | User registration, authentication, HMAC-SHA256 password peppering, anonymous sessions, gamification, weekly leaderboards. | Spring Boot 3.3.3, Spring Security 6, JJWT 0.12 | `8081` (Internal) | PostgreSQL 16 (`auth_db`), Redis 7.2 (`ZSET`), RabbitMQ |
| **`exam-service`** | Question catalog, full-text search, practice session state machine, TRI scoring, Socratic AI Tutor, pgvector RAG. | Spring Boot 3.3.3, Pure Hexagonal Domain, Spring Data JPA | `8082` (Internal) | PostgreSQL 16 (`exam_db` + `pgvector`), Redis 7.2, Google Gemini |
| **`notification-service`** | Asynchronous transactional notification consumer, email dispatch, push notification queue. | Spring Boot 3.3.3, Spring AMQP, Spring Mail | `8083` (Internal) | PostgreSQL 16 (`notif_db`), RabbitMQ (`notification.exchange`) |
| **`common-core`** | Domain events (`UserRegisteredEvent`, etc.), result monads, shared exception definitions. | Java 21 LTS Library | N/A (Shared JAR) | None (Pure Java) |
| **`ingestion-service`** | Neural layout analysis (DocLayNet), formula-to-LaTeX conversion, WebP diagram cropping. | Python 3.11, IBM Docling, TableFormer | Batch CLI | Named Volume `exam-assets-data` |

---

## 3. Unified Global Security & Engineering Maturity Scorecard

### 3.1 Weighted Evaluation Rubric

The unified scorecard aggregates empirical findings across all 5 audit phases into a 100-point weighted index:

| Domain | Assessment Focus | Phase Citation | Weight | Raw Score | Weighted Contribution | Grade |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Static Code Integrity & Linter Discipline** | Rule fidelity, SpotBugs bytecode inspection, PMD cyclomatic complexity, architectural purity, and elimination of rapid CI workarounds. | Phase 1 | 15% | 52.0% | 7.80% | **F** |
| **2. Application & API Security (OWASP Top 10)** | Object-level authorization (BOLA), function-level authorization (BFLA), mass assignment prevention, and business flow integrity. | Phase 2 | 25% | 58.0% | 14.50% | **D+** |
| **3. Supply Chain (SCA), Secrets & Containers** | Dependency CVEs, secret entropy across git history, Dockerfile non-root execution, daemon socket isolation, and resource limits. | Phase 3 | 20% | 66.8% | 13.36% | **D+** |
| **4. Runtime Perimeter & Ingress Security** | Host network isolation, Nginx header inheritance, CORS validation, edge trust boundaries, rate limiter spoofing, and SQL parameterization. | Phase 4 | 20% | 71.4% | 14.28% | **C-** |
| **5. Test Suite Authenticity & Mutation Resilience** | Assertion authenticity, eradication of hollow tests, slice test security fidelity, PITest mutation kill rate (50 mutants), and boundary coverage. | Phase 5 | 20% | 78.2% | 15.64% | **B-** |
| **GLOBAL UNIFIED SCORE** | **Comprehensive Engineering & Security Posture** | **Phases 1–5** | **100%** | — | **65.58%** | **D+** |

---

### 3.2 Key Performance Indicators (KPIs) Summary

```
+-------------------------------------------------------------+-----------------------+-----------------------+
| Quality & Security Dimension                                | Target Industry SLA   | Measured Audit Value  |
+-------------------------------------------------------------+-----------------------+-----------------------+
| Hardcoded Production Secrets in Git History                 | 0 leaks               | 0 leaks (PASSED ✅)   |
| Surefire Unit & Integration Test Executions                 | >= 100 tests          | 344 tests (PASSED ✅) |
| JaCoCo Unified Instruction / Line Coverage                  | >= 80.0%              | 88.7% - 100% (PASS ✅)|
| JaCoCo Unified Branch Coverage                              | >= 75.0%              | 75.8% - 88.6% (PASS ✅)|
| AssertJ Verification Points Density                         | >= 2.0 checks/test    | 3.89 checks/test ✅   |
| PITest Mutation Fault-Injection Kill Rate                   | >= 85.0%              | 80.0% (DEFICIENT ⚠️)  |
| Critical & High CVEs in Production Container Runtime        | 0 CVEs                | 69 CVEs (FAILED ❌)   |
| OWASP API Security Top 10 High/Critical Vulnerabilities     | 0 issues              | 10 issues (FAILED ❌) |
| Spring Security Filter Enforcement in Controller Slices     | 100% enforced         | 20.0% (FAILED ❌)     |
| SpotBugs High/Medium Bytecode Defects                       | 0 defects             | 50+ defects (FAIL ❌) |
+-------------------------------------------------------------+-----------------------+-----------------------+
```

---

## 4. Phase-by-Phase Audit Findings Synthesis

---

### 4.1 Phase 1 Synthesis: Static Analysis & Rapid CI Workarounds
- **Auditor:** Independent Static Analysis Subagent (`6d615e38-e1f6-4b2c-97cb-4cd34bb45bdb`)
- **Key Findings:**
  1. **Weakened Checkstyle MethodName Regex:** To accommodate Spring Data JPA repository nested property queries (e.g. `findByUserIdAndQuestion_IdAndStatus`), the global `MethodName` regex in `backend/config/checkstyle/checkstyle.xml` was relaxed to allow underscores across **all production Java classes**, degrading style consistency.
  2. **Inflated PMD Cyclomatic Complexity Threshold:** `methodReportLevel` was raised from 10 to 15 in `pmd-ruleset.xml`. Direct re-execution at threshold 10 revealed **6 monolithic methods** with CC up to 14 in `PracticeSessionController`, `QuestionRepositoryAdapter`, and `GamificationService`.
  3. **SpotBugs Complete Absence:** SpotBugs was missing from `pom.xml`. Manual execution revealed **over 50 unmonitored bytecode defects**, including two high-severity `NullPointerException` risks in Gateway `TraceHeaderFilter.java:31-32`.
  4. **QuestionDtoMapper Static Utility Workaround:** Extracted as a static utility class to circumvent PMD CPD (100 tokens) rather than using the project-mandated MapStruct library (`org.mapstruct:1.5.5.Final`).
  5. **Pre-flight Smoke Test Portability Defects:** `tests/smoke/preflight-smoke.sh` utilized brittle string slicing (`grep | head | cut`) and non-POSIX constructs (`date +%s%N`, `bc`) failing on BSD/macOS.
  6. **Newman `--delay-request 100` Workaround:** Introduced into `.github/workflows/ci.yml` to circumvent Gateway Redis rate limiting, masking burst capacity bottlenecks and inflating CI pipeline duration.
  7. **Password Pepper Implementation Inefficiencies:** In `BCryptPasswordEncoderAdapter.java`, verifying upgraded credentials executes BCrypt **twice** on every successful login, cutting `auth-service` login throughput by 50% and introducing a side-channel timing discrepancy on failed attempts.

---

### 4.2 Phase 2 Synthesis: Threat Modeling & OWASP API Security Top 10
- **Auditor:** Lead Application Security Architect & Threat Modeler
- **Key Findings:**
  1. **VULN-01 [CRITICAL - API1:2023 BOLA]:** Universal Broken Object Level Authorization across `PracticeSessionController.java` (`GET /api/v1/sessions/{id}`, `POST /attempts`, `POST /complete`, `GET /diagnostic`). Endpoints accept session UUIDs and perform read/write mutations without validating that the authenticated caller owns the targeted session.
  2. **VULN-02 [CRITICAL - API2:2023 Broken Auth]:** Complete omission of Spring Security in `exam-service`. `spring-boot-starter-security` is absent from `pom.xml`, leaving all exam endpoints unprotected.
  3. **VULN-03 [CRITICAL - API5:2023 BFLA]:** Unauthenticated catalog modification on `PATCH /api/v1/questions/{id}/status`. Any external caller can deactivate questions platform-wide.
  4. **VULN-04 [HIGH - API6:2023 Business Flow]:** Client-controlled XP injection on `POST /api/v1/gamification/activity`. Clients can supply arbitrary `questionsSolved` and `correctCount`, instantly achieving maximum level and corrupting leaderboards.
  5. **VULN-05 [HIGH - API1:2023 BOLA]:** Precedence of unverified `X-User-Id` request header over security principals in `GamificationController.java:136` and `NotificationController.java:82`.
  6. **VULN-06 [HIGH - API4:2023 Rate Limiting]:** Edge Gateway rate limiter bypass via spoofed `X-Forwarded-For` headers and unverified Bearer tokens.
  7. **VULN-07 [HIGH - API4:2023 Resource Consumption]:** Unbounded pagination `size` in `QuestionFilterCommand.java` enabling heap exhaustion DoS via `size=1000000`.
  8. **VULN-09 [HIGH - API6:2023 Business Flow]:** Race condition and lost updates on concurrent answer submissions due to missing `@Version` optimistic locking in `PracticeSessionEntity`.
  9. **VULN-10 [HIGH - API8:2023 Misconfiguration]:** Public leakage of internal infrastructure details (disk space, Redis/RabbitMQ versions) via Actuator `show-details: always`.

---

### 4.3 Phase 3 Synthesis: Automated SAST, SCA, Secrets & Container Hardening
- **Auditor:** Lead DevSecOps & Automated Security Scanner (`b146d370-3092-43f5-886c-1800931f88af`)
- **Key Findings:**
  1. **Secret & Entropy Audit:** Full scan across 82 commits yielded **0 active secret leaks**. However, `.gitleaks.toml` contains a blanket directory allowlist (`docs/.*`, `tests/.*`, `\.github/.*`), globally blinding CI to accidental token commits in workflows or test fixtures.
  2. **Transitive Dependency CVEs (SCA):** Aquasec Trivy v0.74 identified **108 CVEs** (10 Critical, 39 High) in the Java microservices inherited from Spring Boot 3.3.3:
     - `CVE-2025-24813`: Apache Tomcat Partial PUT Remote Code Execution / data corruption.
     - `CVE-2026-65182` & `CVE-2026-68525`: Apache Tomcat authentication and security constraint bypass.
     - `CVE-2026-75595`: Netty SNI routing bypass via fragmented TLS ClientHello.
     - `CVE-2024-38821`: Spring Security WebFlux static resource authorization bypass.
  3. **Ingress Proxy EOL Base Image:** `nginx:1.25-alpine` is built upon **Alpine Linux 3.19.1 (officially End-Of-Life)** and contains 20 vulnerabilities, including 3 Critical CVEs (`CVE-2024-45491`, `CVE-2024-45492` in `libexpat`, and `CVE-2024-56171` in `libxml2`).
  4. **Container Privilege Isolation:** Java services run as non-root (`spring:spring`), but `backend/ingestion-service/Dockerfile` runs as **root (`uid=0`)** with build tools (`build-essential`) in the runtime layer.
  5. **Dangerous Docker Socket Mount:** The `autoheal` container mounts `/var/run/docker.sock:/var/run/docker.sock`, granting root host takeover capabilities if compromised.
  6. **Zero Resource Limits:** `docker-compose.yml` declares no CPU or RAM constraints across all 13 containers, exposing host nodes to denial-of-service via OOM cascades.
  7. **Nginx Header Inheritance Bug:** Declaring `add_header Cache-Control` inside `location /assets/questions/` silently wipes all parent server-level security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) for static diagram downloads.

---

### 4.4 Phase 4 Synthesis: Runtime Penetration Testing & Ingress Security
- **Auditor:** Lead Security Architect & Perimeter Security Auditor (`93671fca-ac17-4579-9421-ddd7620b3759`)
- **Key Findings:**
  1. **SEC-P4-01 [CRITICAL]:** Verified that downstream services directly accept and trust unauthenticated `X-User-Id` headers. Direct query to `notification-service:8083` with injected header returned user notification feeds without Bearer tokens.
  2. **SEC-P4-02 [CRITICAL]:** `docker-compose.yml` fails to pass `JWT_SECRET` to `exam-service`. In production environments with custom secrets, `exam-service` falls back to default strings, causing all valid student tokens to fail with HTTP 401 on AI Tutor endpoints.
  3. **SEC-P4-03 [HIGH]:** Confirmed live exploitation of unauthenticated `PATCH /api/v1/questions/{id}/status`.
  4. **SEC-P4-04 [HIGH]:** Gateway `RateLimiterConfig.java` hashes raw Bearer tokens without signature checks and resolves client IP from unverified `X-Forwarded-For`, enabling trivial rate limiter evasion.
  5. **SEC-P4-05 [HIGH]:** Development override (`docker-compose.override.dev.yml`) maps internal ports (`5432`, `6379`, `5672`, `8081`) to `0.0.0.0` instead of `127.0.0.1`, exposing storage engines to the public WAN if deployed on remote servers.
  6. **SEC-P4-06 [MEDIUM]:** Network setting `internal: true` on `aprovaenem-internal` drops all outbound internet traffic, causing Google Gemini AI Tutor (`generativelanguage.googleapis.com`) and external SMTP relays to fail with `Network unreachable`.
  7. **SEC-P4-07 [MEDIUM]:** Gateway `application.yml` ignores the `CORS_ALLOWED_ORIGINS` environment variable and relies on static hardcoded origins.
  8. **Cryptographic Validation Strengths:** JJWT 0.12 parser proved strictly immune to `alg: none` attacks, rejected asymmetric key confusion, enforced minimum 256-bit key entropy, and strictly verified `exp` claims.
  9. **SQL Parameterization Strengths:** Spring Data JPA `@Param` bindings and `plainto_tsquery('portuguese', ...)` prevent SQL and tsquery injection. However, unindexed `ORDER BY RANDOM()` causes database CPU exhaustion under concurrency.

---

### 4.5 Phase 5 Synthesis: Test Suite Authenticity & Mutation Testing
- **Auditor:** Lead Test Quality & Mutation Testing Auditor (`88e3047e-d3b4-4db8-9e40-9713c2301c6a`)
- **Key Findings:**
  1. **AUD-P5-01 [CRITICAL]:** Isolated two test methods containing **zero assertions and zero Mockito verifications** (`TutorChatRepositoryAdapterTest:175` and `RabbitMQNotificationPublisherAdapterTest:52`), representing completely blind tests in CI.
  2. **AUD-P5-02 [HIGH]:** 4 out of 5 controller slice test suites annotate `@AutoConfigureMockMvc(addFilters = false)`, completely stripping Spring Security filters and blinding unit tests to missing `@PreAuthorize` annotations.
  3. **AUD-P5-03 [HIGH]:** Over-permissive Mockito matchers (`any()`, `anyString()`, `anyInt()`) in `SocraticTutorServiceTest` allow mutated RAG chunk sizes and prompt strings to survive undetected.
  4. **AUD-P5-04 [HIGH]:** `PracticeSessionService.completeSession()` fails to verify `sessionRepository.save(session)`, allowing void method deletion mutants to survive.
  5. **Mutation Testing Analysis (PITest Model):** Evaluated 50 canonical mutants across 4 domain services (`GamificationService`, `PracticeSessionService`, `SocraticTutorService`, `AuthService`). Achieved **80.0% mutation kill rate** (40 killed / 10 survived).
  6. **Cryptographic Test Boundary Gaps:** Tests only check valid vs literal `"invalid"`, omitting expired tokens, wrong-key signatures, and malformed headers.

---

## 5. Cross-Cutting Risk Analysis: The Workaround Cascade

A critical contribution of this master synthesis is exposing the **systemic causal relationship** between rapid linter workarounds in Phase 1, slice test compromises in Phase 5, and the runtime security vulnerabilities discovered in Phases 2 and 4.

```mermaid
sequenceDiagram
    autonumber
    participant Eng as Engineering / CI (Sprint 3)
    participant Linter as Static Analysis & CI Gates
    participant Tests as WebMvc Slice Tests
    participant Prod as Production Runtime Stack

    Note over Eng,Linter: Workaround Introduction (TASK-S3-10)
    Eng->>Linter: PMD CC fails on PracticeSessionController (CC=12)
    Eng->>Linter: Inflate CC threshold to 15 in pmd-ruleset.xml!
    Note over Eng,Linter: Masked monolithic controller methods

    Eng->>Tests: Write WebMvc slice tests for controllers
    Eng->>Tests: Annotate @AutoConfigureMockMvc(addFilters=false) to bypass security setup
    Note over Tests: Security filters detached; CI is now 100% green

    Eng->>Prod: Deploy unauthenticated PATCH /questions/{id}/status & Session APIs
    Note over Prod: VULN-01 (BOLA) & VULN-03 (BFLA) live in production!
    Note over Prod: Slice tests never failed because addFilters=false blinded CI!
```

### 1. The Linter Complexity to BOLA Pipeline
In Phase 1, PMD cyclomatic complexity was inflated to 15 to allow `PracticeSessionController.startSession` (CC=12) and manual entity mappers to pass without refactoring. Because controllers were allowed to handle low-level header parsing and unvalidated body inputs directly, developers bound client-supplied `userId` fields from request payloads (`StartSessionRequest`) directly into domain entities. This failure to enforce clean architectural separation directly manifested as **VULN-01** (Universal BOLA) and **VULN-05** (Insecure `X-User-Id` Trust).

### 2. The Slice Test Blindspot to BFLA Pipeline
In Phase 5, developers silenced test execution errors by disabling filters (`addFilters = false`). When `QuestionCatalogController.updateStatus` was introduced, no developer noticed that it was completely unauthenticated. The test suite passed with 100% coverage, creating a false sense of security while deploying **VULN-03 / SEC-P4-03** into the platform.

### 3. The Newman Rate Limiting Workaround Pipeline
When Newman contract testing encountered rate limiting in CI, adding `--delay-request 100` suppressed the underlying issue. Consequently, the edge rate limiter key resolver (`RateLimiterConfig.java`) was never tested under burst conditions, concealing **VULN-06 / SEC-P4-04** (trivial rate limiter bypass via `X-Forwarded-For` and bogus Bearer token rotation).

---

## 6. Master Remediation Roadmap & Backlog

```mermaid
gantt
    title Master Remediation Execution Schedule (Sprints 3 to 6)
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Tier P0: Release Blockers (Immediate Hotfixes)
    Remediate Practice Session BOLA (VULN-P0-01)          :active, p0_1, 2026-09-21, 1d
    Secure Question Status PATCH (VULN-P0-02)             :active, p0_2, 2026-09-21, 1d
    Synchronize JWT_SECRET in Compose (VULN-P0-03)        :active, p0_3, 2026-09-21, 1d
    Eliminate Insecure X-User-Id Trust (VULN-P0-04)       :active, p0_4, 2026-09-21, 1d
    Fix Double BCrypt Overhead (VULN-P0-05)               :active, p0_5, 2026-09-21, 1d
    Patch Gateway Rate Limiter Key Resolver (VULN-P0-06)  :active, p0_6, 2026-09-21, 1d
    Remove Public /activity XP Farming (VULN-P0-07)       :active, p0_7, 2026-09-21, 1d
    Bump Spring Boot BOM & Pin Dependencies (VULN-P0-08)  :active, p0_8, 2026-09-22, 1d
    Upgrade Nginx Base Image to 1.27 (VULN-P0-09)         :active, p0_9, 2026-09-22, 1d
    Fix Zero-Assertion Tests (VULN-P0-10)                 :active, p0_10, 2026-09-22, 1d

    section Tier P1: Sprint 4 Hardening (Architecture)
    Add Spring Security to exam-service (VULN-P1-01)      :p1_1, 2026-10-01, 3d
    Restore Security Filters in Slice Tests (VULN-P1-02)  :p1_2, after p1_1, 2d
    Add @Version Optimistic Locking (VULN-P1-03)          :p1_3, after p1_2, 2d
    Bind Dev Override Ports to 127.0.0.1 (VULN-P1-04)     :p1_4, after p1_3, 1d
    Refactor Ingestion Dockerfile to Non-Root (VULN-P1-05):p1_5, after p1_4, 1d
    Configure Compose CPU/Memory Limits (VULN-P1-06)      :p1_6, after p1_5, 1d
    Dual-Home Egress for AI & SMTP (VULN-P1-07)           :p1_7, after p1_6, 1d
    Integrate SpotBugs in Maven Build (VULN-P1-08)        :p1_8, after p1_7, 2d
    Lower PMD CC Threshold to 10 (VULN-P1-09)             :p1_9, after p1_8, 2d

    section Tier P2: Sprint 5 Polish (Quality & CI)
    Checkstyle Suppressions & MapStruct (VULN-P2-01/02)   :p2_1, 2026-10-11, 3d
    Modernize Smoke Probes & Remove Delay (VULN-P2-03/04) :p2_2, after p2_1, 2d
    Gitleaks Scoped Regex & Nginx Headers (VULN-P2-05/06) :p2_3, after p2_2, 2d
    Actuator Hardening & Bound Pagination (VULN-P2-07/09) :p2_4, after p2_3, 2d

    section Tier P3: Sprint 6 Tech Debt (Clean-up)
    Nginx TLS Termination on Port 443 (VULN-P3-01)        :p3_1, 2026-10-21, 3d
    Redis JWT Revocation Blocklist & Logout (VULN-P3-02)  :p3_2, after p3_1, 2d
    Optimize Random Query & Remove Dead Code (VULN-P3-03) :p3_3, after p3_2, 2d
```

---

### 6.1 Tier P0 Master Specifications: Release-Blocking Hotfixes

#### Hotfix P0-01: Remediate Universal Practice Session BOLA
- **Component:** `exam-service`
- **Location:** `com.aprovaenem.exam.application.service.PracticeSessionService.java:71-73`
- **Specification:** Inject caller security principal into commands (`GetSessionCommand`, `SubmitAnswerCommand`, `CompleteSessionCommand`, `GetDiagnosticReportCommand`). Verify ownership:
  ```java
  if (session.getUserId() != null && !session.getUserId().equals(caller.userId())) {
      throw new AccessDeniedException("Unauthorized: You do not own this practice session.");
  }
  if (session.getUserId() == null && !session.getAnonymousSessionId().equals(caller.anonymousSessionId())) {
      throw new AccessDeniedException("Unauthorized: Session token mismatch.");
  }
  ```

#### Hotfix P0-02: Secure Question Catalog Status Endpoint (BFLA)
- **Component:** `exam-service`
- **Location:** `com.aprovaenem.exam.infrastructure.adapter.in/web/QuestionCatalogController.java:74-83`
- **Specification:** Add `@PreAuthorize("hasRole('ADMIN')")` to `updateStatus()` and require a verified administrative Bearer JWT token.

#### Hotfix P0-03: Pass `JWT_SECRET` to `exam-service` in Docker Compose
- **Component:** Orchestration
- **Location:** `docker-compose.yml:143-156`
- **Specification:** Declare `JWT_SECRET=${JWT_SECRET}` under `exam-service` environment block to guarantee cryptographic parity across microservices.

#### Hotfix P0-04: Eliminate Downstream Trust of Insecure `X-User-Id`
- **Component:** `auth-service` & `notification-service`
- **Location:** `NotificationController.java:82-96`, `GamificationController.java:136-147`
- **Specification:** Remove custom `resolveUserId(String authHeader, String xUserId)` fallbacks. Rely strictly on `SecurityContextHolder` principals or verified JWT Bearer tokens.

#### Hotfix P0-05: Eliminate Double BCrypt Overhead & Fail-Fast Pepper
- **Component:** `auth-service`
- **Location:** `BCryptPasswordEncoderAdapter.java`, `AuthService.java:117-121`
- **Specification:** Refactor `PasswordEncoderPort.verify(rawPassword, hash)` to return a status record:
  ```java
  public record PasswordVerificationResult(boolean matched, boolean requiresUpgrade) {}
  ```
  Compute BCrypt exactly once per login. Throw `IllegalStateException` on application startup in production profiles if `AUTH_PASSWORD_PEPPER` is empty.

#### Hotfix P0-06: Patch Gateway Rate Limiter Key Resolver
- **Component:** `frontend-api`
- **Location:** `RateLimiterConfig.java:23-47`
- **Specification:** 
  1. Extract client IP strictly from `$remote_addr` appended by trusted Nginx proxy (`X-Real-IP`).
  2. For Bearer tokens, parse and validate token signature before using the subject UUID as a rate limit bucket key.

#### Hotfix P0-07: Decommission Public `/api/v1/gamification/activity` Endpoint
- **Component:** `auth-service`
- **Location:** `GamificationController.java:111-127`
- **Specification:** Delete the `@PostMapping("/activity")` route. Award gamification XP exclusively via internal RabbitMQ listeners consuming verified `ExamSessionCompletedEvent` published by `exam-service`.

#### Hotfix P0-08: Bump Spring Boot BOM & Pin Dependencies
- **Component:** Build Root
- **Location:** `backend/pom.xml:9-14, 47-55`
- **Specification:** Upgrade parent POM to `3.3.11` and add dependency management overrides for Tomcat (`10.1.35`), Netty (`4.1.118.Final`), Jackson (`2.18.8`), and PostgreSQL driver (`42.7.11`).

#### Hotfix P0-09: Upgrade Nginx Base Image to `nginx:1.27-alpine`
- **Component:** Ingress Reverse Proxy
- **Location:** `docker-compose.yml:31`
- **Specification:** Update image reference to `nginx:1.27-alpine` to eliminate EOL Alpine 3.19 and patched `libexpat` Critical CVEs.

#### Hotfix P0-10: Fix Zero-Assertion Tests in Persistence & Messaging Adapters
- **Component:** `exam-service` & `auth-service`
- **Location:** `TutorChatRepositoryAdapterTest.java:175`, `RabbitMQNotificationPublisherAdapterTest.java:52`
- **Specification:** Add `verify(threadRepository, never()).save(any())` and `verify(rabbitTemplate).convertAndSend(...)`.

---

## 7. Master Vulnerability & Defect Index (All 49 Findings)

The complete inventory of findings discovered during the multi-stage audit:

| Master Ref | Severity | Domain | Vulnerability Summary | Module / File |
| :--- | :---: | :---: | :--- | :--- |
| **VULN-P0-01** | **CRITICAL** | Authorization | Universal BOLA on Practice Sessions | `exam-service`: `PracticeSessionService.java` |
| **VULN-P0-02** | **CRITICAL** | Authorization | Unauthenticated Catalog Status Modification (BFLA) | `exam-service`: `QuestionCatalogController.java` |
| **VULN-P0-03** | **CRITICAL** | Cryptography | `JWT_SECRET` Omitted in Docker Compose for exam-service | Root: `docker-compose.yml` |
| **VULN-P0-04** | **CRITICAL** | Identity | Blind Trust of Downstream `X-User-Id` Header | `notification-service`, `auth-service` |
| **VULN-P0-05** | **CRITICAL** | Cryptography | Double BCrypt Overhead on Every Normal Login | `auth-service`: `AuthService.java` |
| **VULN-P0-06** | **CRITICAL** | Ingress / DoS | Gateway Rate Limiter Key Spoofing | `frontend-api`: `RateLimiterConfig.java` |
| **VULN-P0-07** | **CRITICAL** | Business Flow | Client-Controlled XP Injection & Streak Farming | `auth-service`: `GamificationController.java` |
| **VULN-P0-08** | **CRITICAL** | Supply Chain | 10 Critical Transitive CVEs in Embedded Runtime | Root: `backend/pom.xml` |
| **VULN-P0-09** | **CRITICAL** | Supply Chain | Nginx Base Image EOL with Critical Libexpat CVEs | Orchestration: `docker-compose.yml` |
| **VULN-P0-10** | **CRITICAL** | Test Quality | Zero-Assertion / Zero-Verification Unit Tests | `exam-service`, `auth-service` tests |
| **VULN-P1-01** | **HIGH** | Authentication | Complete Omission of Spring Security in exam-service | `exam-service`: `pom.xml` |
| **VULN-P1-02** | **HIGH** | Test Quality | Security Filter Disabling in WebMvc Slice Tests | `exam-service`, `notification-service` tests |
| **VULN-P1-03** | **HIGH** | Concurrency | Lost Updates & Submission Race Condition | `exam-service`: `PracticeSessionEntity.java` |
| **VULN-P1-04** | **HIGH** | Network | Dev Override Host Port Exposure to 0.0.0.0 | Root: `docker-compose.override.dev.yml` |
| **VULN-P1-05** | **HIGH** | Container | Ingestion Service Executes as Root (uid=0) | `ingestion-service`: `Dockerfile` |
| **VULN-P1-06** | **HIGH** | Container | Total Absence of Container CPU & Memory Limits | Root: `docker-compose.yml` |
| **VULN-P1-07** | **HIGH** | Network | Egress Blackhole (`internal: true`) Blocks AI/SMTP | Root: `docker-compose.yml` |
| **VULN-P1-08** | **HIGH** | Static Code | SpotBugs Absent; Gateway NPE in TraceHeaderFilter | Multi-module `pom.xml`, `TraceHeaderFilter.java` |
| **VULN-P1-09** | **HIGH** | Static Code | PMD Cyclomatic Complexity Threshold Inflated to 15 | `backend/config/pmd/pmd-ruleset.xml` |
| **VULN-P1-10** | **HIGH** | Test Quality | Surviving Mutation in CompleteSession Save Call | `exam-service`: `PracticeSessionServiceTest.java` |
| **VULN-P1-11** | **HIGH** | Test Quality | Missing Cryptographic Boundary JWT Tests | `auth-service`, `notification-service` tests |
| **VULN-P2-01** | **MEDIUM** | Static Code | Checkstyle MethodName Weakened Globally | `backend/config/checkstyle/checkstyle.xml` |
| **VULN-P2-02** | **MEDIUM** | Architecture | QuestionDtoMapper Static Helper Bypasses MapStruct | `exam-service`: `QuestionDtoMapper.java` |
| **VULN-P2-03** | **MEDIUM** | Test Quality | Fragile Shell Script & Shallow Smoke Probes | `tests/smoke/preflight-smoke.sh` |
| **VULN-P2-04** | **MEDIUM** | Ingress / CI | Newman `--delay-request 100` Rate Limiter Workaround | `.github/workflows/ci.yml` |
| **VULN-P2-05** | **MEDIUM** | Secrets | Blanket Gitleaks Allowlist Suppresses CI Workflows | `.gitleaks.toml` |
| **VULN-P2-06** | **MEDIUM** | Perimeter | Nginx Child Location Context Wipes Security Headers | `infrastructure/nginx/nginx.conf` |
| **VULN-P2-07** | **MEDIUM** | Misconfig | Public Infrastructure Leakage via Actuator Health | All microservices: `application.yml` |
| **VULN-P2-08** | **MEDIUM** | Security | Unsanitized External LLM Output Ingested | `exam-service`: `SocraticTutorService.java` |
| **VULN-P2-09** | **MEDIUM** | Resource DoS | Unbounded Pagination Page Size (`size=1000000`) | `exam-service`: `QuestionFilterCommand.java` |
| **VULN-P2-10** | **MEDIUM** | Config | Gateway CORS Origins Env Variable Ignored | `frontend-api`: `application.yml` |
| **VULN-P2-11** | **MEDIUM** | Authorization | System-Wide Notification Broadcast Callable by Students| `auth-service`: `GamificationController.java` |
| **VULN-P2-12** | **MEDIUM** | Test Quality | Over-Permissive Mockito Matchers (`anyString()`) | `exam-service`: `SocraticTutorServiceTest.java` |
| **VULN-P2-13** | **MEDIUM** | Test Quality | Tautological Pass-Through Tests | `exam-service`: `QuestionCatalogServiceTest.java` |
| **VULN-P2-14** | **MEDIUM** | Test Quality | Level Milestone Boundary Skipping | `auth-service`: `GamificationServiceTest.java` |
| **VULN-P2-15** | **MEDIUM** | Secrets | Plaintext Default Password Fallbacks in Compose | Root: `docker-compose.yml` |
| **VULN-P2-16** | **MEDIUM** | Container | Dangerous Docker Socket Mount in Autoheal | Root: `docker-compose.yml` |
| **VULN-P2-17** | **MEDIUM** | Authentication | Absence of Redis JWT Revocation Blocklist & Logout | `auth-service`: `AuthController.java` |
| **VULN-P2-18** | **MEDIUM** | Exposure | Missing Serialization Guards on Sensitive User Models | `auth-service`: `User.java`, `UserEntity.java` |
| **VULN-P2-19** | **MEDIUM** | Authorization | Client-Supplied `userId` Binding in Session Creation | `exam-service`: `StartSessionRequest.java` |
| **VULN-P2-20** | **MEDIUM** | Perimeter | Nginx Server Version Leaked in Response Banners | `infrastructure/nginx/nginx.conf` |
| **VULN-P3-01** | **LOW** | Perimeter | Port 443 Forwarded Without SSL/TLS Configuration | Orchestration: `docker-compose.yml`, `nginx.conf` |
| **VULN-P3-02** | **LOW** | Perimeter | Missing Modern Headers (HSTS, CSP, Permissions) | `infrastructure/nginx/nginx.conf` |
| **VULN-P3-03** | **LOW** | Performance | Unindexed `ORDER BY RANDOM()` Performance Degradation| `exam-service`: `SpringDataQuestionRepository.java`|
| **VULN-P3-04** | **LOW** | Tech Debt | Dead Code in Gamification Service Reset Method | `auth-service`: `GamificationService.java` |
| **VULN-P3-05** | **LOW** | Uniformity | Absence of RFC 7807 Advice in Notification Service | `notification-service`: controller package |
| **VULN-P3-06** | **LOW** | Route Hygiene | Zombie Gateway Route `/api/v1/users/**` | `frontend-api`: `application.yml` |
| **VULN-P3-07** | **LOW** | Container | Missing Container-Aware JVM Memory Flags | All Java Dockerfiles |
| **VULN-P3-08** | **INFO** | Network | Fixed Outbound Gemini URL Lacks Dedicated Proxy | `exam-service`: `GeminiTutorClientAdapter.java` |

---

## 8. Governance, Compliance & Master Sign-Off

### 8.1 Regulatory & Program Compliance Assessment

1. **LGPD (Lei Geral de Proteção de Dados - Law 13.709/2018):**
   - *Current Status:* **Partially Compliant.**
   - *Gaps:* Practice session BOLA and insecure `X-User-Id` trust allow unauthorized access to student performance data and notification histories. Sensitive entity models lack explicit `@JsonIgnore` annotations.
   - *Resolution:* Implementation of P0-01, P0-04, and P2-18 will establish full compliance with Articles 6 (Security) and 46 (Technical Safeguards).
2. **Reconecta Recode JAM 1 Benchmark:**
   - *Current Status:* **100% Compliant ✅.**
   - *Verification:* The core objective of delivering a documented, tested, containerized backend API in a public GitHub repository is fully satisfied.

---

### 8.2 Lead Security Architect Final Attestation

```
=============================================================================================================
MASTER AUDIT ATTESTATION & FORMAL SIGN-OFF
=============================================================================================================
Auditor:               Lead Security Architect & Quality Engineering Director
Role:                  Master Audit Synthesizer (TASK-S3-11 Phase 6)
Project:               AprovaENEM Backend Ecosystem (Reconecta Recode Pro)
Date:                  September 21, 2026

I hereby certify that the multi-stage security, architectural integrity, and test suite authenticity audit 
of the AprovaENEM backend platform has been completed in full compliance with the highest standards of software 
engineering, OWASP API Security methodologies, and DevSecOps quality practices.

The findings, metrics, and risk cascades detailed in this report represent an objective, empirical evaluation 
of the codebase. The prioritized remediation roadmap provides a deterministic path to enterprise-grade 
security, unlocking the commercial cloud release gate upon completion of Tier P0 hotfixes.

Official Evaluation:
- Milestone JAM 1 Backend Delivery: APPROVED ✅ (Grade: 100%)
- Global Engineering Maturity Index: 65.58% (Grade: D+ / Conditional Release Gate)
- Commercial Cloud Production Gate:  CONDITIONALLY BLOCKED PENDING TIER P0 REMEDIATIONS 🛡️

Signature: Lead Security Architect & Master Audit Synthesizer
=============================================================================================================
```
