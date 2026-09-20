# AGENTS.md — Full-Stack Repository Operating Manual

## 1. Project Overview & Monorepo Architecture

AprovaENEM is an enterprise, full-stack, high-accessibility open-source educational platform designed to democratize access to Brazil's ENEM and SISU exams. The repository is organized as a unified monorepo encompassing **backend microservices**, **frontend Single Page Application (SPA)**, **infrastructure orchestration**, and **specification suites**:

```text
ReconectaRecode/
├── backend/            # Java 21 & Spring Boot 3.3 Hexagonal Microservices
│   ├── common-core/          # Shared domain records, events, RFC 7807 problem details
│   ├── auth-service/         # RBAC, JWT, LGPD Art. 18 data rights, Gamification, Streaks
│   ├── exam-service/         # Questions, TRI formulas, Socratic AI Tutor (Gemini 1.5 Flash)
│   ├── notification-service/ # Multi-channel event consumer (RabbitMQ), Push & Emails
│   └── frontend-api/         # Spring Cloud Gateway BFF, Token Bucket rate limiting, CORS
├── frontend/           # React 18, TypeScript, Vite 5, Tailwind CSS SPA (JAM 2 / Sprint 4–6)
├── infrastructure/     # Nginx reverse proxy, Prometheus APM, Grafana dashboards
├── docs/               # Architecture specs, OpenAPI 3.0, Newman Postman collections, BACKLOG.md
├── CHANGELOG.md        # Monorepo version history (Keep a Changelog standard)
└── docker-compose.yml  # Complete 13-container perimeter orchestration
```

### Tech Stack Standards:
- **Backend**: Java 21 LTS (Eclipse Temurin), Spring Boot 3.3.3, Spring Security 6.3, Spring Data JPA / Redis, PostgreSQL 16 (`pgvector`), Redis 7 (`ZSET`), RabbitMQ 3.13, Flyway 10, Maven 3.9.
- **Frontend**: React 18, TypeScript (strict mode, zero `any`), Vite 5, Tailwind CSS (dark mode tokens), Zustand state store, TanStack Query, Lucide React, Recharts radar, KaTeX math formula rendering.
- **Infrastructure & Ingress**: Nginx L7 Reverse Proxy (only ports `80`/`443` public), Prometheus (9090), Grafana (3000), Docker Compose.
- **Digital Accessibility**: WCAG 2.1 Level AA, e-MAG, VLibras (3D sign language avatar), OpenDyslexic / Atkinson Hyperlegible fonts, `@axe-core/react`, `cypress-axe`, Lighthouse $\ge 95/100$.
- **Privacy & Compliance**: Brazilian LGPD (Lei nº 13.709/2018) Art. 18 data portability (`GET /export`) and permanent erasure (`DELETE /me`).

---

## 2. Operational Commands Quick Reference

### 2.1. Backend Commands (Always Run in Docker)
Always execute Maven tasks inside the Temurin 21 Docker container for build environment parity:
```bash
# Run entire backend test suite
docker run --rm -v /home/verivi/Veras/Projects/ReconectaRecode/backend:/app -w /app -v maven-repo:/root/.m2 maven:3.9-eclipse-temurin-21-alpine mvn test

# Run a specific test suite or class
docker run --rm -v /home/verivi/Veras/Projects/ReconectaRecode/backend:/app -w /app -v maven-repo:/root/.m2 maven:3.9-eclipse-temurin-21-alpine mvn test -Dtest=SocraticTutorServiceTest -Dsurefire.failIfNoSpecifiedTests=false

# Package backend microservices
docker run --rm -v /home/verivi/Veras/Projects/ReconectaRecode/backend:/app -w /app -v maven-repo:/root/.m2 maven:3.9-eclipse-temurin-21-alpine mvn clean package -DskipTests
```

### 2.2. Frontend Commands (`frontend/`)
```bash
# Install dependencies
npm --prefix frontend install

# Start Vite local development server
npm --prefix frontend run dev

# Run Vitest unit & component tests
npm --prefix frontend run test

# Run Vitest test coverage (target: >= 80%)
npm --prefix frontend run test:coverage

# Run Cypress interactive E2E tests
npm --prefix frontend run test:e2e:cypress

# Run Playwright cross-browser tests
npx --prefix frontend playwright test

# Run Axe-Core accessibility compliance audit
npm --prefix frontend run test:a11y
```

### 2.3. Contract & Infrastructure Commands
```bash
# Run Newman API contract test suite
newman run docs/postman/AprovaENEM.postman_collection.json -e docs/postman/AprovaENEM.postman_environment.json

# Check health of all 13 Docker containers
docker compose ps
```

---

## 3. Operational Boundaries

### ALWAYS:
1. **Docker-Enforced Maven Execution**: Always run backend Maven builds and tests inside the Temurin 21 container.
2. **Strict Verification Before Concluding**: Always verify 100% green tests (`0 Failures, 0 Errors, 0 Skipped`) before completing any work item.
3. **Changelog Update Before Commit**: Always update [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) under the active version heading before staging and committing.
4. **Conventional Commits**: Always format git commit messages with type, scope, and task ID: `<type>(<scope>): <summary> (<TASK-ID>)`.
5. **Clickable File Links**: Always link to files and symbols in chat using the `file://` scheme with absolute paths.
6. **English Only in User Communication**: ALWAYS communicate with the user in English. Never reply in Portuguese.
7. **Mermaid Diagrams in Markdown Documentation**: Always include structured Mermaid diagrams (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`) inside `.md` documentation files (`docs/*.md`, architecture specs, design blueprints) to visually depict systems, state machines, and lifecycles.
8. **Zero Uncommitted Changes on Turn Conclusion**: Always stage, commit, and push all modified, created, or deleted files to git before concluding work. Never leave uncommitted changes in the repository.
9. **Proactive Web Search**: Always search the web for official documentation when encountering unfamiliar errors, library behaviors, or framework nuances.
10. **Recursive Documentation Synchronization**: Always update related documentation files recursively whenever adding routes, database columns, components, or legal policies.

### ASK FIRST:
1. **Milestone & Epic Transitions**: Always solicit explicit user confirmation before advancing to the next Epic, Sprint, or major roadmap milestone (e.g., transitioning from `TASK-S3-02` to `TASK-S3-03`, or starting Frontend Sprint 4).
2. **Destructive Changes**: Modifying existing Flyway migration files (`V*.sql`), deleting source directories, or dropping database tables.
3. **Architectural Alterations**: Modifying inter-service communication patterns, changing security filter chains, or adding new external infrastructure dependencies.

### NEVER:
1. **NO Mermaid in Assistant Chat Responses**:
   - **INVIOLABLE**: NEVER output Mermaid diagrams (` ```mermaid `) in conversational assistant chat messages to the user (use tables, lists, and code blocks instead).
   - Mermaid diagrams are strictly reserved for `.md` documentation files, where they are actively encouraged and appreciated.
2. **NO Non-English Chat Responses**:
   - **INVIOLABLE**: NEVER reply to the user in Portuguese or any language other than English. All chat messages, explanations, and questions directed to the user must be strictly in English.
3. **NO Uncommitted Code Left Behind**:
   - Never end work leaving modified, uncommitted, or untracked changes in the repository. Every completed step must be committed and pushed.
4. **NO Dirty Workarounds or Hacky Fixes**:
   - Never silence compiler or linter warnings (`@SuppressWarnings`, `eslint-disable`, `-nowarn`).
   - Never use `any` in TypeScript; use strict types and discriminated unions.
   - Never disable tests (`@Disabled`, `@Ignore`, `.skip()`) or comment out failed assertions.
   - Never weaken security configurations or open endpoints to bypass 401/403.
   - Never swallow exceptions with empty `catch` blocks or return nulls to mask failures.
   - Never use Mockito `lenient()` or bypass domain validations without architectural justification.
5. **NO Framework Leakage in Backend Domain Core**:
   - Never import Spring (`@Service`, `@Component`), JPA (`@Entity`, `@Table`), or Jakarta annotations inside `*.domain.model`.
6. **NO Guesswork**:
   - Never guess API parameters, library capabilities, or environment variables. Verify directly with code or search the web.

---

## 4. Error Diagnosis & Research Protocol (Zero Workarounds Policy)

When encountering a build failure, test failure, Docker crash, or runtime exception:

1. **Root Cause Analysis**:
   - Read the complete stack trace and trace the innermost cause (`Caused by:`).
   - Identify the exact file, line, and lifecycle phase.
2. **Proactive Web Search**:
   - If the error involves third-party libraries, framework deprecations, or subtle behavior:
     - Search the web (`search_web`, `read_url_content`) for the exact exception message and library version.
     - Review official release notes, Baeldung guides, or GitHub issues.
     - Implement the idiomatic, officially recommended fix at the root cause.
3. **Known Gotchas in this Monorepo**:
   - **Backend Mockito Jackson**: Plain Mockito unit tests instantiating `new ObjectMapper()` require `.registerModule(new JavaTimeModule())` for `Instant` and `LocalDate`.
   - **Backend Mockito Strict Stubbings**: Only stub methods that are actually invoked. For multi-branch enums, use `inv -> ...` dynamic answers.
   - **Backend Reactor Multi-Module Dependencies**: Microservices depend on `common-core`. Run tests from the root reactor or include `-Dsurefire.failIfNoSpecifiedTests=false`.
   - **Frontend Accessibility Tree**: Always ensure DOM elements have proper ARIA attributes, semantic tags, and valid labels for screen readers.
4. **Verification**:
   - Re-run test suites to verify 100% green status before completing the task.

---

## 5. Git & Commit Guidelines

### 5.1. Pre-Commit Checklist
1. All relevant tests pass green (backend via Docker, frontend via npm/Vitest).
2. [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) updated following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
3. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md) updated (task marked `DONE ✅`, milestone % adjusted).
4. All modified and created files staged cleanly.

### 5.2. Commit Message Standard
Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <imperative summary> (<TASK-ID>)
```

- **Types**: `feat`, `fix`, `test`, `refactor`, `docs`, `perf`, `chore`, `style`.
- **Scopes**:
  - Full-stack: `domain`, `application`, `infrastructure`, `security`, `accessibility`, `contract`, `backlog`, `agents`.
  - Frontend: `frontend`, `ui`, `components`, `store`, `a11y`.
  - Backend: `auth`, `exam`, `notification`, `gateway`, `db`.
- **Examples**:
  - `test(application): implement comprehensive Mockito unit test suites for all microservices (TASK-S3-02)`
  - `feat(frontend): implement accessible question card with KaTeX and VLibras (TASK-S5-01)`
  - `docs(agents): expand AGENTS.md to cover full-stack monorepo guidelines`

---

## 6. Recursive Documentation Matrix

When making changes across the monorepo, update all related documentation recursively:

| Component Changed | Documentation Files to Update |
| :--- | :--- |
| **REST Endpoint / Route** | 1. [`docs/05-api-specification.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/05-api-specification.md)<br>2. Controller OpenAPI annotations (`@Operation`)<br>3. [`docs/postman/AprovaENEM.postman_collection.json`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/postman/AprovaENEM.postman_collection.json)<br>4. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md) |
| **Database Schema / Entity** | 1. [`docs/04-data-modeling.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/04-data-modeling.md)<br>2. Flyway migration script (`V*.sql`)<br>3. JPA Entity & Domain Model |
| **Domain Events / AMQP** | 1. Event record in `common-core`<br>2. [`docs/03-system-architecture.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/03-system-architecture.md)<br>3. Publisher & listener unit tests |
| **Frontend UI / Components** | 1. [`docs/06-frontend-architecture.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/06-frontend-architecture.md)<br>2. Component unit test in Vitest<br>3. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md) |
| **Accessibility / Legal / LGPD** | 1. [`README.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/README.md)<br>2. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md)<br>3. [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) |
| **Task / Sprint Progress** | 1. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md)<br>2. [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) |
