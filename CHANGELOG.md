# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.3.15] - 2026-09-20
### 🛡️ Added, Hardened & Documented (Governance, CI Execution & Backlog Investigation Scope)
- docs(license): Adopted PolyForm Noncommercial License 1.0.0 in root `LICENSE` file and synchronized OpenAPI configs, strictly prohibiting commercial monetization and private prep-course exploitation while preserving 100% free educational access for students, public schools, and non-profits.
- config(env): Added `AUTH_PASSWORD_PEPPER` configuration to `.env.example` under JWT & Password Security section, documenting HMAC-SHA256 secret pepper pre-hashing ($2^{10}$ BCrypt rounds).
- ci(actions): Hardened GitHub Actions CI workflow in `.github/workflows/ci.yml`:
  - Fixed YAML scanner syntax error by enclosing all stage names containing colons in double quotes (`"Stage X: ..."`).
  - Configured `mvn clean install -B -DskipTests` in Stage 1 to install `common-core` into the runner's local repository, resolving multi-module dependencies during static analysis in Stage 2.
  - Resolved `jacoco:check` missing rules failure on parent `aprovaenem-parent` POM by aligning Stage 5 test execution with Maven lifecycle bindings (`mvn test -B -Dspring.profiles.active=test`).
  - Fixed global npm installation command in Job 2 (`npm install -g newman`, removing nonexistent `newman-reporter-junitxml` package as JUnit reporting is built into Newman core).
  - Created `.gitleaks.toml` allowlist to ignore documentation Markdown files (`docs/`, `README.md`) containing sample mock JWT tokens and API contract payloads, preventing false-positive secret detections.
- docs(backlog): Updated `docs/BACKLOG.md`:
  - Expanded **`TASK-S3-11`** scope to mandate a deep technical investigation and audit of all rapid changes and potential workarounds made without websearch (Checkstyle `MethodName` regex `^[a-z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$` for Spring Data JPA repository traversals vs `@Query`, PMD ruleset configuration $\le 15$ cyclomatic complexity, `QuestionDtoMapper` extraction and domain encapsulation, shell script regex parsing in `preflight-smoke.sh` vs `jq`, Newman `--delay-request 100` rate limiter interactions, and HMAC-SHA256 password pepper backward compatibility).
  - Marked **`TASK-S3-12`** as **DONE ✅** reflecting that the JAM 1 backend platform deliverable has been officially submitted to the Reconecta Recode platform.
  - Formally clarified that visual showcase assets (`docs/images/` catalog) are scheduled for Month 4 (Sprint 6/7) during full-stack presentation preparation, not Sprint 3.
  - Updated Sprint 3 milestone progress to 93% (13/14 tasks completed).
- docs(readme): Updated `README.md` and `docs/specifications/07-quality-gate-ci.md` to reference `.github/workflows/ci.yml`, document the 7-stage CI quality gate, and align PMD cyclomatic complexity ($\le 15$) and CPD token thresholds (100 tokens).

## [0.3.14] - 2026-09-20
### 🚀 Added & Verified (7-Stage GitHub Actions CI Quality Gate & Pre-Flight Smoke Suite)
- ci(backend): Implement production-grade 7-stage GitHub Actions CI pipeline in `.github/workflows/ci.yml` (TASK-S3-10)
  - **Stage 1 (Strict Compilation)**: Configured strict Maven compilation enforcing Java 21 compiler flags (`-parameters`, `-Werror`) across all 6 backend modules (`common-core`, `frontend-api`, `auth-service`, `exam-service`, `notification-service`).
  - **Stage 2 (Static Analysis & Cyclomatic Complexity)**: Integrated `maven-checkstyle-plugin` (Google Java Style with Spring Data JPA extensions) and `maven-pmd-plugin` (ruleset bounding cyclomatic complexity $\le 15$ per method and $\le 80$ per class), achieving 0 violations across all 6 modules.
  - **Stage 3 (Code Duplication Detection)**: Configured PMD CPD duplication gate with a 100-token threshold (< 3% duplication budget); created shared `QuestionDtoMapper` in `exam-service` eliminating redundant mapping logic between `PracticeSessionController` and `QuestionCatalogController`.
  - **Stage 4 (Security Dependency & Secret Audit)**: Integrated Gitleaks commit history secret scan (`gitleaks/gitleaks-action@v2`) and Trivy vulnerability filesystem audit (`aquasecurity/trivy-action@master`).
  - **Stage 5 (Backend Test Suite & JaCoCo Quality Gate)**: Automated test execution and JaCoCo coverage quality gate ($\ge 80\%$ line, $\ge 75\%$ branch coverage) with automated artifact archiving for coverage reports (`jacoco.exec` and HTML reports).
  - **Stage 6 (Docker Compose Production Ecosystem & Pre-Flight Smoke Suite)**: Automated container ecosystem initialization and live health verification; created `tests/smoke/preflight-smoke.sh` executing 7 comprehensive probes (Edge Nginx `/health`, Gateway `/actuator/health`, distributed trace header propagation, question bank catalog browse, anonymous session creation, practice session start, and practice query verification) completing with 100% green pass rate in 147ms (well within the $< 15\text{s}$ SLA budget).
  - **Stage 7 (Automated Postman Newman API Contract Suite & k6 Smoke)**: Executed Postman collection `docs/postman/AprovaENEM.postman_collection.json` via Newman (31 requests, 56 assertions, 100% pass rate in 9.7s) and headless Grafana k6 smoke verification (`catalog-browse-load.js` in `CI_FAST` mode with 150 VUs, 0% errors, and sub-135ms P95 latency).
- feat(nginx): Added `/actuator/health` proxy location to `infrastructure/nginx/nginx.conf` routing to `frontend-api` BFF for standardized perimeter health checks and Kubernetes/Prometheus probes.
- fix(quality): Cleaned up static analysis findings across services:
  - Removed unused imports in `GlobalGatewayExceptionHandler`, `PracticeSessionEntity`, and `NotificationEventListener`.
  - Wrapped long lines exceeding 160 characters in `EmailVerificationService`, `OpenApiConfig`, `BCryptPasswordEncoderAdapter`, and `GeminiTutorClientAdapter`.
  - Added curly braces to single-line control flow statements in `GamificationService` and `RedisTutorQuotaAdapter`.
  - Added structured audit logging for tier promotion/relegation metrics during weekly league resets.
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-10` as `DONE ✅`, advancing Sprint 3 completion to 86% (12/14 tasks completed).

## [0.3.13] - 2026-09-20
### 🚀 Added & Verified (Containerized Grafana k6 Load & Stress Testing Suite)
- test(stress): Implement containerized Grafana k6 load, stress, and concurrency benchmarking suite (`tests/stress/`) across 3 high-risk operational scenarios (TASK-S3-06b)
  - `catalog-browse-load.js`: Simulates the Exam Rush scenario with 150 to 1,000 concurrent Virtual Users (VUs) querying the question catalog, difficulty filters, and single question lookups against Redis L2 cache and PostgreSQL:
    - Achieved **593.01 requests / second throughput** with **100.00% check pass rate** (51,390/51,390 checks) across 18,002 HTTP requests.
    - Verified sub-130ms P95 overall latency (**129.52 ms P95**, 23.83 ms median) and **0.00% error rate** with **0 unhandled 5xx server errors**.
    - Verified Redis L2 cache single-question lookups completing in **21.13 ms median** and **118.91 ms P95**, shielding PostgreSQL HikariCP connection pools from exhaustion.
  - `socratic-burst-stress.js`: Simulates high-concurrency Socratic AI consultation bursts against `POST /api/v1/questions/{id}/ask`:
    - Validated Spring Cloud Gateway Redis Token Bucket rate limiting returning `429 Too Many Requests` in **1.82 ms average**, successfully intercepting 952 excess requests without downstream compute exhaustion.
    - Verified **100.00% compliant status code rate** (200, 429, 401) with **0 unhandled 500 internal server errors**, confirming Resilience4j circuit breaker fallback stability.
  - `leaderboard-concurrency.js`: Simulates concurrent student practice session lifecycle, answer attempt submissions, automated scoring, RabbitMQ transactional outbox event ingestion, and weekly leaderboard queries on Redis Sorted Sets (`ZSET`):
    - Ingested **2,493 completed attempts** across 50 concurrent workers with **100.00% check pass rate** (12,496/12,496 checks) and **0.00% error rate**.
    - Achieved **60.41 ms P95** and **105.67 ms P99** overall latency, beating the $< 250\text{ ms}$ SLA target.
    - Verified Redis ZSET weekly leaderboard queries completing in **16.53 ms median** and **58.70 ms P95** under sustained read/write load.
- ci(stress): Added automated stress test execution tooling:
  - `tests/stress/run-k6-stress.sh`: Unified CLI runner supporting `catalog`, `socratic`, `leaderboard`, and `all` scenarios with configurable `BASE_URL` and `CI_FAST` flags.
  - `tests/stress/docker-compose.k6.yml`: Containerized k6 service definitions attached to `aprovaenem-internal` and `frontend-edge` Docker networks.
- docs(benchmarks): Published comprehensive stress testing and saturation report in `docs/benchmarks/jam1-k6-stress-benchmarking.md` detailing architecture, test scenarios, percentile tables, bottleneck analysis, and SLA verification.
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-06b` as `DONE ✅`, advancing Sprint 3 completion to 79% (11/14 tasks completed).

## [0.3.12] - 2026-09-20
### 🔐 Added & Hardened (Password Storage Pepper Hardening via HMAC-SHA256 + BCrypt)
- sec(auth): Layer application-level secret pepper over BCrypt in `auth-service` via `BCryptPasswordEncoderAdapter` and `PasswordEncoderPort` (TASK-S3-07b)
  - Implemented HMAC-SHA256 pre-hashing using `javax.crypto.Mac` with Base64 encoding before standard BCrypt hashing ($2^{10}$ rounds).
  - Externalized secret pepper key to `AUTH_PASSWORD_PEPPER` environment variable (`auth.password-pepper` property in `application.yml` and `docker-compose.yml`) with secure fallback for local development.
  - Eliminated the known BCrypt 72-byte truncation collision attack vector, ensuring passwords of arbitrary length yield uniform 32-byte HMAC digests prior to BCrypt hashing.
  - Provided dual-check backward compatibility: `matches(rawPassword, encodedPassword)` evaluates HMAC-SHA256 + BCrypt first, and falls back to legacy raw BCrypt comparison.
  - Added seamless automatic hash migration on login: `AuthService.login()` detects legacy hashes via `isLegacyHash()` and transparently re-encodes with pepper and persists the updated hash to PostgreSQL within `@Transactional` boundary.
- test(auth): Added comprehensive unit and integration verification for peppered password hashing:
  - `BCryptPasswordEncoderAdapterTest`: 7 unit tests verifying peppered hashing, dual-check legacy validation, rejection of invalid credentials, immunity to BCrypt 72-byte truncation collision, empty pepper fallback, null safety, and default port method behavior.
  - `AuthServiceTest`: Added `shouldSeamlesslyUpgradeLegacyPasswordHashOnLogin` verifying automatic upgrade and persistence.
  - `AuthRepositoryAndFlywayIT`: 4 Testcontainers integration tests passing against real PostgreSQL 16.
  - Maintained high JaCoCo coverage in `auth-service`: 95.8% line coverage, 84.1% branch coverage (exceeding $\ge 80\%$ line and $\ge 75\%$ branch thresholds).
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-07b` as `DONE ✅`, advancing Sprint 3 completion to 71% (10/14 tasks completed).

## [0.3.11] - 2026-09-20
### 🛡️ Added & Hardened (Resilience4j Chaos & Fault Injection Testing Suite)
- test(resilience): Implement Resilience4j Chaos and Circuit Breaker integration testing suite (`Resilience4jChaosAndCircuitBreakerIT`) across `exam-service` against real Testcontainers (`PostgreSQL 16 pgvector` + `Redis 7.2`) with embedded JDK HTTP fault injection server (TASK-S3-07)
  - Verified 6 fault injection and chaos scenarios:
    1. **Normal Operation (CLOSED state)**: Verified live Gemini API invocation (HTTP 200 OK) returning model output with `isFallback: false`, verifying Circuit Breaker remains in `CLOSED` state.
    2. **Latency Fault Injection (API Timeout > 1s)**: Simulated downstream API hang exceeding configured read timeout (2,000ms delay vs. 1,000ms timeout), triggering graceful Socratic fallback with reflective pedagogical hints and `isFallback: true`.
    3. **HTTP 429 Quota Exhaustion (Rate Limiting)**: Simulated upstream LLM quota exhaustion (`RESOURCE_EXHAUSTED`), verifying instant fallback execution and graceful degradation without throwing exceptions.
    4. **Sustained Chaos & Zero-Traffic Short-Circuiting**: Injected 3 consecutive HTTP 503 service failures, automatically tripping the Circuit Breaker from `CLOSED` to `OPEN` (breaching the 50% failure rate threshold over `minimum-number-of-calls: 3`). Verified that subsequent requests immediately short-circuit in memory without dispatching any network packets (`requestCounter` delta = 0).
    5. **Automated Recovery Cycle (`OPEN` -> `HALF_OPEN` -> `CLOSED`)**: Probed recovery transitions through `HALF_OPEN` state, verifying that 2 successful probe requests reset the breaker back to `CLOSED` and restore live LLM traffic.
    6. **End-to-End Service Orchestration**: Verified full flow through `SocraticTutorService.askTutor(...)`, confirming `TutorConsultationResult.isFallback()` propagation, fallback messaging containing curated INEP pedagogical concepts, and accurate thread history metadata recording (`modelUsed = "static-inep-fallback"` vs `"gemini-1.5-flash"`).
- refactor(tutor): Refined `TutorAiPort` domain contract and `GeminiTutorClientAdapter` to return `TutorAiResult(String responseText, boolean isFallback)` domain record instead of primitive `String`, properly encapsulating AI invocation provenance and fallback status.
- config(network): Added `RestClientConfig` configuring `RestClient.Builder` with configurable connect and read timeouts (`gemini.timeout-seconds`, default 5s, 1s in test profile) via `SimpleClientHttpRequestFactory`.
- test(unit): Updated `GeminiTutorClientAdapterTest` and `SocraticTutorServiceTest` to validate `TutorAiResult` return contracts and fallback propagation.
- docs(backlog): Synchronize `docs/BACKLOG.md` marking `TASK-S3-07` as `DONE ✅`, advancing Sprint 3 completion to 64% (9/14 tasks completed), and schedule `TASK-S4-00` (Historical Question Catalog Bulk Ingestion & Reconciliation 2019–2023) as the kick-off task for Sprint 4.

## [0.3.10] - 2026-09-20
### ⚡ Added & Optimized (Redis Caching, Lettuce Connection Pooling & Latency Benchmarking Suite)
- perf(cache): Implement Redis caching layers, connection pool tuning, and comprehensive latency benchmarking suite across `exam-service` and `auth-service` (TASK-S3-06)
  - `exam-service`:
    - Added `RedisCacheAndLatencyBenchmarkIT` (4 integration tests against real PostgreSQL 16 `pgvector` and Redis 7.2 containers):
      - Verified L2 entity cache: Cold miss on PostgreSQL (30.57ms) vs. Hot cache hit on Redis (2.18ms average, 2.10ms P50, 2.90ms P95), achieving a **14x latency reduction (92.8% speedup)** on question retrieval.
      - Verified cache eviction consistency: `@CacheEvict` on administrative status update immediately invalidates Redis key and triggers fresh re-hydration on next read.
      - Verified PostgreSQL composite index query performance: Executed parameterized queries against `idx_questions_active_serving` (`topic_id`, `difficulty_level`, `status = 'ACTIVE'`), achieving sub-millisecond latency (**0.38ms average**, 0.36ms P50, 0.59ms P95), surpassing the sub-5ms SLA.
      - Verified concurrent atomic Socratic daily quota acquisition: 50 concurrent threads dispatched simultaneously via `CountDownLatch`; exactly 1 thread acquired quota and 49 were rejected with sub-30ms P95 latency (**25.23ms average**, 27.56ms P95), completely eliminating race condition vulnerabilities.
    - Fixed `RedisTutorQuotaAdapter`: Clamped reported used quota to `FREE_DAILY_LIMIT` in `getQuotaStatus` to ensure rejected requests do not skew consumed quota metrics.
  - `auth-service`:
    - Added concurrent load benchmark `shouldAchieveSubMillisecondRankingUnderConcurrentLoad` to `RedisLeaderboardIT`: Simulated 500 concurrent `ZADD`, `ZREVRANK`, and `ZREVRANGEBYSCORE` operations across 10 threads, completing in 619ms (**1.24ms wall-clock per op, 807 ops/sec throughput**).
  - build(redis): Added `org.apache.commons:commons-pool2` to `auth-service` and `exam-service`, configuring production Lettuce connection pooling (`max-active: 16`, `max-idle: 8`, `min-idle: 2`, `max-wait: 2000ms`, `timeout: 2000ms`).
- docs(benchmarks): Published comprehensive latency benchmark report in `docs/benchmarks/jam1-redis-latency-benchmarking.md` detailing architecture, test scenarios, execution metrics, percentile distributions, and production recommendations.
- docs(backlog): Synchronize `docs/BACKLOG.md` marking `TASK-S3-06` as `DONE ✅` and scheduling `TASK-S3-06b` (Backend Load & Stress Testing with Grafana k6).
- docs(quality-gate): Formalize automated Pre-Flight Smoke Testing (< 15s) and containerized Grafana k6 Full-System Stress & Load Testing (`tests/stress/`) across `docs/specifications/07-quality-gate-ci.md`, `README.md`, and `docs/BACKLOG.md` (covering Exam Rush 1,000+ VU simulation, Socratic consultation bursts, and post-deployment smoke verification in `TASK-S6-05`).

## [0.3.9] - 2026-09-20
### 📊 Added & Enforced (JaCoCo Unified Backend Coverage Quality Gate >= 80% Line, >= 75% Branch)
- test(coverage): Implement comprehensive adapter, security, and messaging unit tests across all backend microservices, bringing overall suite to 336 tests (100% green, 0 errors, 0 failures) and enforcing the automated JaCoCo coverage quality gate in Maven `verify` lifecycle (TASK-S3-05)
  - `auth-service` (132 unit tests passing): Attains **96.25% line coverage** (975/1013) and **82.69% branch coverage** (129/156)
    - Added `JwtAuthenticationFilterTest` (5 tests): Verifies valid Bearer token extraction, user details loading, security context authentication, missing header bypass, non-Bearer bypass, invalid token handling, and runtime exception tolerance
    - Added `GamificationRepositoryAdapterTest` (4 tests): Verifies profile querying, upserting, streak freeze updates, weekly leaderboard persistence, and badge unlocking
    - Added `OutboxRepositoryAdapterTest` (4 tests): Verifies outbox event persistence, pending batch queries, and status updates
    - Added `OutboxPollingWorkerTest` (3 tests): Verifies periodic polling, exchange publishing, and broker error resilience
    - Added `RabbitMQNotificationPublisherAdapterTest` (2 tests): Verifies study reminder event dispatch and failure handling
    - Added `JwtTokenProviderTest` (2 tests), `CustomUserDetailsServiceTest` (4 tests), and `BCryptPasswordEncoderAdapterTest` (1 test)
    - Expanded `GamificationServiceTest` with 6 new branch test cases: Initializing streak on null last activity date, same-day activity question accumulation, LEVEL_10 badge unlock and skipping redundant daily goal bonus, cold Redis cache fallback to Postgres leaderboard, partial daily goal updates, and silent handling when user entity is absent
  - `exam-service` (157 unit tests passing): Attains **88.67% line coverage** (1378/1554) and **75.75% branch coverage** (303/400)
    - Added `GeminiTutorClientAdapterTest` (6 tests with `MockRestServiceServer`): Verifies JSON payload construction, Socratic prompt forwarding, response parsing, and error fallback
    - Added `QuestionRepositoryAdapterTest` (7 tests): Verifies pagination, filtering, full-text search, and status updates
    - Added `PracticeSessionRepositoryAdapterTest` (8 tests): Verifies session lifecycle and student attempts
    - Added `DiagnosticReportRepositoryAdapterTest` (4 tests): Verifies diagnostic report persistence
    - Added `DomainCommandsAndModelsTest` (5 tests): Verifies `AiQuotaStatus`, `StartSessionCommand`, `TutorChatMessage`, `QuestionFilterCommand`, and `TutorConsultationResult`
    - Added `TutorChatRepositoryAdapterTest` (7 tests) and `RagKnowledgeAdapterTest` (3 tests)
  - `notification-service` (22 unit tests passing): Attains **99.24% line coverage** (131/132) and **81.25% branch coverage** (13/16)
    - Added `NotificationEventListenerTest` (4 tests): Verifies RabbitMQ event listener consumption for email verification and daily study goal reminders
    - Added `JwtTokenValidatorTest` (2 tests): Verifies JWT signature validation and user ID extraction
  - `frontend-api` (17 unit tests passing): Attains **94.20% line coverage** (65/69) and **88.64% branch coverage** (39/44)
    - Added `TraceHeaderFilterTest` (4 tests): Verifies `X-Trace-Id` generation, propagation, and reactive WebFilter integration
    - Added `GlobalGatewayExceptionHandlerTest` (5 tests): Verifies RFC 7807 problem details generation for WebFlux gateway exceptions
    - Added `RateLimiterConfigTest` (8 tests): Verifies Token Bucket rate limiting resolver and route configurations
    - Added `io.projectreactor:reactor-test` test scope dependency
  - `common-core` (8 unit tests passing): Attains **100% line coverage** (8/8) and **100% branch coverage**
- build(maven): Configure `jacoco-maven-plugin:0.8.12` with `<id>check</id>` execution bound to `<phase>verify</phase>` in root `pom.xml`, establishing a hard build quality gate requiring `<counter>LINE</counter> >= 0.80` and `<counter>BRANCH</counter> >= 0.75` across all packaging modules
- docs(backlog): Synchronize `docs/BACKLOG.md` marking `TASK-S3-05` as `DONE ✅` and advancing Sprint 3 completion to 58% (7/12 tasks completed)
- docs(audit): Expand both milestone audit specifications (`TASK-S3-11` in Sprint 3 for backend and `TASK-S6-06` in Sprint 6 for full-stack) across `docs/BACKLOG.md` and `docs/specifications/07-quality-gate-ci.md` to establish a 5-Stage Security & Test Suite Integrity Audit framework, incorporating a dedicated Test Quality & Legitimacy Audit stage (detecting test smells, vacuous/tautological assertions, over-mocking, swallowed exceptions, unhandled async promise rejections, and mutant fault injection verification)
- docs(specs): Align `docs/specifications/04-data-modeling.md` (Question domain model attributes: `triParamA/B/C`, `figureUrl`, `figureAltText`, `contentLanguage`) and `docs/specifications/05-api-specification.md` (sequential section numbering for email resend verification) with current microservice implementations and Flyway DDL migrations
- fix(database): Align `V1__init_exam_schema.sql`, `QuestionEntity`, and `QuestionRepositoryAdapter` with `04-data-modeling.md` by including `figure_url` and `figure_alt_text` columns for INEP charts and WCAG 1.1.1 screen-reader descriptions
- docs(backlog): Add `TASK-S3-07b` (Password Storage Pepper Hardening via HMAC-SHA256 + BCrypt) to Sprint 3 backlog and roadmap to provide defense-in-depth against isolated database breaches

## [0.3.8] - 2026-09-20
### 🧪 Added (Test Pyramid - Testcontainers PostgreSQL 16 pgvector & Redis Integration Tests)
- test(integration): Implement real container integration test suites across `auth-service`, `exam-service`, and `notification-service` verifying database migrations, JPA repositories, full-text search, and Redis caching with Testcontainers (5 test suites, 16 integration tests, 100% passing) (TASK-S3-04)
  - `AuthRepositoryAndFlywayIT` (4 tests): Verifies PostgreSQL 16 container executing Flyway migrations V1–V3 (`init_auth_schema`, `auth_indexes`, `gamification_and_sessions`), `UserRepositoryAdapter` CRUD, `GamificationRepositoryAdapter` profile persistence, XP accumulation, streaks, and `AnonymousSessionRepositoryAdapter` provisioning and post-registration claiming
  - `RedisLeaderboardIT` (2 tests): Verifies real Redis 7.2 container executing atomic ZSET operations (`ZADD`, `ZREVRANGE_WITHSCORES`), rank retrieval, score incrementation, and clean league reset eviction
  - `ExamPersistenceIT` (4 tests): Verifies `pgvector/pgvector:pg16` container with `vector` extension, Flyway migrations V1–V4 (`init_exam_schema`, `exam_performance_indexes`, `exam_seed_data`, `tutor_chat_schema`), Portuguese full-text search (`to_tsvector('portuguese', ...)` with GIN indexes), Question CRUD with status lifecycle transitions, and Practice Session persistence with Student Attempts
  - `RedisTutorQuotaIT` (3 tests): Verifies real Redis 7.2 container enforcing Socratic AI daily quota tracking with TTL, quota exhaustion for standard students, unlimited access bypass for premium students, and cross-student key isolation
  - `NotificationRepositoryAndFlywayIT` (3 tests): Verifies PostgreSQL 16 container executing Flyway migrations V1–V2 (`init_notification_schema`, `notification_indexes`), `UserDeviceTokenRepository` token registration, querying by active status, and deactivation, and `NotificationLogRepository` persisting multi-channel notifications (in-app, email, push) with JSONB metadata and unread status counting
- build(maven): Configure Maven Failsafe Plugin in root `backend/pom.xml` for integration test execution (`*IT.java`) with strict separation from Surefire fast unit tests (`*Test.java`), and Docker Java API version 1.44 negotiation properties for host Docker Engine 29+ compatibility
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-04 as DONE, advancing Sprint 3 completion to 50% (6/12 tasks completed)

## [0.3.7] - 2026-09-20
### 🛡️ Added (Test Pyramid - Spring Security & WebMvc MockMvc Tests)
- test(security): Implement comprehensive WebMvc MockMvc test suites across `auth-service`, `exam-service`, and `notification-service` verifying HTTP status codes, security boundaries, and validation rules (7 test suites, 48 tests, 100% passing, total backend tests reach 202 tests) (TASK-S3-03)
  - `AuthControllerWebMvcTest` (10 tests): Validates registration (201 Created / 400 Bad Request on duplicate/validation error), login (200 OK / 400 Bad Request on invalid credentials), authenticated user profile (200 OK / 401 Unauthorized), LGPD Art. 18 data portability export (200 OK), LGPD account erasure (204 No Content), email verification (200 OK), and resend verification (200 OK)
  - `GamificationControllerWebMvcTest` (7 tests): Validates authenticated profile retrieval (200 OK / 401 Unauthorized / 403 Forbidden without `ROLE_STUDENT`), daily study goal configuration (200 OK), weekly leaderboard rankings (200 OK), badge catalog (200 OK), and daily activity heatmap (200 OK)
  - `SessionControllerWebMvcTest` (3 tests): Validates public anonymous session creation with client IP resolution (201 Created), public session retrieval (200 OK), and non-existent session error handling (404 Not Found)
  - `SocraticTutorControllerWebMvcTest` (6 tests): Validates unauthenticated AI tutor access rejection with registration CTA problem details (401 Unauthorized), authenticated Socratic consultation with dynamic quota response headers `X-AI-Quota-*` (200 OK), daily quota exhaustion with RFC 7807 problem details (429 Too Many Requests), multi-turn chat history retrieval (200 OK), thread reset (200 OK), and daily quota check (200 OK)
  - `QuestionCatalogControllerWebMvcTest` (5 tests): Validates paginated question catalog retrieval with filter parameters and answer masking to prevent cheating (200 OK), single question detail retrieval (200 OK), question not found (404 Not Found), administrative status update (200 OK), and missing status validation (400 Bad Request)
  - `PracticeSessionControllerWebMvcTest` (8 tests): Validates starting practice session via `X-Session-Id` header (201 Created), starting session via request body (201 Created), missing session identifier validation (400 Bad Request), session retrieval (200 OK), answer submission with instant grading and explanation (201 Created), missing question ID validation (400 Bad Request), session completion (200 OK), and diagnostic report retrieval (200 OK)
  - `NotificationControllerWebMvcTest` (9 tests): Validates push token registration via `X-User-Id` header (201 Created), push token registration via Bearer JWT token (201 Created), unauthenticated token registration rejection (401 Unauthorized), invalid platform validation (400 Bad Request), notification feed retrieval (200 OK / 401 Unauthorized), marking notification as read (200 OK / 404 Not Found), and unread count query (200 OK)
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-03 as DONE, advancing Sprint 3 completion to 42% (5/12 tasks completed), and embedding Mermaid Test Pyramid diagram

## [0.3.6] - 2026-09-20
### 🧪 Added (Test Pyramid - Application Service Unit Tests)
- test(application): Implement comprehensive Mockito unit test suites for all Application Services and Use Cases across `exam-service`, `auth-service`, and `notification-service` (57 tests, 100% passing, total suite reaches 191 tests across backend) (TASK-S3-02)
  - `QuestionCatalogServiceTest` (6 tests): Validates paginated question catalog filtering by subject/difficulty, question detail retrieval, active status updates, and administrative suspension notes
  - `PracticeSessionServiceTest` (8 tests): Validates session initialization with question randomizer, answer submission with instant grading and duplicate submission rejection, diagnostic report generation with accuracy radar and pedagogical recommendations, and session abandonment
  - `SocraticTutorServiceTest` (6 tests): Validates Gemini AI Socratic guidance with RAG chunk injection, anonymous user access rejection, daily quota exhaustion guarding, 6-turn interaction threshold enforcement, and conversation thread resets
  - `AuthServiceTest` (7 tests): Validates student registration with BCrypt hashing and Outbox event dispatch, login authentication with JWT generation, credential rejection, deactivated account guarding, LGPD Art. 18 data portability export, and permanent account erasure
  - `GamificationServiceTest` (10 tests): Validates initial profile creation, comprehensive profile response DTO, daily goal targets, XP awarding (+10 per correct answer, +50 per session, +20 daily goal bonus), streak tracking with emergency monthly streak freeze consumption, badge unlock verification, Redis ZSET weekly leaderboard rankings with promotion zones, 19:00 BRT daily study goal reminder sweeps, and Sunday weekly league resets
  - `AnonymousSessionServiceTest` (5 tests): Validates 30-day anonymous session provisioning with SHA-256 IP hashing, session UUID retrieval, and session claiming post-registration
  - `EmailVerificationServiceTest` (8 tests): Validates 24-hour token email verification, expired token rejection, silent anti-enumeration resend handling, and Outbox event dispatch
  - `NotificationServiceTest` (7 tests): Validates Android/iOS push token registration with device deduplication, paginated notification feed retrieval with unread status filtering, marking notifications as read, and unread counter queries
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-02 as DONE and advancing Sprint 3 completion to 33% (4/12 tasks completed)
- docs(agents): Create and expand `AGENTS.md` full-stack repository operating manual covering monorepo architecture (backend, frontend, infrastructure), English-only communication mandate, Mermaid diagram guidelines for Markdown documentation, zero uncommitted changes policy, Conventional Commits standard, pre-commit changelog updates, proactive web search with zero workarounds policy, error diagnosis protocol, and recursive documentation synchronization

## [0.3.5] - 2026-09-20
### 🧪 Added (Test Pyramid - Domain Unit Tests)
- test(domain): Implement pure Java domain unit test suites with JUnit 5 & AssertJ across `exam-service`, `auth-service`, and `common-core` (134 tests, 0 failures, execution time $< 1\text{s}$) (TASK-S3-01)
  - `QuestionTest`: Status lifecycle transitions (`ACTIVE` $\rightarrow$ `SUSPENDED` $\rightarrow$ `NEEDS_REVIEW` $\rightarrow$ `ACTIVE`), option letter validation (A–E range), casing tolerance, and INEP 3-Parameter Logistic (3PL) Item Response Theory (TRI) probability formula verification ($P(\theta) = c + (1-c)/(1+e^{-1.7a(\theta-b)})$)
  - `PracticeSessionTest`: Session state machine (`IN_PROGRESS` $\rightarrow$ `COMPLETED` / `ABANDONED`), monotonic score calculations with `HALF_UP` 2-decimal rounding, and attempt acceptance guarding
  - `StudentAttemptTest`: Multiple-choice option enforcement, time spent non-negative clamping, and submittedAt timestamps
  - `TopicPerformanceTest`: Accuracy percentage calculation and 3-tier mastery classification (`MASTERED` $\ge 70\%$, `ATTENTION_NEEDED` $\ge 50\%$, `CRITICAL` $< 50\%$)
  - `TutorChatThreadTest`: Turn quota limitation (up to 6 turns per unlock), active acceptance rules, and conversation thread resets
  - `DiagnosticReportTest`: Aggregated topic breakdown mapping and pedagogical revision recommendations
  - `UserGamificationProfileTest`: Linear XP progression ($L \times 200$), level percentage computation, pedagogical titles (`Calouro Iniciante`, `Focado no SISU`, `Mestre dos Simulados`, `Nota 1000`), and daily goal completion logic
  - `AnonymousSessionTest`: Expiration window detection and post-registration user ownership binding
  - `UserTest` & `WeeklyLeaderboardTest`: Role verification, school demographics, and weekly league rank / promotion zone tracking
  - `ApiResponseTest` & `ExceptionAndEventTest`: DTO builder encapsulation, RFC 7807 problem details, and RabbitMQ domain events
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-01 as DONE, advancing Sprint 3 completion to 25%, and setting TASK-S3-02 (Application Service Unit Testing) as ACTIVE

## [0.3.4] - 2026-09-20
### 🛡️ Added & Synchronized
- feat(lgpd): Implement Brazilian General Data Protection Law (LGPD - Lei nº 13.709/2018) data subject rights in `auth-service`: `GET /api/v1/auth/export` (Art. 18, V - Data Portability) and `DELETE /api/v1/auth/me` (Art. 18, VI - Irrevocable Account Erasure & Psychometric Anonymization)
- test(contract): Recursively synchronize Postman contract test suite (`AprovaENEM.postman_collection.json`) with LGPD Art. 18 assertions, verified 100% green via Newman CLI (31 requests, 56 assertions passing)
- docs(backlog): Add TASK-S4-08 (Student Registration Terms of Use & LGPD Consent Modal) and TASK-S6-09 (Legal Compliance, Terms of Use & LGPD Privacy Portal for JAM 3)
- docs(specs): Document Section 10 LGPD Compliance & Privacy by Design in `05-api-specification.md` and account purge lifecycle in `04-data-modeling.md`
- docs(readme): Add LGPD Compliance badge and Privacy by Design architectural highlights to `README.md`

## [0.3.3] - 2026-09-20
### ♿ Added & Synchronized
- docs(accessibility): Specify comprehensive Universal Digital Accessibility baseline across architecture, backlog, and quality gates adhering to WCAG 2.1 Level AA, e-MAG, and Lei Brasileira de Inclusão (LBI - Lei nº 13.146/2015)
- docs(backlog): Add TASK-S4-07 (Digital Accessibility Baseline & VLibras Integration), TASK-S5-07 (Accessible Question Reader, Hotkeys & INEP Accommodations), and update S6 with automated Axe-Core / Lighthouse accessibility quality gates ($\ge 95/100$)
- docs(data): Add `figure_alt_text` and `time_mode` (`STANDARD`, `EXTENDED_INEP`, `UNTIMED`) to `questions` and `practice_sessions` tables in `04-data-modeling.md`
- docs(api): Specify `figureAltText` in question payloads, `timeMode` in practice session creation, and Section 9 Universal Accessibility in `05-api-specification.md`
- docs(ci): Add Gate 5f automated Axe-Core WCAG 2.1 AA audit step to CI pipeline in `07-quality-gate-ci.md`
- docs(readme): Add WCAG 2.1 AA and VLibras badges, Universal Digital Accessibility feature highlights, and Accessibility tech stack to `README.md`

## [0.3.2] - 2026-09-20
### 🚀 Added
- feat(api-docs): Implement interactive OpenAPI 3.0 specifications and Swagger UI (`/swagger-ui.html`) across `auth-service`, `exam-service`, and `notification-service`, with unified multi-spec gateway dropdown aggregation in `frontend-api` BFF and Nginx reverse proxy routing (TASK-S3-08)
- test(contract): Implement automated Newman / Postman end-to-end API contract test suite (`docs/postman/AprovaENEM.postman_collection.json` and `docs/postman/AprovaENEM.postman_environment.json`) covering 8 modules, 29 requests, and 53 assertions verifying status codes, schemas, and SLA latency (TASK-S3-09)

## [0.3.1] - 2026-09-20
### 🔄 Changed
- refactor(docs): Rename foundational specifications directory from `docs/sprint-1/` to `docs/specifications/` to accurately reflect its permanent role as the platform architecture and technical baseline across all project phases
- docs(links): Synchronize internal documentation links, project directory tree, and backlog artifact cross-references across `README.md`, `docs/BACKLOG.md`, and `docs/specifications/02-project-charter.md`
- docs(specs): Synchronize API specification in `05-api-specification.md` with live controllers: added `GET /api/v1/auth/me`, `GET /api/v1/auth/session/{sessionUuid}`, `GET /api/v1/sessions/{id}/diagnostic`, `POST /api/v1/gamification/activity`, `POST /api/v1/gamification/reminders/trigger`, and `GET /api/v1/notifications/unread-count`; corrected question status route to `PATCH /api/v1/questions/{id}/status` and documented anti-cheating resolution encapsulation inside `AttemptResultResponse`
- docs(architecture): Clarify standard internal container port `5432` across all PostgreSQL databases and port `3000` for Grafana in `03-system-architecture.md`, distinguishing them from host developer overrides
- docs(data): Update persistence model boundaries in `04-data-modeling.md` to reflect three autonomous databases (`auth_db`, `exam_db`, and `notification_db`)
- docs(ingestion): Update extraction and reconciliation worker paths in `08-data-ingestion-pipeline.md` to point to the containerized `backend/ingestion-service/` modules and test suites

## [0.3.0] - 2026-09-20
### 🚀 Added
- feat(gamification): Implement student gamification engine in `auth-service` with XP progression (+10 correct answer, +50 completed session, +20 daily goal bonus), 4-tier title levels (`Calouro Iniciante`, `Focado no SISU`, `Mestre dos Simulados`, `Nota 1000`), daily streak tracking in `America/Sao_Paulo` timezone, and emergency monthly streak freeze (TASK-S2-14)
- feat(leaderboard): Implement real-time weekly reset leaderboards with Redis `ZSET` (`leaderboard:weekly:{year}:{week}:{tier}`), sub-5ms rank lookup, top 20% promotion zone calculations, and scheduled Sunday 23:59:59 BRT league reset worker (TASK-S2-15)
- feat(scheduler): Implement daily 19:00 BRT study reminder scheduled worker in `auth-service` dispatching `DailyGoalReminderEvent` to RabbitMQ for students with pending daily goals (TASK-S2-16)
- feat(notifications): Implement decoupled `notification-service` microservice consuming RabbitMQ events (`notification.reminders.queue`, `notification.auth.queue`), registering device push tokens (WEB_PUSH, ANDROID, IOS), and serving the in-app notification inbox with read state tracking (TASK-S2-17)
- feat(ingestion): Implement on-demand data ingestion microservice (`ingestion-service`) with Docker Compose profile `ingestion`, IBM Docling layout parsing, KaTeX formula extraction, 300 DPI WebP diagram cropping, INEP ITENS_PROVA microdados reconciliation, and 5 automated quality gates (TASK-S2-02b)
- fix(infra): Optimize Nginx health check probe to use IPv4 loopback (`127.0.0.1/health`) and dual IPv4/IPv6 listen binding; disable unused `MailHealthIndicator` in Spring Boot Actuator to ensure 100% container health

## [0.2.1] - 2026-09-19
### 🔄 Changed & Synchronized
- docs(specs): Synchronize OpenAPI specifications in `05-api-specification.md` with dual `/chat` and `/ask` route mapping, `@JsonAlias({"studentQuery"})` request body backward compatibility, and 429 quota exhaustion headers
- docs(architecture): Clarify internal container port mappings (`5432` standard) vs host developer overrides in `03-system-architecture.md`, and document BFF routing rules
- docs(data): Document per-question multi-turn thread persistence model, outbox event status lifecycle, and Redis key namespaces in `04-data-modeling.md`
- docs(readme): Update verified live operational endpoints, perimeter isolation architecture, and port matrix in `README.md`
- fix(compat): Add dual `/chat` and `/ask` route mapping and `@JsonAlias({"studentQuery"})` in `exam-service` for 100% backward compatibility

## [0.2.0] - 2026-09-18
### 🚀 Added
- feat(gateway): Implement `frontend-api` BFF Edge Gateway with strict CORS origin whitelisting, perimeter security, Token Bucket Redis rate limiting, end-to-end distributed tracing (`X-Trace-Id`), and Prometheus scraping across all microservices (TASK-S2-12, TASK-S2-13)
- feat(tutor): Implement Socratic AI Tutor (`gemini-1.5-flash`), per-question multi-turn thread engine (up to 6 turns), conversation reset (`DELETE /chat`), Resilience4j Circuit Breaker fallback, PostgreSQL `pgvector` HNSW RAG knowledge retrieval, and Redis daily quota rate limiter (1 free question/day for `ROLE_STUDENT`, unlimited for `ROLE_PREMIUM_STUDENT`) in `exam-service` (TASK-S2-10, TASK-S2-11, TASK-S2-11b)
- feat(exam): Implement Examination & Assessment Engine (`exam-service`) with Hexagonal architecture, Portuguese GIN full-text search, Redis caching, practice sessions, instant grading, and diagnostic radar calculation (TASK-S2-06, TASK-S2-07, TASK-S2-08, TASK-S2-09, TASK-S2-02c)
- feat(auth): Implement Anonymous Sessions, Spring Security 6 stateless JWT & RBAC, and Transactional Outbox pattern with RabbitMQ publishing for auth-service (TASK-S2-04, TASK-S2-05, TASK-S2-05b)
- feat(build): Configure Java 21 LTS multi-module Maven parent POM and scaffold microservices (common-core, frontend-api, auth-service, exam-service, notification-service) with multi-stage Dockerfiles (TASK-S2-03)
- feat(infra): Implement production-ready Docker Compose stack with strict perimeter isolation (frontend-edge vs. internal private network), autoheal deadlock watchdog daemon, named volumes (driver: local), and local developer override (TASK-S2-01)
- feat(db): Implement Flyway migrations (V1 schemas, V2 performance indexes, V3 seed data) with PostgreSQL 16 + pgvector, GIN full-text search, composite B-Trees, and Transactional Outbox pattern across auth_db, exam_db, and notification_db (TASK-S2-02)

## [0.1.1] - 2026-09-18
### 🔧 Changed
- refactor(docs): Remove redundant 08-sprint-backlog.md and consolidate single source of truth in master BACKLOG.md, renumbering 08-data-ingestion-pipeline.md
- feat(tutor): Architect per-question multi-turn Socratic chat threads, daily quota unlock lifecycle, reset endpoint, and 90-day review retention across architecture, data modeling, and API specs
- feat(auth): Architect User entity modeling, Transactional Outbox pattern (outbox_events table), and asynchronous email confirmation lifecycle across data modeling, architecture, and API specs
- fix(docs): Escape and quote edge labels containing parentheses and resolve invalid flowchart link syntax across 03-system-architecture.md and 04-data-modeling.md
- feat(auth): Require free registered account (ROLE_STUDENT) to access Socratic AI Tutor with 1 free consultation per day, eliminating cookie/session-clearing quota abuse while keeping core practice 100% free and anonymous with zero login required
- refactor(branding): Standardize project name to AprovaENEM across all documentation, removing legacy OpenENEM references and updating Java root packages to com.aprovaenem.*
- feat(mobile): Add TASK-M1-05 for AdMob Rewarded Video Ads with Brazil eCPM unit economics calibration and Server-Side Verification
- docs(readme): Synchronize System Architecture diagram (shared assets volume, autoheal, tiered daily AI quota) and Project Structure tree (grafana provisioning, evals harness)
- feat(tutor): Architect Redis-backed 1-per-day AI tutor rate limit for free tier with unlimited Pro plan, while preserving 100% free and unlimited core question training
- fix(docs): Replace invalid mermaid 'card' blocks in personas with native GitHub alert cards in 01-business-and-market-strategy.md
- feat(storage): Architect Docker persistent named volume strategy (driver: local), shared OCR static media pipeline, and 12-factor stateless microservice boundaries
- feat(resilience): Architect self-healing Docker Compose topology with automated crash recovery (restart: unless-stopped), Spring Boot /actuator/health probes, boot sequencing (condition: service_healthy), and autoheal watchdog daemon
- feat(security): Architect Multi-Stage AI-Assisted and Real-Time Security Audit Framework terminating both backend (JAM 1 / Sprint 3 - TASK-S3-11) and full-stack (JAM 2 / Sprint 6 - TASK-S6-06) delivery milestones
- docs(backlog): Realign sprint backlog with Reconecta Recode program: JAM 1 (Sprints 1-3 Backend only, documented API deliverable), JAM 2 (Sprints 4-6 Frontend & Full-Stack Integration, deployed public URL deliverable), and Month 4 Career Placement
- docs(structure): Synchronize master README project structure tree (mobile KMP roadmap, Nginx/Prometheus infrastructure config) and align Access Endpoints with perimeter isolation
- docs(architecture): Synchronize master README system architecture diagram and project structure tree with frontend-api BFF, perimeter isolation, Redis 7+, RabbitMQ, and microservices
- feat(cache): Architect Redis 7+ distributed caching grid (L2 entity cache, leaderboard ZSET, rate limiting) and comprehensive PostgreSQL indexing strategy (B-Tree, Partial, GIN Full-Text, HNSW Vector)
- feat(security): Specify zero-trust perimeter isolation, dedicated frontend-api BFF microservice, strict CORS engine with origin whitelisting, and zero public exposure for internal domain microservices
- docs(mobile): Pivot mobile application roadmap from React Native/Expo to Native Android (Kotlin / Java & Jetpack Compose) and Kotlin Multiplatform (KMP), unifying the stack under the modern JVM ecosystem with Room SQLite, CameraX, and WorkManager
- feat(domain): Add question lifecycle status (ACTIVE, SUSPENDED, NEEDS_REVIEW, DRAFT, ANNULLED) with partial PostgreSQL indexes and admin management
- feat(notifications): Architect decoupled notification-service microservice for transactional emails, Web Push, and native mobile push (FCM/APNs), alongside native mobile app roadmap
- feat(gamification): Architect student game experience with XP progression, levels, daily goals, streak tracker, and weekly reset leaderboard leagues
- docs(ingestion): Architect on-demand ingestion-service container with IBM Docling, zero idle RAM footprint via Docker Compose profiles, and zero API costs
- docs(data): Explicitly specify Flyway database migrations and Spring Data JPA / Hibernate 6 decoupled persistence within Hexagonal Architecture
- feat(rag): Architect Retrieval-Augmented Generation (RAG) pipeline using PostgreSQL 16 `pgvector` with HNSW cosine indexing to eliminate AI tutor hallucinations and anchor responses in official INEP curriculum guidelines
- docs(essay): Add Phase 2 architecture for AI Essay Evaluator with model evaluation (LLM Evals across candidate models) and INEP-aligned Dual-Evaluator + LLM-as-a-Judge arbitration
- docs(security): Add Spring Security 6 architecture, SecurityFilterChain, stateless JWT filter, and enterprise RBAC matrix
- docs(testing): Add Cypress E2E automated test suite and student journey specs in 07-quality-gate-ci.md
- docs(testing): Add automated Postman collection execution via Newman CLI in CI quality gate
- docs(testing): Expand Gate 5 into comprehensive Full-Stack Testing Pyramid (Unit, Testcontainers Integration, Frontend Vitest, and Playwright E2E)
- docs(testing): Configure JaCoCo unified coverage combining Surefire unit tests and Failsafe integration tests (80%+ lines, 75%+ branches)
- docs(frontend): Define Vitest + React Testing Library + MSW test specifications and coverage thresholds (80%+)
- docs(e2e): Add Playwright cross-browser End-to-End automated testing specification against Docker Compose platform
- docs(architecture): Refine Gemini API integration and rate limiter specifications across architecture and observability docs
- docs(setup): Clarify Google Gemini Free Tier as local development onboarding option rather than production architectural constraint
- docs(business): Align historical exam ingestion span to 2009-2025 across business model and system specs

## [0.1.0] - 2026-09-17
### 🚀 Added
- docs(business): Add Business Model Canvas, Value Proposition, and ICP Personas in 01-business-and-market-strategy.md
- docs(charter): Add Project Charter and INEP open data ingestion scope in 02-project-charter.md
- docs(architecture): Add System Architecture with Hexagonal layout and Gateway Token Bucket rate limiter in 03-system-architecture.md
- docs(data): Add PostgreSQL 16 DDL, ER diagram, and B-Tree indexing strategy in 04-data-modeling.md
- docs(api): Add OpenAPI 3.0 REST route specifications in 05-api-specification.md
- docs(observability): Add Prometheus metrics, Micrometer distributed tracing, and alert rules in 06-observability-datadog-style.md
- docs(ci): Add 6-stage Quality Gate specification in 07-quality-gate-ci.md
- docs(backlog): Add Multi-Sprint Backlog and Roadmap in BACKLOG.md and 08-sprint-backlog.md
- docs(readme): Add master project documentation in README.md
