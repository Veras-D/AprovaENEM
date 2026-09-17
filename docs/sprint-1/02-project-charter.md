# Project Charter & Scope Statement — AprovaENEM

> **Document Status**: Approved (Sprint 1 Baseline)  
> **Product Name**: AprovaENEM / OpenENEM API  
> **Target Audience**: Brazilian Public School Students, Community Cursinhos, Open Source Education Ecosystem  

---

## 1. Project Overview & Vision

**AprovaENEM** is an open-source, production-grade distributed backend providing an intelligent question bank, assessment engine, and diagnostic study assistant based on past exams of the Brazilian National High School Exam (ENEM).

### Problem Statement
The National High School Exam (ENEM) is the primary gateway to higher education in Brazil, governing access to federal universities (via SISU), private college scholarships (PROUNI), and student loans (FIES). 
- Over **3.5 to 4 million candidates** register annually.
- Public high school students represent **84.3% of secondary enrollment** (INEP Censo Escolar), but are severely underrepresented in high-competition degree programs (Medicine, Law, Computer Science, Engineering).
- Commercial platforms monetize question banks with subscriptions ranging from R$ 30 to R$ 200+/month (and over R$ 1,000/month for physical prep academies) that exclude low-income students.
- Raw INEP exam data is published as disorganized PDFs and spreadsheets that cannot be consumed on mobile devices or easily filtered by pedagogical skill tags.

### Product Vision
To provide a clean, high-performance, open-access API that transforms public INEP exam data into structured, interactive, mobile-optimized diagnostic practice sessions with step-by-step problem resolutions and zero paywalls.

---

## 2. Ingestion Strategy for INEP Open Data

The platform sources 100% of its core examination data from public government releases published by INEP (*Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira*):

```mermaid
flowchart LR
    INEP["INEP Open Datasets<br/>(PDFs, Microdados, Answer Keys)"] --> IngestionScript["Ingestion & Normalizer Worker"]
    IngestionScript --> Sanitizer["LaTeX / Markdown Cleaner & MathJax Parser"]
    Sanitizer --> DB[(PostgreSQL 16 + B-Tree Indexes)]
    DB --> AssessmentService["Assessment & Question Service"]
```

### Data Pipeline Specifications
1. **Raw Sources**:
   - Official Blue/Yellow/White/Pink exam PDFs and official answer keys (spanning the modern TRI format from **2009 to 2025**).
   - INEP Microdados catalog containing official Item Response Theory (TRI) parameters:
     - Discrimination parameter ($a$)
     - Difficulty parameter ($b$)
     - Guessing parameter ($c$)
2. **Standard Subject Taxonomy**:
   - `MATHEMATICS` (*Matemática e suas Tecnologias*)
   - `NATURAL_SCIENCES` (*Ciências da Natureza e suas Tecnologias* - Physics, Chemistry, Biology)
   - `HUMANITIES` (*Ciências Humanas e suas Tecnologias* - History, Geography, Philosophy, Sociology)
   - `LANGUAGES` (*Linguagens, Códigos e suas Tecnologias* - Portuguese, Literature, Arts, English, Spanish)
3. **Question Representation Standard**:
   - Question statements are normalized to standard GitHub Flavored Markdown.
   - Mathematical formulas and chemical equations are normalized to LaTeX syntax (`$...$` and `$$...$$`).
   - Image diagrams are stored as CDN/S3 image references with alternative accessibility text.

---

## 3. Functional Requirements (FR)

### Module 1: Question Bank Catalog & Ingestion
- **FR-01**: The system must allow querying questions filtered by `exam_year`, `subject_area`, `discipline`, `topic`, and `difficulty_level`.
- **FR-02**: The system must support pagination (default 10 items, maximum 50) and cursor/offset-based queries with total count headers.
- **FR-03**: The system must provide an endpoint to generate a randomized practice set based on specific filter criteria (e.g., "10 medium-difficulty Physics questions from 2020-2023").

### Module 2: Practice Sessions & Grading
- **FR-04**: The system must allow starting an anonymous practice session using an `X-Session-Id` header (UUID) without requiring user authentication.
- **FR-05**: The system must record student answers for each question in a session and calculate immediate evaluation feedback (`CORRECT`, `INCORRECT`).
- **FR-06**: When evaluating a response, the system must immediately return the correct option letter, the student's selected option, and the base resolution explanation.
- **FR-07**: The system must finalize a practice session and generate a diagnostic summary report displaying:
  - Total score percentage.
  - Accuracy breakdown by subject and sub-topic.
  - Topic-level learning recommendations (flagging the weakest areas).

### Module 3: Socratic Explanation & AI Study Assistant
- **FR-08**: The system must allow students to request a step-by-step resolution breakdown for any specific question.
- **FR-09**: The system must support conversational inquiries regarding a question (e.g., *"Why is alternative B wrong?"*), routing to Google Gemini Free Tier.
- **FR-10**: The AI assistant must strictly follow Socratic educational guardrails: it must explain the underlying scientific/mathematical concept and guide the student, rather than simply stating the solution.

### Module 4: Authentication & User Accounts (Optional / Dual Mode)
- **FR-11**: The system must support optional user registration and JWT login.
- **FR-12**: If authenticated via JWT, the student's practice history and diagnostic profile must be linked to their account and persisted across sessions.
- **FR-13**: Anonymous sessions must be linkable to an account upon student registration.

---

## 4. Non-Functional Requirements (NFR)

| ID | Category | Requirement Description | Target Metric / Standard |
| :--- | :--- | :--- | :--- |
| **NFR-01** | **Performance** | API read latency for question queries and quiz generation. | `p95 < 100ms`, `p99 < 200ms` under 500 concurrent req/sec |
| **NFR-02** | **Availability** | System uptime and resilience against partial outages. | $\ge 99.9\%$ uptime; graceful degradation if external AI is down |
| **NFR-03** | **Rate Limiting** | Protection against scraping, denial of service, and API quota abuse. | Token Bucket rate limiting: 60 req/min per IP for general API; 15 req/min for AI endpoints |
| **NFR-04** | **Observability** | Real-time health metrics, tracing, and failure diagnostics. | Prometheus scraping at `/actuator/prometheus`; Micrometer `traceId` propagation on all logs and HTTP responses |
| **NFR-05** | **Internationalization** | API response localization for multilingual maintainers and students. | Spring Boot `MessageSource` supporting `Accept-Language: pt-BR` and `en` |
| **NFR-06** | **Code Quality** | Automated continuous inspection and test coverage. | 6-Stage GitHub Actions Quality Gate: 0 compiler warnings (`-Werror`), 0 PMD duplicates, 80%+ JaCoCo coverage |
| **NFR-07** | **Containerization** | Completely reproducible developer setup. | 1-command startup via `docker compose up` for PostgreSQL, Prometheus, and microservices |

---

## 5. Scope Boundaries

### In Scope (Sprint 1 to Sprint 3)
- Fully functional REST APIs for question bank, practice sessions, diagnostics, and AI resolutions.
- PostgreSQL database schemas with B-tree indices and relational integrity.
- Nginx Load Balancer and Spring Cloud Gateway with Token Bucket rate limiting.
- Hexagonal Architecture implementation with decoupled domain layers.
- Docker Compose environment with Prometheus and Grafana telemetry.
- Comprehensive automated unit and integration test suite with GitHub Actions CI.

### Out of Scope (Future Phases)
- Custom frontend mobile app (mobile clients will consume this public REST API).
- Proprietary question licensing (strictly limited to public-domain INEP exams).
- Monolithic payment or subscription gateways (the platform is strictly non-profit).
