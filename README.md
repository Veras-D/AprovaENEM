<div align="center">
    <h1>📚 AprovaENEM — Open Examination & Diagnostic Platform</h1>
    <p><strong>Democratizing high-quality ENEM preparation for Brazilian public high school students through open public data, diagnostic assessment, resilient microservices, and mobile-first accessibility.</strong></p>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React: 18+](https://img.shields.io/badge/React-18+-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript: 5.3+](https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS: 3.4](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Java: 21 LTS](https://img.shields.io/badge/Java-21%20LTS-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot: 3.3+](https://img.shields.io/badge/Spring%20Boot-3.3+-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL: 16](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker: Ready](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Prometheus: APM](https://img.shields.io/badge/Prometheus-Telemetry-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![CI/CD: GitHub Actions](https://img.shields.io/badge/CI%2FCD-6--Stage%20Quality%20Gate-2088FF?logo=githubactions&logoColor=white)](https://github.com/)
[![UN SDG: 4 Quality Education](https://img.shields.io/badge/UN%20SDG-4%20Quality%20Education-C5192D)](https://sdgs.un.org/goals/goal4)
[![UN SDG: 10 Reduced Inequalities](https://img.shields.io/badge/UN%20SDG-10%20Reduced%20Inequalities-E5243B)](https://sdgs.un.org/goals/goal10)

</div>

---

## 📖 Overview

According to INEP's Censo Escolar, **84.3% of Brazilian secondary students attend public high schools**, yet they remain heavily underrepresented in competitive admissions to federal universities. Commercial online preparatory platforms charge between **R$ 30 and R$ 200+/month** (often requiring full-year credit card debt commitments), while physical prep academies exceed **R$ 1,000/month**, systematically pricing out low-income students from urban peripheries.

**AprovaENEM** is a full-stack open educational platform. It transforms official, public-domain exam archives from **INEP (spanning 2009 to 2025)** into an interactive, mobile-optimized learning ecosystem. Students can practice authentic exam questions on their phones, receive instant step-by-step resolution breakdowns, track diagnostic weak-spot radars, and interact with a Socratic AI study tutor — **100% free, mobile-first, and with zero registration barriers**.

---

## ✨ Features

### 📱 Student Web & Mobile Experience (`frontend/`)
- 🎯 **Frictionless Instant Practice**: Students start solving questions immediately with zero mandatory registration, phone verification, or paywalls.
- 📱 **Mobile-First & 3G/4G Optimized**: High-density, low-bandwidth UI built for budget smartphones and constrained mobile data plans.
- 📊 **Interactive Diagnostic Radar**: Visual skill radar charts mapping student mastery across topics (`MASTERED`, `ATTENTION_NEEDED`, `CRITICAL`).
- 🌙 **High-Contrast & Dark Mode Design**: Eye-strain-free, accessible interface optimized for long focused study marathons and battery efficiency on mobile screens.
- 🧮 **LaTeX & MathJax Rendering**: Flawless mathematical formula and chemical equation rendering across all question statements and options.

### ⚙️ Backend & Distributed Architecture (`backend/`)
- 🗄️ **Complete INEP Question Bank**: Past exams categorized by subject area (*Mathematics, Natural Sciences, Humanities, Languages*), discipline, sub-topic, and Item Response Theory (TRI) difficulty.
- ⚡ **Real-Time Assessment & Grading**: Millisecond evaluation of submissions with immediate distractor analysis.
- 🤖 **Socratic AI Study Tutor**: Powered by **Google Gemini (gemini-1.5-flash)** with pedagogical guardrails: guides students through underlying scientific and mathematical principles without spoiling answers.
- 🛡️ **Token Bucket Edge Rate Limiting**: Built into the API Gateway to prevent scraper abuse and protect upstream LLM API consumption.
- 📈 **Datadog-Style Observability**: Complete Prometheus APM metrics, Micrometer distributed tracing (`traceId` / `spanId` MDC injection), and sub-minute trace-to-error bug isolation.
- 🌐 **Bilingual Backend (i18n)**: Spring Boot `MessageSource` supporting both Portuguese (`pt-BR`) and English (`en`).
- 🏗️ **Hexagonal Architecture**: Strict separation of pure Java domain models from Spring Boot frameworks and PostgreSQL persistence.

---

## 🛠️ Tech Stack

### Frontend Application
- **Framework**: React 18+ with TypeScript (Strict mode, zero `any`)
- **Styling**: Tailwind CSS with custom Dark Design Tokens
- **Icons**: Lucide React
- **Data Visualization**: Recharts / Chart.js for diagnostic skill radars
- **Math Rendering**: KaTeX / MathJax for scientific expressions
- **Build Tool**: Vite 5

### Backend Microservices
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3+ (Web, Data JPA, Validation, Actuator)
- **Architecture**: Microservices with **Hexagonal Architecture (Ports and Adapters)**
- **API Gateway**: Spring Cloud Gateway with Token Bucket Rate Limiting
- **Reverse Proxy**: Nginx (L7 Load Balancer, SSL termination, request buffering)

### Persistence & Storage
- **Primary Database**: PostgreSQL 16 (isolated `auth_db` and `exam_db`)
- **Key Strategy**: Time-ordered UUIDv7
- **Indexing**: Specialized B-Tree multi-column indexes & GIN JSONB indexes

### Observability & Resilience
- **Metrics Scraping**: Prometheus Server (Port 9090) scraping `/actuator/prometheus`
- **Dashboards**: Grafana APM (Port 3000)
- **Distributed Tracing**: Micrometer Tracing with W3C Trace Context
- **Resilience**: Resilience4j Circuit Breaker for Gemini API fallback

### DevOps & CI/CD
- **Containerization**: Unified Multi-Container Docker Compose (Orchestrating Frontend, Nginx, API Gateway, Microservices, Databases, Prometheus & Grafana)
- **Quality Gate**: 6-Stage GitHub Actions CI (`-Werror`, Checkstyle, PMD, PMD CPD, Trivy CVE scan, Gitleaks, JaCoCo 80%+ coverage)

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([📱 Student Client / Browser])
    
    subgraph DockerPlatform ["Unified Docker Compose Platform"]
        Nginx["🛡️ Nginx Reverse Proxy / Load Balancer<br/>Port 80 / 443<br/>• Routes / to Frontend<br/>• Routes /api/** to Gateway"]

        subgraph FrontendContainer ["Frontend Service"]
            UI["🖥️ frontend (Port 80/internal)<br/>React 18 + TypeScript PWA / Nginx Static Serve"]
        end

        subgraph IngressContainer ["Ingress Gateway"]
            Gateway["⚡ api-gateway (Port 8080)<br/>Spring Cloud Gateway + Token Bucket Rate Limiter"]
        end

        subgraph MicroservicesLayer ["Hexagonal Microservices (Java 21 / Spring Boot)"]
            AuthSvc["🔐 auth-service (Port 8081)<br/>Anonymous & JWT Identity"]
            ExamSvc["📚 exam-service (Port 8082)<br/>Assessment & INEP Question Bank"]
        end

        subgraph PersistenceLayer ["PostgreSQL 16 Layer"]
            AuthDB[("🗄️ auth-db (Port 5432)")]
            ExamDB[("🗄️ exam-db (Port 5433)")]
        end

        subgraph TelemetryLayer ["Observability Stack"]
            Prometheus["📊 prometheus (Port 9090)<br/>Scrapes Actuator Metrics"]
            Grafana["📈 grafana (Port 3001)<br/>APM Latency & Error Dashboards"]
        end
    end

    subgraph ExternalServices ["External AI Cloud"]
        Gemini["🤖 Google Gemini API<br/>gemini-1.5-flash Socratic Explanations"]
    end

    User -->|HTTP / HTTPS Port 80| Nginx
    Nginx -->|/| UI
    Nginx -->|/api/**| Gateway
    Gateway -->|/api/v1/auth/**| AuthSvc
    Gateway -->|/api/v1/exams/**<br/>/api/v1/sessions/**<br/>/api/v1/questions/**| ExamSvc

    AuthSvc --> AuthDB
    ExamSvc --> ExamDB
    ExamSvc -.->|Socratic Prompts| Gemini

    Gateway -.->|Metrics| Prometheus
    AuthSvc -.->|Metrics| Prometheus
    ExamSvc -.->|Metrics| Prometheus
    Prometheus --> Grafana

    style User fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    style Nginx fill:#1e293b,stroke:#0284c7,stroke-width:2px,color:#fff
    style UI fill:#047857,stroke:#10b981,stroke-width:2px,color:#fff
    style Gateway fill:#0369a1,stroke:#38bdf8,stroke-width:2px,color:#fff
    style AuthSvc fill:#065f46,stroke:#34d399,stroke-width:2px,color:#fff
    style ExamSvc fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff
    style AuthDB fill:#334155,stroke:#94a3b8,color:#fff
    style ExamDB fill:#334155,stroke:#94a3b8,color:#fff
    style Gemini fill:#4338ca,stroke:#a5b4fc,color:#fff
    style Prometheus fill:#7c2d12,stroke:#fb923c,color:#fff
    style Grafana fill:#701a75,stroke:#f472b6,color:#fff
```

---

## 📁 Project Structure

```bash
ReconectaRecode/
├── README.md                            # Master project documentation
├── CHANGELOG.md                         # Project changelog (Keep a Changelog standard)
├── docker-compose.yml                   # Root Full-Stack Docker Compose Orchestration
├── .env.example                         # Global environment variable template
├── docs/                                # Project Specifications & Planning
│   ├── BACKLOG.md                       # Multi-Sprint Product Backlog & Roadmap
│   └── sprint-1/                        # Sprint 1 Deliverables
│       ├── 01-business-and-market-strategy.md  # BMC, ICP Personas & SDG 4/10 KPIs
│       ├── 02-project-charter.md        # Scope, INEP Ingestion & Requirements
│       ├── 03-system-architecture.md   # C4 Containers, Ingress, Hexagonal Layout
│       ├── 04-data-modeling.md          # PostgreSQL DDL, ER Schemas & B-Trees
│       ├── 05-api-specification.md      # OpenAPI 3.0 REST Route Specifications
│       ├── 06-observability-datadog-style.md # Prometheus, Micrometer & Alert Rules
│       ├── 07-quality-gate-ci.md        # 6-Stage CI/CD Specification
│       └── 08-sprint-backlog.md         # Sprint 1 Summary & Next Steps Index
├── backend/                             # Spring Boot Microservices
│   ├── api-gateway/                     # Spring Cloud Gateway + Rate Limiting
│   ├── auth-service/                    # Authentication & Session Service
│   ├── exam-service/                    # Examination, Assessment & Socratic AI
│   └── pom.xml                          # Multi-module Maven Parent POM
├── frontend/                            # React 18 + TypeScript Application
│   ├── src/                             # UI components, pages & state management
│   ├── Dockerfile                       # Production multi-stage Nginx container
│   ├── package.json                     # Frontend dependencies & scripts
│   └── vite.config.ts                   # Vite configuration
└── .github/
    └── workflows/
        └── quality-gate.yml             # Automated CI Verification Pipeline
```

---

## 🚀 Quickstart (100% Docker Compose)

The entire full-stack ecosystem (frontend, backend microservices, gateway, databases, and telemetry) runs with a **single command**.

### Prerequisites
- Docker Engine 24+ & Docker Compose v2
- Google Gemini API Key (free tier available for development from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Configure
```bash
git clone https://github.com/Veras-D/ReconectaRecode.git
cd ReconectaRecode
cp .env.example .env
```
Edit `.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY=AIzaSyYourApiKeyHere...
```

### 2. Launch Entire Platform
```bash
docker compose up -d --build
```

### 3. Access Endpoints
- **Student Web Application (Frontend)**: `http://localhost`
- **API Gateway**: `http://localhost:8080` (or `http://localhost/api/v1/...`)
- **OpenAPI Swagger Documentation**: `http://localhost:8080/swagger-ui.html`
- **Prometheus Telemetry**: `http://localhost:9090`
- **Grafana APM**: `http://localhost:3001` (admin / admin)

---

## 📡 Core API Routes Summary

| Method | Endpoint | Description | Auth Header |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/session` | Create anonymous practice session UUID | None |
| `GET` | `/api/v1/exams` | List available ENEM historical editions | Optional |
| `GET` | `/api/v1/subjects` | List subject areas, disciplines & topics | Optional |
| `GET` | `/api/v1/questions` | Query questions with topic & difficulty filters | Optional |
| `POST` | `/api/v1/sessions` | Generate randomized or topic practice quiz | `X-Session-Id` |
| `POST` | `/api/v1/sessions/{id}/attempts` | Submit answer & receive instant feedback | `X-Session-Id` |
| `POST` | `/api/v1/sessions/{id}/complete` | Finish quiz & generate diagnostic radar | `X-Session-Id` |
| `GET` | `/api/v1/questions/{id}/resolution` | Fetch curated step-by-step resolution | Optional |
| `POST` | `/api/v1/questions/{id}/ask` | Ask Socratic concept question (Gemini AI) | `X-Session-Id` |

*Complete OpenAPI specification with request/response JSON schemas is available in [docs/sprint-1/05-api-specification.md](docs/sprint-1/05-api-specification.md).*

---

## 🛡️ 6-Stage Quality Gate

AprovaENEM adopts the strict automated quality gate standard established in [CV_Maker](https://github.com/Veras-D/CV_Maker):

1. **Gate 1: Compiler Zero Warnings**: `javac` executed with `-Werror -Xlint:all` and TypeScript strict type checking.
2. **Gate 2: Static Analysis**: Checkstyle (Google Java Style) + PMD (Cyclomatic Complexity $\le 12$, max method lines $\le 50$) + ESLint.
3. **Gate 3: Duplication Detection**: PMD CPD enforcing duplicate token threshold $< 3\%$.
4. **Gate 4: Security & Secret Scan**: Trivy CVE dependency audit (0 critical/high) + Gitleaks commit history scan.
5. **Gate 5: Automated Test Suite**: JUnit 5 unit & integration tests with **80%+ JaCoCo coverage**.
6. **Gate 6: Build Verification**: Clean container builds via Docker Compose and production bundle packaging.

---

## 🤝 Contributing

Contributions from educators, engineers, and students are welcome!

1. Fork the repository and create a feature branch (`git checkout -b feature/issue-12-quiz-filter`).
2. Follow **Conventional Commits**:
   - `feat: add topic filter to question repository`
   - `fix: correct scoring calculation in complete session`
   - `docs: update OpenAPI schemas`
3. Ensure all local quality checks pass before pushing.
4. Push and open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <p>© 2026 AprovaENEM — Reconecta Recode Initiative. Built for educational equity.</p>
</div>
