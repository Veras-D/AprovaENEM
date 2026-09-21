# Phase 1 Audit Report: Static Analysis & Workarounds Deep Audit
**Task Reference:** TASK-S3-11 (Phase 1)  
**Author / Auditor:** Independent Static Analysis Subagent (`6d615e38-e1f6-4b2c-97cb-4cd34bb45bdb`)  
**Date:** September 20, 2026  
**Target:** Multi-module Java 21 / Spring Boot 3 Backend Ecosystem (`aprovaenem-parent`, `common-core`, `frontend-api`, `auth-service`, `exam-service`, `notification-service`, `tests/smoke`, `.github/workflows/ci.yml`)

---

## 1. Executive Summary & Integrity Score

### 1.1 Executive Summary
During rapid CI/CD enablement in Task TASK-S3-10, several quality gates, linter rules, and application configurations were modified or introduced to achieve a green build. A comprehensive, independent static analysis and architectural audit was conducted across the multi-module Java 21 / Spring Boot 3 ecosystem.

The audit revealed that while core unit and slice test suites pass and achieve strong coverage, **multiple quality checks and security safeguards were compromised via workarounds**:
1. **Global Checkstyle regex was relaxed** to accommodate Spring Data JPA property traversal and test method conventions, weakening code quality across all production modules.
2. **PMD cyclomatic complexity threshold was inflated from 10 to 15**, masking monolithic methods in persistence adapters and domain services (reaching CC=14).
3. **QuestionDtoMapper was hastily created as a static helper** to bypass PMD CPD duplication checks between controllers, rather than adopting the project-mandated MapStruct architecture.
4. **Pre-flight smoke test shell script uses brittle string slicing (`grep | head | cut`) and non-POSIX constructs (`date +%s%N`, `bc`)** rather than standard JSON parsers (`jq`/`python`).
5. **Newman contract testing introduced `--delay-request 100`** to circumvent Redis token bucket rate limiting in the Gateway, masking burst capacity bottlenecks and inflating CI pipeline duration.
6. **Password pepper HMAC-SHA256 pre-hashing mitigates BCrypt 72-byte truncation but suffers from critical side-effects**: double BCrypt execution on every login (halving authentication throughput), side-channel timing discrepancy on failed logins, lack of key versioning/rotation, and a fail-open configuration default.
7. **SpotBugs is completely absent from `pom.xml` and CI Quality Gates**: Direct invocation revealed **over 50 unaddressed bytecode defects**, including potential `NullPointerException` defects in the Edge Gateway (`TraceHeaderFilter`) and Gamification services.

### 1.2 Integrity Score: **C- (Deficient with Critical Technical Debt)**
* **Functional Correctness & Unit Test Coverage:** **A** (All 100+ tests pass, JaCoCo line/branch thresholds met).
* **Static Analysis Rigor:** **D** (Rules relaxed or disabled to achieve green gates; SpotBugs omitted).
* **Cryptographic & Architectural Discipline:** **C** (Sound primitives undermined by implementation inefficiencies and architectural shortcuts).

---

## 2. Live Status of Static Analysis Tools

Direct execution of the static analysis toolchain against the multi-module reactor yielded the following live status:

| Tool | Status | Configured in pom.xml | Reported Violations | Underlying Integrity |
| :--- | :--- | :--- | :--- | :--- |
| **Checkstyle 3.3.1** | `PASS` | Yes (`configLocation`) | 0 violations | **COMPROMISED** (`MethodName` weakened globally) |
| **PMD 3.22.0** | `PASS` | Yes (`ruleset.xml`) | 0 violations | **COMPROMISED** (CC threshold relaxed to 15) |
| **PMD (Standard CC $\le 10$)** | `FAIL` | Temporarily tested $\le 10$ | 6 violations | **UNHEALTHY** (6 methods with CC $\ge 10$) |
| **SpotBugs 4.8.6** | `MISSING` | No (Absent from pom) | >50 bugs detected | **CRITICAL DEFECT GAP** (50+ bugs unmonitored) |
| **PMD CPD** | `PASS` | Yes (`minimumTokens=100`) | 0 duplications | **FRAGILE** (Bypassed via static helper) |
| **Surefire / JaCoCo** | `PASS` | Yes (Line $\ge 80\%$, Br $\ge 75\%$) | 0 failures | **HEALTHY** |

### SpotBugs Detailed Breakdown:
When executed directly via `mvn com.github.spotbugs:spotbugs-maven-plugin:4.8.6.4:check`, SpotBugs failed the build with:
- **`common-core`:** 4 bugs (`EI_EXPOSE_REP`, `EI_EXPOSE_REP2` in `ErrorResponse`).
- **`frontend-api`:** 2 high-severity bugs (`NP_NULL_ON_SOME_PATH_FROM_RETURN_VALUE` in `TraceHeaderFilter.java:31-32`).
- **`auth-service`:** 31 bugs (including `NP_NULL_ON_SOME_PATH_FROM_RETURN_VALUE` in `GamificationService.java:229-230`).
- **`exam-service`:** 10+ bugs (mutable object exposure in entities and persistence adapters).
- **`notification-service`:** 5 bugs (`EI_EXPOSE_REP`/`EI_EXPOSE_REP2` in DTOs and event listeners).

---

## 3. Detailed Investigation of the 6 Workarounds

### Workaround 1: Checkstyle MethodName Regex Workaround
* **File:** [`backend/config/checkstyle/checkstyle.xml`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/config/checkstyle/checkstyle.xml#L37-L39)
* **Observed Change:**
  ```xml
  <module name="MethodName">
      <property name="format" value="^[a-z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$"/>
  </module>
  ```
* **Root Cause:**
  Introduced in commit `c329731`. Spring Data JPA derived query methods in `exam-service` use underscores for explicit property traversal (e.g., `findByUserIdAndQuestion_IdAndStatus`, `findByThread_IdOrderByCreatedAtAsc`, `existsBySession_IdAndQuestion_Id`, `findBySession_IdOrderBySubmittedAtAsc`). Under standard Google Java Style, underscores in method names trigger checkstyle errors.
* **Industry Standards & Web Search Findings:**
  - **Google Java Style Guide (§5.2.3):** Method names are strictly `lowerCamelCase`. The **only** permissible exception in Google Java Style is for JUnit test methods (e.g., `transferMoney_deductsFromSource`). Production methods must never contain underscores.
  - **Spring Data JPA Reference Documentation:** The underscore (`_`) is a reserved delimiter for nested property traversal (`entity_property`). However, the documentation explicitly states: *"It is strongly advised to follow standard Java camel-case naming conventions... and avoid underscores in property names unless required to disambiguate."* When disambiguation is required or names become unwieldy, Spring Data recommends explicit `@Query` annotations.
  - **Checkstyle Best Practice:** Weakening the global `MethodName` regex in `checkstyle.xml` allows snake_case/underscore naming across **all production Java classes** in the entire system (controllers, services, domain models). Standard practice is to keep the global `MethodName` rule strict and supply a `SuppressionFilter` (`checkstyle-suppressions.xml`) targeting repository interfaces:
    ```xml
    <suppress checks="MethodName" files=".*Repository\.java$"/>
    <suppress checks="MethodName" files=".*Test\.java$"/>
    ```
* **Risk Level:** **Medium** (Degrades codebase style consistency; allows non-standard naming in domain and core logic).
* **Remediation:**
  1. Revert `MethodName` regex in `checkstyle.xml` to standard Google Java Style: `^[a-z][a-z0-9][a-zA-Z0-9]*$`.
  2. Implement `checkstyle-suppressions.xml` with a `SuppressionFilter` scoped strictly to `.*Repository\.java$` and `.*Test\.java$`, OR replace ambiguous repository method names with explicit `@Query` JPQL/HQL statements.

---

### Workaround 2: PMD Cyclomatic & NPath Complexity Threshold Workaround
* **File:** [`backend/config/pmd/pmd-ruleset.xml`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/config/pmd/pmd-ruleset.xml#L29-L35)
* **Observed Change:**
  ```xml
  <rule ref="category/java/design.xml/CyclomaticComplexity">
      <properties>
          <property name="methodReportLevel" value="15"/>
          <property name="classReportLevel" value="80"/>
      </properties>
  </rule>
  ```
  *(Note: `NPathComplexity` is completely missing from `pmd-ruleset.xml`).*
* **Root Cause:**
  When standard PMD rules were run, multiple complex methods failed. To avoid refactoring, `methodReportLevel` was inflated from the default of 10 to 15.
* **Industry Standards & Web Search Findings:**
  - **PMD Default:** The default `methodReportLevel` in PMD for `CyclomaticComplexity` is **10**.
  - **NIST Special Publication 500-235:** Defines McCabe Cyclomatic Complexity:
    - 1–10: Simple procedure, low risk.
    - 11–20: More complex, moderate risk.
    - 21+: High risk, untestable, refactoring required.
  - **SonarQube & Clean Code Standard:** Standard threshold is **10** for cyclomatic complexity. Methods with CC > 10 should be decomposed.
* **Empirical Codebase Analysis:**
  When PMD was executed against the codebase with the industry-standard threshold of **10**, **6 methods failed**:
  1. [`GamificationService.awardXpForActivity`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/auth-service/src/main/java/com/aprovaenem/auth/application/service/GamificationService.java#L108): **CC = 11** (nested streak, tier, and bonus conditionals).
  2. [`GamificationService.getWeeklyLeaderboard`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/auth-service/src/main/java/com/aprovaenem/auth/application/service/GamificationService.java#L192): **CC = 11** (paging, rank extraction, null fallbacks).
  3. [`PracticeSessionController.startSession`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/PracticeSessionController.java#L43): **CC = 12** (session header parsing, anonymous token extraction, parameter verification in controller).
  4. [`QuestionRepositoryAdapter.toDomain`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/out/persistence/adapter/QuestionRepositoryAdapter.java#L88): **CC = 10** (borderline; manual mapping ternary chains).
  5. [`QuestionRepositoryAdapter.toEntity`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/out/persistence/adapter/QuestionRepositoryAdapter.java#L150): **CC = 14** (extensive ternary null checking and relationship resolution).
  6. [`RagKnowledgeAdapter.findRelevantChunks`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/out/rag/RagKnowledgeAdapter.java#L22): **CC = 11** (SQL parameter preparation, fallback searches).
* **Risk Level:** **High** (Complexity creates defect density, impairs testability, and caused the SpotBugs NPE finding at `GamificationService:230`).
* **Recommendation:**
  1. Lower `methodReportLevel` back to standard **10** and add `NPathComplexity` (threshold 200).
  2. Refactor `PracticeSessionController.startSession` by delegating session resolution to a resolver filter or application command handler.
  3. Refactor `QuestionRepositoryAdapter` manual mappings into a dedicated MapStruct or separated mapper bean.
  4. Refactor `GamificationService` XP and leaderboard algorithms into specialized domain policies (`XpCalculator`, `LeaderboardRanker`).

---

### Workaround 3: DTO Mapper Architecture Purity & QuestionDtoMapper
* **File:** [`backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/QuestionDtoMapper.java`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/QuestionDtoMapper.java)
* **Observed State:**
  Created in commit `c329731` as a static utility class with a private constructor in `infrastructure/adapter/in/web/`.
* **Root Cause:**
  Duplicate mapping logic in `PracticeSessionController` and `QuestionCatalogController` triggered PMD CPD (Copy-Paste Detector, 100 tokens). To quickly clear the duplicate code warning, the developer extracted a static class.
* **Architectural & Hexagonal Assessment:**
  - **Positive Boundary Adherence:** The mapper translates `Question` (domain model) to `QuestionSummaryDto` (web DTO). JPA entities (`QuestionEntity`) do not leak into the web controller.
  - **Architectural Defects:**
    1. **Packaging Defect:** It is placed in `infrastructure.adapter.in.web` rather than a dedicated `mapper` subpackage (`infrastructure.adapter.in.web.mapper`).
    2. **Static Inversion Violation:** It is a static utility (`public final class QuestionDtoMapper` with static methods) rather than an injectable Spring bean (`@Component`), preventing dependency injection, mocking, or adapter decoupling.
    3. **Absence of Defensive Programming:** Lacks null-safety. If `q.getOptions()` or `q` is null, it throws an unhandled `NullPointerException`.
    4. **Architectural Inconsistency:** Root `pom.xml` imports `org.mapstruct:mapstruct:1.5.5.Final` and `lombok-mapstruct-binding`, yet **zero classes** use MapStruct. Handcrafted manual mappers exist across the codebase, resulting in high cyclomatic complexity (e.g. `QuestionRepositoryAdapter.toEntity` CC=14).
* **Risk Level:** **Medium** (Maintenance overhead, potential NPE runtime crashes, failure to leverage MapStruct).
* **Recommendation:**
  1. Move to `infrastructure/adapter/in/web/mapper/`.
  2. Convert to an interface using MapStruct:
     ```java
     @Mapper(componentModel = "spring")
     public interface QuestionWebMapper {
         QuestionSummaryDto toSummaryDto(Question domain);
     }
     ```
  3. Inject `QuestionWebMapper` into `QuestionCatalogController` and `PracticeSessionController`.

---

### Workaround 4: POSIX Shell Script JSON Parsing Workaround in `tests/smoke/preflight-smoke.sh`
* **File:** [`tests/smoke/preflight-smoke.sh`](file:///home/verivi/Veras/Projects/ReconectaRecode/tests/smoke/preflight-smoke.sh#L94-L114)
* **Observed Workaround:**
  ```bash
  SESSION_ID=$(echo "${SESSION_RESPONSE}" | (grep -o '"sessionId":"[^"]*"' || true) | head -n 1 | cut -d'"' -f4 || true)
  PRACTICE_ID=$(echo "${PRACTICE_RESPONSE}" | (grep -o '"id":"[^"]*"' || true) | head -n 1 | cut -d'"' -f4 || true)
  ELAPSED_SEC=$(echo "scale=2; ${ELAPSED_MS} / 1000" | bc -l)
  ```
* **Portability & Robustness Flaws:**
  1. **Brittle String Regex:** `grep -o '"sessionId":"[^"]*"'` relies strictly on unformatted, unpadded JSON. If the backend outputs pretty-printed JSON, adds whitespace (`"sessionId" : "..."`), or escapes characters, the extraction yields an empty string and fails the smoke test.
  2. **Non-POSIX `grep -P` Risk:** If modified to use Perl-compatible regex (`grep -oP`), it fails on macOS (default BSD `grep` lacks `-P`) and Alpine Linux (BusyBox `grep` lacks `-P`).
  3. **Non-POSIX `date +%s%N`:** GNU nanosecond extension `%N` is not supported on macOS/BSD `date` (where it outputs literal `N`), resulting in bash arithmetic syntax errors: `(( (1726857285N - 1726857280N) / 1000000 ))`.
  4. **Unnecessary `bc` Dependency:** `bc` is not installed by default in minimal Linux images (e.g. Alpine, Debian Slim), creating avoidable test runner failures.
* **Industry Standards & Web Search Findings:**
  - Standard CI best practice is to parse JSON using **`jq`** (pre-installed on GitHub Actions Ubuntu runners) or built-in **`python3 -c`** (available on nearly 100% of POSIX environments).
* **Risk Level:** **Medium** (Smoke test fragility across developer workstations, macOS, and container environments).
* **Recommendation:**
  Refactor JSON parsing and timing in `preflight-smoke.sh`:
  ```bash
  # Robust JSON extraction via jq (with python3 fallback)
  extract_json_field() {
      local json="$1"
      local field="$2"
      if command -v jq >/dev/null 2>&1; then
          echo "$json" | jq -r "$field // empty"
      elif command -v python3 >/dev/null 2>&1; then
          echo "$json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('$field', ''))"
      fi
  }
  ```

---

### Workaround 5: Newman `--delay-request 100` Rate Limiter Workaround
* **File:** [`.github/workflows/ci.yml`](file:///home/verivi/Veras/Projects/ReconectaRecode/.github/workflows/ci.yml#L155)
* **Observed Change:**
  ```yaml
  newman run docs/postman/AprovaENEM.postman_collection.json \
    --env-var "baseUrl=http://localhost/api/v1" \
    --delay-request 100 \
    --reporters cli,junit \
    --reporter-junit-export reports/newman/newman-report.xml
  ```
* **Root Cause & Gateway Rate Limiting Configuration:**
  In `frontend-api/src/main/resources/application.yml`:
  - `exam-tutor-chat-route`: `replenishRate: 10`, `burstCapacity: 10`.
  - General routes: `replenishRate: 60`, `burstCapacity: 60`.
  In `RateLimiterConfig.java`, unauthenticated requests without session tokens default to key `ip:127.0.0.1`. Newman executes 31 requests in rapid succession from `localhost`. Firing all requests at native client speed exhausted the token bucket, triggering `HTTP 429 Too Many Requests`. The developer inserted `--delay-request 100` to space out requests.
* **Flaws of this Workaround:**
  1. **Pipeline Inflation:** Adds 3.1+ seconds to every CI run, compounding linearly as collection requests grow.
  2. **False Sense of Security / Ineffective Protection:** For the tutor route with `replenishRate: 10` (1 token every 6 seconds), a 100ms delay still allows 10 requests in 1 second. If the test collection adds more than 10 consecutive requests to that route, tests will still crash with 429.
  3. **No Rate Limiting Contract Validation:** The quality gate suppresses rate limiting rather than testing it. Rate limiting should be explicitly tested via negative contract assertions (verifying 429 status and `X-RateLimit-*` headers).
* **Industry Standards & Web Search Findings:**
  - Industry practice dictates separating integration test environments from production rate throttling. Standard approaches include:
    - **Test Profile / Elevated Quota:** Set elevated rate limits for testing environments (`application-test.yml` / `CI_PROFILE=true`).
    - **Service Principal Bypass:** Allow internal automated test runners carrying a trusted header (e.g. `X-Internal-Test-Runner: true` authenticated via an internal secret or HMAC signature) to bypass client IP throttling.
* **Risk Level:** **Medium** (Flaky CI test runs as test suites expand; masking gateway throughput bottlenecks).
* **Recommendation:**
  1. Introduce an internal header or test profile configuration in `RateLimiterConfig.java` that assigns a high quota tier to automated CI test runners.
  2. Remove `--delay-request 100` from `.github/workflows/ci.yml`.
  3. Add dedicated negative contract tests in Postman/Newman specifically verifying that exceeding limits triggers HTTP 429 and returns proper RFC rate-limit headers.

---

### Workaround 6: Password Pepper Implementation & Backward Compatibility
* **File:** [`backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/out/security/BCryptPasswordEncoderAdapter.java`](file:///home/verivi/Veras/Projects/ReconectaRecode/backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/out/security/BCryptPasswordEncoderAdapter.java)
* **Observed Implementation:**
  - Uses `HMAC-SHA256(pepper, rawPassword) -> Base64 -> BCrypt`.
  - Fallback check in `matches(...)` allows existing unpeppered passwords.
  - Dynamic migration in `AuthService.java:117-121` upgrades legacy hashes upon successful login.
* **Cryptographic Strengths:**
  1. **Mitigates BCrypt 72-Byte Truncation:** Passwords of arbitrary length are securely mapped to a fixed 32-byte HMAC digest, represented as a 44-character Base64 string, perfectly within BCrypt's 72-byte ceiling.
  2. **Uses HMAC instead of simple hash:** Mitigates length extension attacks compared to naive concatenation `SHA256(pepper + password)`.
  3. **Lazy In-Flight Migration:** Upgrades existing users to peppered hashes transparently upon login.
* **Critical Vulnerabilities & Architectural Flaws:**
  1. **Severe Double BCrypt Overhead on Every Normal Login:**
     In `AuthService.java`:
     ```java
     if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
         throw new BusinessException("Invalid email or credentials.");
     }
     ...
     if (passwordEncoder.isLegacyHash(rawPassword, user.getPasswordHash())) {
         user.setPasswordHash(passwordEncoder.encode(rawPassword));
         userRepository.save(user);
     }
     ```
     And in `BCryptPasswordEncoderAdapter.java`:
     ```java
     public boolean isLegacyHash(String rawPassword, String encodedPassword) {
         String peppered = applyPepper(rawPassword);
         if (passwordEncoder.matches(peppered, encodedPassword)) {
             return false;
         }
         return passwordEncoder.matches(rawPassword, encodedPassword);
     }
     ```
     **Impact:** On *every single successful login for already-upgraded users*, `passwordEncoder.matches(peppered, ...)` is computed **TWICE**. BCrypt (cost factor 10) takes ~80–100ms of intensive CPU computation. Computing it twice doubles login latency and cuts authentication throughput of `auth-service` in half.
  2. **Timing Discrepancy on Failed Logins (Side-Channel Leak):**
     In `matches()`:
     ```java
     if (!pepper.isEmpty()) {
         String peppered = applyPepper(rawPassword);
         if (passwordEncoder.matches(peppered, encodedPassword)) {
             return true;
         }
     }
     return passwordEncoder.matches(rawPassword, encodedPassword);
     ```
     If an attacker attempts a password on a peppered account, the primary check fails (1 BCrypt, ~90ms), and the fallback check also runs and fails (2nd BCrypt, ~90ms), totaling ~180ms. For a non-existent user or an account that was never checked against pepper, execution time is noticeably different.
  3. **Absence of Pepper Versioning & Key Rotation Scheme:**
     The password hash in the database does not contain a version indicator (e.g., `$p=1$` or a `pepper_version` column). If the application pepper is compromised and rotated, the system has no mechanism to determine which pepper key was used for which record, resulting in total authentication failure for all users.
  4. **Fail-Open Default:**
     If `auth.password-pepper` is omitted or empty, `BCryptPasswordEncoderAdapter` logs a warning and quietly reverts to unpeppered BCrypt. In production, missing secrets should fail fast at startup (`IllegalStateException`), not silently degrade security.
* **Risk Level:** **High** (Authentication performance bottleneck, lack of key rotation, fail-open vulnerability).
* **Recommendation:**
  1. **Eliminate Duplicate BCrypt Check:** Refactor `PasswordEncoderPort` to return a status enum or result object from a single verification call:
     ```java
     public record PasswordVerificationResult(boolean matched, boolean needsUpgrade) {}
     ```
  2. **Add Pepper Version Identifier:** Prefix hashes or store a `pepper_version` column (e.g. `p1$<bcrypt-hash>`), enabling deterministic matching without fallback timing leaks and facilitating key rotation.
  3. **Enforce Fail-Fast Configuration:** In production profiles (`prod`, `staging`), require `auth.password-pepper` to be non-blank; throw an exception on startup if missing.

---

## 4. Prioritized Action Items
- **[P0]** Eliminate double BCrypt overhead in `AuthService` and add fail-fast pepper configuration.
- **[P1]** Add SpotBugs plugin to `pom.xml`, resolve Gateway NPE (`TraceHeaderFilter`), lower PMD CC to 10, and revert Checkstyle `MethodName` with `checkstyle-suppressions.xml`.
- **[P2]** Adopt MapStruct for `QuestionDtoMapper`, modernize `preflight-smoke.sh` with `jq`/`python3`, and decouple CI contract tests from gateway rate limiting.
