# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.1] - 2026-09-18
### 🔧 Changed
- docs(security): Add Spring Security 6 architecture, SecurityFilterChain, stateless JWT filter, and RBAC matrix matching Alma Career / Teamio standards
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
- docs(ci): Add 6-stage Quality Gate matching CV_Maker standards in 07-quality-gate-ci.md
- docs(backlog): Add Multi-Sprint Backlog and Roadmap in BACKLOG.md and 08-sprint-backlog.md
- docs(readme): Add master project documentation in README.md
