# AGENTS.md

## 1. Project Overview & Tech Stack

AprovaENEM is a high-accessibility, open-source educational platform engineered with Java 21 and Spring Boot 3.3 in a clean Hexagonal (Ports & Adapters) microservices architecture.

- **Language & Runtime**: Java 21 (Eclipse Temurin JDK 21)
- **Framework**: Spring Boot 3.3.3, Spring Security 6, Spring Data JPA / Redis
- **Database & Migration**: PostgreSQL 16 (`pgvector`), Flyway 10
- **Cache & Messaging**: Redis 7 (Sorted Sets / ZSET, Jedis), RabbitMQ 3.13
- **Resilience & AI**: Resilience4j Circuit Breaker, Google Gemini 1.5 Flash (Socratic AI Tutor)
- **Build & CI**: Maven 3.9 (multi-module reactor), Docker Compose, GitHub Actions, Newman CLI
- **Accessibility & Compliance**: WCAG 2.1 Level AA, e-MAG, VLibras, Brazilian LGPD (Lei nº 13.709/2018)

---

## 2. Operational Boundaries

### ALWAYS:
1. **Docker-Enforced Maven Execution**: Always run Maven builds and test suites inside the Temurin 21 Docker container to ensure environment parity:
   ```bash
   docker run --rm -v /home/verivi/Veras/Projects/ReconectaRecode/backend:/app -w /app -v maven-repo:/root/.m2 maven:3.9-eclipse-temurin-21-alpine mvn test
   ```
2. **Changelog Update Before Commit**: Always update [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) under the active version heading before staging and committing code.
3. **Conventional Commits**: Always format git commit messages with type, scope, and task ID: `<type>(<scope>): <summary> (<TASK-ID>)`.
4. **Clickable File Links**: Always link to files and symbols in chat responses using the `file://` scheme with absolute paths (e.g., [`QuestionTest.java`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/exam-service/src/test/java/com/aprovaenem/exam/domain/model/QuestionTest.java)).
5. **Recursive Documentation Synchronization**: Always update related documentation files recursively whenever adding routes, migrations, domain models, or legal policies.
6. **Proactive Web Search**: Always search the web for official documentation when encountering unfamiliar errors, library behaviors, or framework nuances.
7. **English Only in User Communication**: ALWAYS communicate with the user in English. Never reply in Portuguese.
8. **Mermaid Diagrams in Markdown Documentation**: Always include clear, structured Mermaid diagrams (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`) inside `.md` documentation files (`docs/*.md`, architecture specifications, design blueprints) to visually illustrate system components, data flows, entity relationships, and state lifecycles.
9. **Zero Uncommitted Changes on Turn Conclusion**: Always commit and push all code, test, and documentation changes to the remote git repository before concluding work or completing a task. Never leave uncommitted or untracked changes in the repository.

### ASK FIRST:
1. **Milestone & Epic Transitions**: Always solicit explicit user confirmation before advancing to the next Epic, Sprint, or major roadmap milestone (e.g., transitioning from `TASK-S3-02` to `TASK-S3-03`).
2. **Destructive Changes**: Modifying existing Flyway migration files (`V*.sql`), deleting source directories, or dropping database tables.
3. **Architectural Alterations**: Changing authentication flows, modifying port interfaces shared across modules, or adding new external infrastructure dependencies.

### NEVER:
1. **NO Mermaid in Assistant Chat Responses**:
   - **INVIOLABLE**: NEVER output Mermaid diagrams (` ```mermaid `) in conversational assistant chat messages to the user (use tables, lists, and code blocks instead).
   - Mermaid diagrams are strictly reserved for `.md` documentation files, where they are actively encouraged and appreciated.
2. **NO Non-English Chat Responses**:
   - **INVIOLABLE**: NEVER reply to the user in Portuguese or any language other than English. All chat messages, explanations, and questions directed to the user must be strictly in English.
3. **NO Uncommitted Code Left Behind**:
   - Never end work leaving modified, uncommitted, or untracked changes in the repository. Every completed step must be committed and pushed.
4. **NO Dirty Workarounds or Hacky Fixes**:
   - Never silence compiler or linter warnings (`@SuppressWarnings`, `-nowarn`).
   - Never disable tests (`@Disabled`, `@Ignore`) or comment out failed assertions.
   - Never weaken security configurations or open endpoints to bypass 401/403.
   - Never swallow exceptions with empty `catch` blocks or return nulls to mask failures.
   - Never use Mockito `lenient()` or bypass domain validations without architectural justification.
5. **NO Framework Leakage in Domain Core**:
   - Never import Spring (`@Service`, `@Component`), JPA (`@Entity`, `@Table`), or Jakarta annotations inside `*.domain.model`.
6. **NO Guesswork**:
   - Never guess API parameters, library capabilities, or environment variables. Verify directly with code or search the web.

---

## 3. Error Diagnosis & Research Protocol (Zero Workarounds)

When encountering a test failure, compilation error, or unexpected exception:

1. **Root Cause Analysis**:
   - Read the complete stack trace and trace the innermost cause (`Caused by:`).
   - Identify the exact line, class, and lifecycle phase (compilation, runtime, context bootstrap).
2. **Proactive Web Search**:
   - If the error involves third-party libraries, framework deprecations, or subtle behavior:
     - Search the web (`search_web`, `read_url_content`) for the exact exception message and library version.
     - Review official release notes, Baeldung guides, or GitHub issues.
     - Implement the idiomatic, officially recommended fix at the root cause.
3. **Known Gotchas in this Repository**:
   - **Jackson Java 8 Date/Time**: Plain Mockito unit tests instantiating `new ObjectMapper()` require `.registerModule(new JavaTimeModule())` for `Instant` and `LocalDate`.
   - **Mockito Strict Stubbings**: Only stub methods that are actually invoked in the test scenario. For multi-branch enumerations, use `inv -> ...` dynamic answers.
   - **Reactor Multi-Module Dependencies**: Microservices depend on `common-core`. Run tests from the root reactor or include `-Dsurefire.failIfNoSpecifiedTests=false`.
4. **Verification**:
   - Re-run the test suite inside the Docker container to verify 100% green status (`0 Failures, 0 Errors, 0 Skipped`) before proceeding.

---

## 4. Git & Commit Guidelines

### 4.1. Pre-Commit Checklist
1. All unit and integration tests pass green inside Docker.
2. [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) updated following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
3. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md) updated (task marked `DONE ✅`, milestone % adjusted).
4. All modified and created files staged cleanly.

### 4.2. Commit Message Standard
Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <imperative summary> (<TASK-ID>)
```

- **Types**: `feat`, `fix`, `test`, `refactor`, `docs`, `perf`, `chore`, `style`.
- **Scopes**: `domain`, `application`, `infrastructure`, `security`, `accessibility`, `contract`, `backlog`, `agents`.
- **Examples**:
  - `test(application): implement comprehensive Mockito unit test suites for all microservices (TASK-S3-02)`
  - `feat(lgpd): implement Art. 18 data portability and account erasure in auth-service`
  - `docs(agents): update AGENTS.md with industry standard guidelines`

---

## 5. Recursive Documentation Matrix

When making changes to the platform, update all related documentation recursively:

| Component Changed | Documentation Files to Update |
| :--- | :--- |
| **REST Endpoint / Route** | 1. [`docs/05-api-specification.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/05-api-specification.md)<br>2. Controller OpenAPI annotations (`@Operation`)<br>3. [`docs/postman/AprovaENEM.postman_collection.json`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/postman/AprovaENEM.postman_collection.json)<br>4. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md) |
| **Database Schema / Entity** | 1. [`docs/04-data-modeling.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/04-data-modeling.md)<br>2. Flyway migration script (`V*.sql`)<br>3. JPA Entity & Domain Model |
| **Domain Events / AMQP** | 1. Event record in `common-core`<br>2. [`docs/03-system-architecture.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/03-system-architecture.md)<br>3. Publisher & listener unit tests |
| **Legal / Accessibility / Architecture** | 1. [`README.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/README.md)<br>2. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md)<br>3. [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) |
| **Task / Sprint Progress** | 1. [`docs/BACKLOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/docs/BACKLOG.md)<br>2. [`CHANGELOG.md`](file:///home/verivi/Veras/Projects/ReconectaRecode/CHANGELOG.md) |

---

## 6. Commands Quick Reference

```bash
# Run all unit tests across all backend microservices
docker run --rm -v /home/verivi/Veras/Projects/ReconectaRecode/backend:/app -w /app -v maven-repo:/root/.m2 maven:3.9-eclipse-temurin-21-alpine mvn test

# Run a single test class
docker run --rm -v /home/verivi/Veras/Projects/ReconectaRecode/backend:/app -w /app -v maven-repo:/root/.m2 maven:3.9-eclipse-temurin-21-alpine mvn test -Dtest=SocraticTutorServiceTest -Dsurefire.failIfNoSpecifiedTests=false

# Run Newman Postman API contract suite
newman run docs/postman/AprovaENEM.postman_collection.json -e docs/postman/AprovaENEM.postman_environment.json

# Check health of the 13 backend infrastructure containers
docker compose ps
```
