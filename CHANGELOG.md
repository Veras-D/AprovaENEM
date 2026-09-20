# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
