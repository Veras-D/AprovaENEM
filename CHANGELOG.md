# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.18] - 2026-10-25

### Changed
- feat(practice): Zeroed experience points (`awardedXp: 0`) and total session XP for unauthenticated guest sessions in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx), ensuring guests do not accumulate or earn XP without a registered student account ([`TASK-S6-44`](docs/BACKLOG.md#task-s6-44)).
- feat(diagnostic): Updated [`DiagnosticResultView.tsx`](frontend/src/features/diagnostic/components/DiagnosticResultView.tsx) to render a distinct "0 XP (Cadastre-se para pontuar)" card for unauthenticated guest candidates instead of granting XP ([`TASK-S6-44`](docs/BACKLOG.md#task-s6-44)).
- feat(feedback): Suppressed the `+XP` badge in [`FeedbackBanner.tsx`](frontend/src/features/practice/components/FeedbackBanner.tsx) whenever `awardedXp <= 0`, preventing XP announcements from displaying to guest students on individual question submissions ([`TASK-S6-44`](docs/BACKLOG.md#task-s6-44)).

### Fixed
- fix(practice): Prevented unauthenticated guest candidates who completed the diagnostic assessment from automatically entering "Questões Diárias do ENEM" (Daily Practice Mode) upon page reload in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) and [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts), restoring them directly to [`DiagnosticResultView`](frontend/src/features/diagnostic/components/DiagnosticResultView.tsx) with their saved TRI score, skill radar, and guest registration prompt.
- fix(auth): Cleaned credential fields (`email`, `password`, `confirmPassword`) upon modal close, tab switch, successful login, and logout in [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), and added autofill suppression attributes (`autoComplete="new-password"`, non-standard identifier names, dummy inputs) to prevent browsers from automatically injecting previously saved credentials when the authentication dialog is reopened ([`TASK-S6-45`](docs/BACKLOG.md#task-s6-45)).
- fix(auth): Repositioned "Esqueci minha senha" recovery link below the password input field in [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx) for improved visual hierarchy and natural top-to-bottom tab order ([`TASK-S6-45`](docs/BACKLOG.md#task-s6-45)).

## [0.6.17] - 2026-10-25

### Changed
- feat(practice): Restricted gamification celebration modal (`CelebrationOverlay`) and calibrated top control bar (`Diagnóstico ENEM Calibrado`) exclusively to authenticated students in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx), ensuring that unauthenticated guest candidates completing the ENEM diagnostic assessment are not presented with premature achievement badge popups or student-only actions ("Começar Treino Diário", "Ranking") ([`TASK-S6-43`](docs/BACKLOG.md#task-s6-43)).
- feat(diagnostic): Configured [`DiagnosticResultView.tsx`](frontend/src/features/diagnostic/components/DiagnosticResultView.tsx) to be presented directly to unauthenticated guests with calibrated TRI score, skill radar, and the prominent "Salve seu Diagnóstico e Histórico" registration prompt without blocking modal overlays ([`TASK-S6-43`](docs/BACKLOG.md#task-s6-43)).

### Fixed
- fix(session): Updated `clearSession()` in [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts) to clean up global/anonymous diagnostic storage keys upon logout while preserving user-scoped reports, preventing unauthenticated sessions from inheriting previous logged-in users' completed diagnostic radar state ([`TASK-S6-43`](docs/BACKLOG.md#task-s6-43)).
- fix(test): Updated Cypress student quiz journey E2E spec ([`01-student-quiz-journey.cy.ts`](frontend/cypress/e2e/01-student-quiz-journey.cy.ts)) to verify that unauthenticated diagnostic completion cleanly transitions to the diagnostic result view with guest registration callout ([`TASK-S6-43`](docs/BACKLOG.md#task-s6-43)).

## [0.6.16] - 2026-10-25

### Added
- feat(exam): Implemented persistent PostgreSQL diagnostic storage endpoints `GET /api/v1/sessions/diagnostic/latest` and `POST /api/v1/sessions/diagnostic` ([`PracticeSessionController.java`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/PracticeSessionController.java), [`PracticeSessionService.java`](backend/exam-service/src/main/java/com/aprovaenem/exam/application/service/PracticeSessionService.java), [`DiagnosticReportRepositoryAdapter.java`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/out/persistence/adapter/DiagnosticReportRepositoryAdapter.java)), enabling student diagnostic assessments and skill radar evaluations to be saved to and retrieved from the `diagnostic_summaries` table in PostgreSQL ([`TASK-S6-42`](docs/BACKLOG.md#task-s6-42)).
- feat(frontend): Added `examService.getLatestDiagnosticReport` and `examService.saveDiagnosticReport` in [`exam.service.ts`](frontend/src/api/services/exam.service.ts) and wired automatic PostgreSQL synchronization upon completing diagnostic assessments and daily practice sessions ([`TASK-S6-42`](docs/BACKLOG.md#task-s6-42)).

### Changed
- feat(session): Scoped diagnostic assessment completion and skill radar state per student user (`aprovaenem_diagnostic_report_<userId>`, `aprovaenem_diagnostic_completed_<userId>`) in [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts), ensuring that taking a diagnostic as an authenticated student permanently preserves their diagnostic report across logout/login cycles ([`TASK-S6-42`](docs/BACKLOG.md#task-s6-42)).
- feat(auth): Integrated `restoreUserDiagnostic` on student authentication login (`setAuth`) and page reload (`syncAuthFromStorage`) in [`useAuthStore.ts`](frontend/src/stores/useAuthStore.ts) and [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx), automatically rehydrating the student's completed diagnostic radar and advancing them directly to daily practice questions ("Questões Diárias do ENEM") without prompting them to redo the diagnostic ([`TASK-S6-42`](docs/BACKLOG.md#task-s6-42)).

### Fixed
- fix(session): Prevented `clearSession()` in [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts) from purging user-scoped diagnostic reports upon logout, resolving an issue where logging out and logging back in previously destroyed student diagnostic radar data and forced students to retake the diagnostic assessment ([`TASK-S6-42`](docs/BACKLOG.md#task-s6-42)).

## [0.6.15] - 2026-10-25

### Added
- feat(ci): Created dedicated CI Quality Gate Inspector and Watcher CLI tool ([`ci.sh`](scripts/ci.sh), [`ci.py`](scripts/ci.py)) providing automated root cause failure extraction, cleaned log parsing without timestamps, live pipeline watching, job log inspection, and added operational usage documentation to [`AGENTS.md`](AGENTS.md) ([`TASK-S6-41`](docs/BACKLOG.md#task-s6-41)).

### Changed
- feat(diagnostic): Integrated cumulative diagnostic proficiency updates upon completing daily practice sessions ([`diagnostic-utils.ts`](frontend/src/features/diagnostic/diagnostic-utils.ts), [`diagnostic-utils.test.ts`](frontend/src/features/diagnostic/diagnostic-utils.test.ts), [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx), [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts)), ensuring that questions answered across Matemática, Natureza, Humanas, and Linguagens dynamically increment knowledge area question totals, update accuracy percentages, recalculate mastery levels, and refresh the Diagnostic Radar and area breakdown cards in real time ([`TASK-S6-41`](docs/BACKLOG.md#task-s6-41)).
- feat(practice): Replaced the redundant "Meta Diária" progress bar card in the Daily Practice summary view ([`DailyPracticeSummaryView.tsx`](frontend/src/features/practice/components/DailyPracticeSummaryView.tsx), [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx)) with the student's daily study streak counter ("Ofensiva Diária" 🔥), showcasing consecutive study days and flame status ("Chama de estudos mantida hoje!") alongside accuracy and XP earned ([`TASK-S6-40`](docs/BACKLOG.md#task-s6-40)).

### Fixed
- fix(ci): Resolved duplicate hook dependency (`targetBatchSize`) in `PracticeHero.tsx` satisfying ESLint `--max-warnings 0` rule `react-hooks/exhaustive-deps` ([`TASK-S6-41`](docs/BACKLOG.md#task-s6-41)).
- fix(test): Added mock intercept for `GET **/api/v1/gamification/profile` in Cypress Socratic AI Tutor spec ([`02-socratic-ai-tutor.cy.ts`](frontend/cypress/e2e/02-socratic-ai-tutor.cy.ts)), preventing unauthenticated 401 network responses from wiping student session authentication in `client.ts` during interactive chat execution ([`TASK-S6-41`](docs/BACKLOG.md#task-s6-41)).

## [0.6.14] - 2026-10-25

### Changed
- fix(practice): Bound the next steps prompt and continuation call-to-action button in the Daily Practice summary view to the student's dynamic daily study goal target (`dailyGoalTarget`) in [`DailyPracticeSummaryView.tsx`](frontend/src/features/practice/components/DailyPracticeSummaryView.tsx) and updated [`DailyPracticeSummaryView.test.tsx`](frontend/src/features/practice/components/DailyPracticeSummaryView.test.tsx), replacing hardcoded "5 questões" references so custom daily goals (such as 3, 10, or 15 questions) dynamically render "Continue praticando com mais {dailyGoalTarget} questões..." and "Praticar Mais {dailyGoalTarget} Questões" ([`TASK-S6-39`](docs/BACKLOG.md#task-s6-39)).

## [0.6.13] - 2026-10-25

### Changed
- feat(practice): Synchronized Daily Practice questions ("Questões Diárias do ENEM") batch size with the student's configured daily study goal target ([`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx), [`PracticeHero.test.tsx`](frontend/src/features/practice/PracticeHero.test.tsx)), allowing sessions to dynamically load 3, 5, 10, or 15 questions matching student rhythm preferences and automatically resynchronizing unattempted daily practice sets upon daily goal target updates ([`TASK-S6-38`](docs/BACKLOG.md#task-s6-38)).
- feat(hooks): Added immediate optimistic cache update in `useUpdateDailyGoalMutation` ([`hooks.ts`](frontend/src/api/hooks.ts)) via `queryClient.setQueryData`, ensuring instant propagation of updated daily study goal targets across the entire platform ([`TASK-S6-38`](docs/BACKLOG.md#task-s6-38)).

## [0.6.12] - 2026-10-25

### Added
- feat(profile): Added explicit "Salvar Meta Diária" action button and error feedback alerts in the Daily Study Goals section of the student Profile page ([`ProfilePage.tsx`](frontend/src/features/profile/ProfilePage.tsx), [`ProfilePage.test.tsx`](frontend/src/features/profile/ProfilePage.test.tsx)), aligning layout and interaction parity with the adjacent personal preferences card ([`TASK-S6-37`](docs/BACKLOG.md#task-s6-37)).

### Changed
- feat(profile): Updated daily study goal target options so clicking a target (3, 5, 10, or 15 questions) dynamically updates local goal selection and enables instant or explicit persistence via "Salvar Meta Diária" with loading indicators and auto-dismissing confirmation banners ([`TASK-S6-37`](docs/BACKLOG.md#task-s6-37)).

### Fixed
- fix(gamification): Aligned frontend daily study goal API client payload with backend DTO by sending both `targetQuestions` and `target` in [`gamification.service.ts`](frontend/src/api/services/gamification.service.ts), and added `@JsonAlias({"target", "dailyGoal"})` to [`UpdateDailyGoalRequest.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/dto/UpdateDailyGoalRequest.java), resolving silent field deserialization mismatches that previously prevented daily goal target persistence in PostgreSQL ([`TASK-S6-37`](docs/BACKLOG.md#task-s6-37)).

## [0.6.11] - 2026-10-25

### Added
- feat(practice): Implemented dedicated Daily Practice Questions mode ("Questões Diárias do ENEM") and completion summary view ([`DailyPracticeSummaryView.tsx`](frontend/src/features/practice/components/DailyPracticeSummaryView.tsx), [`DailyPracticeSummaryView.test.tsx`](frontend/src/features/practice/components/DailyPracticeSummaryView.test.tsx), [`index.ts`](frontend/src/features/practice/components/index.ts)) with an interactive metrics grid displaying question accuracy, XP earned, daily study goal progress bar, and immediate actions to continue practicing ("Continuar Praticando"), take official exams ("Simular Prova Oficial"), view diagnostic report ("Painel Diagnóstico"), or check leaderboard ranking ("Ranking") ([`TASK-S6-36`](docs/BACKLOG.md#task-s6-36)).
- feat(practice): Added dynamic button labeling (`finishButtonLabel`, `finishButtonAriaLabel`) in [`FeedbackBanner.tsx`](frontend/src/features/practice/components/FeedbackBanner.tsx) and [`InstantFeedback.tsx`](frontend/src/features/practice/components/InstantFeedback.tsx) so daily practice sessions present "Concluir Treino Diário" instead of "Ver Meu Diagnóstico" ([`TASK-S6-36`](docs/BACKLOG.md#task-s6-36)).

### Changed
- feat(practice): Enforced one-time diagnostic assessment for authenticated students in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) and [`PracticeHero.test.tsx`](frontend/src/features/practice/PracticeHero.test.tsx); once a logged-in user completes their diagnostic, subsequent visits to Practice (`?section=practice`) automatically launch fresh daily questions from the pool rather than looping back into the diagnostic test or trapping them in the diagnostic completion view ([`TASK-S6-36`](docs/BACKLOG.md#task-s6-36)).
- feat(practice): Removed "Refazer Diagnóstico" recalibration action for authenticated students in [`DiagnosticResultView.tsx`](frontend/src/features/diagnostic/components/DiagnosticResultView.tsx) and [`DiagnosticResultView.test.tsx`](frontend/src/features/diagnostic/components/DiagnosticResultView.test.tsx) (`!isAuthenticated && onRetakeDiagnostic`), replacing it with an accessible "Iniciar Treino Diário" call to action ([`TASK-S6-36`](docs/BACKLOG.md#task-s6-36)).
- feat(diagnostic): Added a persistent callout card in [`DiagnosticDashboard.tsx`](frontend/src/features/diagnostic/components/DiagnosticDashboard.tsx) directing students from their preserved diagnostic radar profile directly into their daily question set via "Ir para Treino Diário" ([`TASK-S6-36`](docs/BACKLOG.md#task-s6-36)).
- refactor(session): Guarded session completion logic in [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts) so daily practice sets never overwrite the saved diagnostic report or forcibly alter session phase away from daily practice ([`TASK-S6-36`](docs/BACKLOG.md#task-s6-36)).

### Security
- sec(diagnostic): Enforced one-time diagnostic integrity guard preventing unauthorized erasure or accidental resetting of candidate diagnostic mastery level and baseline TRI scores in local session storage ([`TASK-S6-36`](docs/BACKLOG.md#task-s6-36)).

## [0.6.10] - 2026-10-25

### Added
- feat(auth): Implemented seamless email confirmation workflow upon student sign up ([`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), [`ProfilePage.tsx`](frontend/src/features/profile/ProfilePage.tsx), [`App.tsx`](frontend/src/App.tsx), [`auth.service.ts`](frontend/src/api/services/auth.service.ts), [`hooks.ts`](frontend/src/api/hooks.ts), [`useAuthStore.ts`](frontend/src/stores/useAuthStore.ts)) providing interactive token validation, instant resend action with cooldown/success alerts, dedicated `verify-email` modal mode, `?verifyToken=` deep link parsing, and profile page email verification status badges ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).
- feat(auth): Implemented full-stack self-service password recovery and token reset flow ([`ForgotPasswordRequest.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/dto/ForgotPasswordRequest.java), [`ForgotPasswordResponse.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/dto/ForgotPasswordResponse.java), [`ResetPasswordRequest.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/dto/ResetPasswordRequest.java), [`ResetPasswordResponse.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/dto/ResetPasswordResponse.java), [`AuthService.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/application/service/AuthService.java), [`AuthController.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/AuthController.java), [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), [`DiagnosticDashboard.tsx`](frontend/src/features/diagnostic/components/DiagnosticDashboard.tsx)) ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).
- feat(auth): Added public REST endpoints `POST /api/v1/auth/forgot-password` (generating a secure 24-hour expiration token with silent enumeration defense under OWASP API Top 10) and `POST /api/v1/auth/reset-password` (token verification, expiration validation, password complexity check, peppered BCrypt hashing, and token invalidation) in `auth-service` ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).
- feat(auth): Added accessible "Esqueci minha senha" recovery triggers and dedicated dual-step recovery workflow in [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx) and student diagnostic gate in [`DiagnosticDashboard.tsx`](frontend/src/features/diagnostic/components/DiagnosticDashboard.tsx), supporting email dispatch, direct token redemption, fluid password strength meter, and instant feedback alerts ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).

### Fixed
- fix(auth): Refactored `GamificationService.java` to reduce cyclomatic complexity in `awardXpForActivity` (extracting private helpers `updateStreakAndDailyGoal`, `handleMissedDays`, `checkDailyGoalBonus`, `evaluateBadgeUnlocks`, `updateWeeklyLeaderboard`, and `isNewCalendarMonth`) and simplified ternary conditional check, satisfying PMD rules `CyclomaticComplexity` and `SimplifiedTernary` with zero violations ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).
- fix(auth): Extracted `toUserResponse` helper method in `AuthController.java` to deduplicate response mapping between `getCurrentUser` and `updateProfile`, satisfying PMD CPD code duplication detection (< 3% / 100 tokens) with zero violations ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).
- fix(test): Corrected `UserGamificationProfileTest.java` default daily goal assertion to 5 questions, aligning with the domain model standard and ensuring 100% green backend tests ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).
- fix(test): Updated `Header.test.tsx` to assert student profile button presence via accessible name `/Maria Silva/i`, aligning with WCAG 2.1 AA vector avatar ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).
- fix(a11y): Resolved Axe-Core WCAG 2.1 Success Criterion 2.5.3 (Label in Name) violation `label-content-name-mismatch` in Playwright and Cypress accessibility suites by setting `ariaHidden={true}` on `AvatarRenderer` and replacing raw initial text in fallback circle with accessible `<User />` vector icon in `Header.tsx` and `MobileDrawer.tsx`, ensuring perfect parity between visible text and accessible name across all viewports and browser engines ([`TASK-S6-35`](docs/BACKLOG.md#task-s6-35)).

## [0.6.9] - 2026-10-24

### Added
- feat(profile): Implemented dedicated full-page student profile and customization center ([`ProfilePage.tsx`](frontend/src/features/profile/ProfilePage.tsx), [`ProfilePage.test.tsx`](frontend/src/features/profile/ProfilePage.test.tsx), [`App.tsx`](frontend/src/App.tsx)) accessible from header profile chip ([`Header.tsx`](frontend/src/components/layout/Header.tsx)), mobile drawer ([`MobileDrawer.tsx`](frontend/src/components/layout/MobileDrawer.tsx)), and URL routing (`?section=profile`), replacing modal dialogs with a full-width experience ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).
- feat(avatar): Implemented interactive Duolingo-style avatar system with customizable vector graphics ([`AvatarRenderer.tsx`](frontend/src/components/avatar/AvatarRenderer.tsx), [`AvatarCreator.tsx`](frontend/src/components/avatar/AvatarCreator.tsx), [`AvatarRenderer.test.tsx`](frontend/src/components/avatar/AvatarRenderer.test.tsx), [`AvatarCreator.test.tsx`](frontend/src/components/avatar/AvatarCreator.test.tsx)) providing 8 skin tones, 6 hairstyles, 7 hair colors, 4 eye expressions (including scholarly spectacles and sunglasses), 4 mouth expressions, 4 outfits, 6 outfit colors, student accessories (headphones, graduation capelo, redação pencil), 6 background colors, and a Duolingo "🎲 Aleatório" randomize generator with real-time preview and persistence across the platform ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).
- feat(profile): Added personal academic preferences and study rhythm controls with daily goal target customization (defaulting to 5 questions/day), public/private school classification, dream degree course target (e.g. Medicina USP), and Brazilian LGPD Art. 18 data export and permanent erasure integration, with security password tab completely removed ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).
- feat(auth): Added self-service profile update endpoint `PUT /api/v1/auth/me` with `UpdateProfileRequest` ([`AuthController.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/AuthController.java), [`AuthService.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/application/service/AuthService.java), [`AuthServiceTest.java`](backend/auth-service/src/test/java/com/aprovaenem/auth/application/service/AuthServiceTest.java)) supporting partial updates of student details, target degree, and school type ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).

### Changed
- feat(leaderboard): Integrated student vector avatar rendering in the weekly league ranking table ([`WeeklyLeagueLeaderboard.tsx`](frontend/src/features/gamification/components/WeeklyLeagueLeaderboard.tsx), [`WeeklyLeagueLeaderboard.test.tsx`](frontend/src/features/gamification/components/WeeklyLeagueLeaderboard.test.tsx), [`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx)), displaying the student's customized Duolingo-style avatar profile picture (PFP) alongside their username and position in the ranking ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).
- refactor(profile): Replaced native HTML `<select>` with custom accessible WAI-ARIA `Select` component ([`ProfilePage.tsx`](frontend/src/features/profile/ProfilePage.tsx), [`ProfilePage.test.tsx`](frontend/src/features/profile/ProfilePage.test.tsx)) for school type selection with chevron transitions, dark-mode popover menu, option descriptions, and checkmark indicators ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).

### Removed
- refactor(layout): Removed redundant "Exclusão de Conta (Art. 18)" button from the global footer ([`RootLayout.tsx`](frontend/src/layouts/RootLayout.tsx), [`RootLayout.test.tsx`](frontend/src/layouts/RootLayout.test.tsx)), centralizing LGPD Art. 18 data rights and permanent erasure inside the student Profile page ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).

### Fixed
- fix(a11y): Aligned header profile button accessible name with visible student name text (`aria-label={user.name}`) in [`Header.tsx`](frontend/src/components/layout/Header.tsx), satisfying WCAG 2.1 Success Criterion 2.5.3 (Label in Name) and resolving Axe-Core serious violation `label-content-name-mismatch` in Playwright accessibility audits ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).
- fix(e2e): Seeded persistent diagnostic report and completion state in Cypress E2E test suites ([`04-gamification-and-diagnostics.cy.ts`](frontend/cypress/e2e/04-gamification-and-diagnostics.cy.ts), [`05-accessibility-wcag-audit.cy.ts`](frontend/cypress/e2e/05-accessibility-wcag-audit.cy.ts)), ensuring authentic radar chart rendering and eliminating retrying timeout assertions on student diagnostic dashboards ([`TASK-S6-34`](docs/BACKLOG.md#task-s6-34)).
- fix(ci): Aligned diagnostic dashboard region accessibility labels with E2E Playwright test locators (matching both singular and plural forms) in [`DiagnosticDashboard.tsx`](frontend/src/features/diagnostic/components/DiagnosticDashboard.tsx), [`02-mobile-responsive-viewport.spec.ts`](frontend/e2e/02-mobile-responsive-viewport.spec.ts), and [`05-accessibility-lighthouse-audit.spec.ts`](frontend/e2e/05-accessibility-lighthouse-audit.spec.ts) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Standardized default daily study goal target to 5 questions across database schema (`V5__update_default_daily_goal_target.sql`), domain model ([`UserGamificationProfile.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/domain/model/UserGamificationProfile.java)), and frontend client ([`gamification.service.ts`](frontend/src/api/services/gamification.service.ts), [`NotificationBell.tsx`](frontend/src/components/notifications/NotificationBell.tsx)), aligning with the 5-question starter diagnostic and micro-learning pedagogical standard ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Corrected daily goal reset and emergency streak freeze recharge in [`GamificationService.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/application/service/GamificationService.java) and [`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx) by evaluating `lastActivityDate.isBefore(today)` to reset `completedQuestions` to 0 on new calendar days, automatic monthly recharge of `streakFreezeAvailable` back to 1 on new calendar months, and added a dedicated notification alert for consumed freeze shields in [`NotificationBell.tsx`](frontend/src/components/notifications/NotificationBell.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(notifications): Removed pulsating/glowing animation from the unread notification counter badge and added `.scrollbar-none` to the notification feed list in [`NotificationBell.tsx`](frontend/src/components/notifications/NotificationBell.tsx), eliminating the default native grey scrollbar and distracting number glow ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).

## [0.6.8] - 2026-10-22

### Added
- feat(notifications): Implemented an accessible notification center popover ([`NotificationBell.tsx`](frontend/src/components/notifications/NotificationBell.tsx), [`NotificationBell.test.tsx`](frontend/src/components/notifications/NotificationBell.test.tsx)) positioned in the authenticated header next to the student avatar and username ([`Header.tsx`](frontend/src/components/layout/Header.tsx)), providing categorized tabs ("Todas", "Conquistas", "Lembretes", "Avisos"), real-time completed achievement badges, daily goal and streak study reminders, weekly league reset and Socratic tutor alerts, persistent read status tracking in `localStorage`, "Marcar todas como lidas" action, and keyboard `Escape`/click-outside dismissal ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- feat(gamification): Implemented achievement unlock celebrations in [`BadgeShelf.tsx`](frontend/src/features/gamification/components/BadgeShelf.tsx) and [`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx), triggering the full-screen confetti [`CelebrationOverlay.tsx`](frontend/src/features/gamification/components/CelebrationOverlay.tsx) with congratulatory titles, badge names, descriptions, and XP bonuses when an achievement milestone is completed in real-time ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- feat(auth): Enforced password complexity rules (at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character), added a real-time continuous fluid password strength meter bar (`width` + `background-color` + `box-shadow` with `700ms cubic-bezier(0.25,1,0.5,1)` transitions that respond smoothly to every keystroke and complexity requirement), added a "Confirmar Senha" (`reg-confirm-password`) validation field, and added standard HTML5 password manager autofill attributes (`method="post" action="/api/v1/auth/register"`, `name="username" autoComplete="username"`, `name="password" autoComplete="new-password"`, `autoComplete="current-password"`) in [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx) and [`RegisterModal.test.tsx`](frontend/src/components/auth/RegisterModal.test.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- feat(a11y): Implemented a smooth `360ms` bottom-right speech-bubble popover transition (`origin-[calc(100%-26px)_calc(100%+10px)] transition-[opacity,transform] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]` with a rotated diamond tail pointer aligned directly over the floating trigger button), removed the orange `focus:ring-brand-accent` border from the floating trigger button, and added `500ms` sliding segmented active pill indicators across Font Scaling (`100%`–`200%`), Accessible Typography (`Padrão` | `OpenDyslexic` | `Atkinson`), and Contrast Modes (`Padrão` | `Alto Contraste` | `Invertido`) in [`AccessibilityToolbar.tsx`](frontend/src/components/accessibility/AccessibilityToolbar.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).

### Changed
- refactor(gamification): Restricted the achievement celebration modal ([`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx), [`BadgeShelf.tsx`](frontend/src/features/gamification/components/BadgeShelf.tsx)) strictly to genuine milestone attainment events, removing the manual test/debug click trigger from achievement cards on the badge shelf ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- docs(readme): Added dedicated "External Datasets, Open-Source Projects & Third-Party Services" reference table in [`README.md`](README.md) attributing [`enem.dev`](https://enem.dev/) (`yunger7/enem-api`), INEP Microdados, VLibras (`spbgovbr-vlibras`), OpenDyslexic, Atkinson Hyperlegible, Google Gemini API, IBM Docling (`DS4SD/docling`), Resend/AWS SES/Firebase FCM, and `willfarrell/docker-autoheal`.

### Fixed
- fix(gamification): Corrected daily goal reset and emergency streak freeze recharge in [`GamificationService.java`](backend/auth-service/src/main/java/com/aprovaenem/auth/application/service/GamificationService.java) and [`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx) by evaluating `lastActivityDate.isBefore(today)` to reset `completedQuestions` to 0 on new calendar days, automatic monthly recharge of `streakFreezeAvailable` back to 1 on new calendar months, and added a dedicated notification alert for consumed freeze shields in [`NotificationBell.tsx`](frontend/src/components/notifications/NotificationBell.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(notifications): Removed pulsating/glowing animation from the unread notification counter badge and added `.scrollbar-none` to the notification feed list in [`NotificationBell.tsx`](frontend/src/components/notifications/NotificationBell.tsx), eliminating the default native grey scrollbar and distracting number glow ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Unlocked progressive badge tiers and one-time achievements automatically upon reaching target milestones (`rawCurrent >= tier.target` or `rawCurrent >= target`) in [`gamification-utils.ts`](frontend/src/features/gamification/gamification-utils.ts), resolving the issue where completed achievements (such as "Raio-X Diagnóstico" and "Maratonista do ENEM") remained locked at 0% or 0/1 ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Connected diagnostic completion (`isDiagnosticCompleted`, `savedDiagnosticReport`), daily question count, streak, and level to `BadgeShelf` via `progressByBadge` and derived unlocked badges in [`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx), ensuring real-time status synchronization for authenticated students ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(practice): Enriched post-diagnostic celebration overlay with unlocked badge attribution ("Medalha Raio-X Diagnóstico Desbloqueada! 🎯") in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Serialized `POST /api/v1/gamification/activity` reports in [`gamification.service.ts`](frontend/src/api/services/gamification.service.ts) so the last answer and the "session completed" report no longer overwrite each other on the backend (a 5-question diagnostic was counted as 4 of 10), and derived the "Primeiro Passo" badge from recorded activity ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Answered questions and finished sessions now count for XP, streak, daily goal, badges and the weekly league: [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) reports each answer and each completed session to `POST /api/v1/gamification/activity` for authenticated students through the new `useRecordActivityMutation` hook and `gamificationService.recordActivity` ([`hooks.ts`](frontend/src/api/hooks.ts), [`gamification.service.ts`](frontend/src/api/services/gamification.service.ts)); previously the diagnostic was graded locally and the backend never received any activity ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Removed the sample-student fallback (`MOCK_LEAGUE_LEADERBOARDS`) from [`WeeklyLeagueLeaderboard.tsx`](frontend/src/features/gamification/components/WeeklyLeagueLeaderboard.tsx) so loading or failed rankings no longer show fake students, added an explicit empty state ("Ninguém pontuou na Liga Bronze ainda esta semana") and pinned the signed-in student's own `currentUserRank` row when it falls outside the returned page ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(diagnostic): Stopped the Diagnóstico page from showing the hard-coded sample report (`MOCK_DIAGNOSTIC_REPORT`: 79% average, "Brasil Colônia" topics) to authenticated students who have not taken a diagnostic; [`DiagnosticDashboard.tsx`](frontend/src/features/diagnostic/components/DiagnosticDashboard.tsx) now renders an empty state with a "Fazer meu diagnóstico agora" call to action, and `report` is now a required prop of [`StudentDiagnosticRadar.tsx`](frontend/src/features/diagnostic/components/StudentDiagnosticRadar.tsx) so the mock default can no longer leak ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Stopped [`BadgeShelf.tsx`](frontend/src/features/gamification/components/BadgeShelf.tsx) from displaying the illustrative placeholder progress values hard-coded in `BADGE_CATALOG` (e.g. `9/10 questões`, `49/50 acertos`) to every account; badge progress now starts at zero and is fed only from real profile metrics (`level`, `longestStreakDays`) through the new `progressByBadge` prop in [`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(gamification): Normalized the backend `GamificationProfileResponse` (`streakDays`, `dailyGoal.targetQuestions/completedQuestions`, `currentLeague`, integer `streakFreezeAvailable`) into the frontend `GamificationProfileDto` with safe defaults in [`gamification.service.ts`](frontend/src/api/services/gamification.service.ts), fixing the `NaN%`, empty `Recorde: dias` and `/` daily-goal display for freshly created accounts ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(auth): Normalized flat backend `RegisterResponse`, `LoginResponse`, and `UserResponse` payloads (`{ userId, email, fullName, role, emailVerified, token, expiresInSeconds }`) into the frontend `AuthLoginResponse` and `UserProfile` contract, mapped frontend `schoolType` (`PRIVATE_SCHOLARSHIP` / `PRIVATE_REGULAR` $\rightarrow$ `PRIVATE_SCHOOL`) to match the backend `SchoolType` enum, extracted backend `ErrorResponse.message` in [`client.ts`](frontend/src/api/client.ts), and guarded `user?.id` in [`useAuthStore.ts`](frontend/src/stores/useAuthStore.ts) ([`auth.service.ts`](frontend/src/api/services/auth.service.ts), [`types/index.ts`](frontend/src/types/index.ts)) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(ui): Hidden the visible native scrollbar track across modal dialog bodies using `.scrollbar-none` and added a `500ms` sliding segmented tab pill and FLIP height transition between "Termos de Uso" and "Política de Privacidade & LGPD" in [`TermsAndPrivacyModal.tsx`](frontend/src/components/legal/TermsAndPrivacyModal.tsx), as well as `.scrollbar-none` in [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), [`AccessibilityToolbar.tsx`](frontend/src/components/accessibility/AccessibilityToolbar.tsx), [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), and [`TimeAccommodationModal.tsx`](frontend/src/features/practice/components/TimeAccommodationModal.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).

## [0.6.7] - 2026-10-21

### Added
- feat(auth): Implemented a sliding segmented pill indicator (`translate-x-0` $\leftrightarrow$ `translate-x-full`), directional slide/fade form transitions (`.animate-tab-from-left` / `.animate-tab-from-right`), and `ResizeObserver`-driven smooth modal height interpolation when switching between "Criar Conta Gratuita" (`register`) and "Já Possuo Conta" (`login`) in [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), as well as directional tab transitions in [`TermsAndPrivacyModal.tsx`](frontend/src/components/legal/TermsAndPrivacyModal.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- feat(ui): Implemented fluid open and close transition animations (`shouldRender` + `isClosing` lifecycle with `aria-hidden` accessibility guards) across application drawers, modals, lightboxes, accordions, question cards, and buttons ([`index.css`](frontend/src/index.css), [`SocraticTutorDrawer.tsx`](frontend/src/features/practice/components/SocraticTutorDrawer.tsx), [`MobileDrawer.tsx`](frontend/src/components/layout/MobileDrawer.tsx), [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), [`TimeAccommodationModal.tsx`](frontend/src/features/practice/components/TimeAccommodationModal.tsx), [`TimeUpModal.tsx`](frontend/src/features/practice/components/TimeUpModal.tsx), [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), [`TermsAndPrivacyModal.tsx`](frontend/src/components/legal/TermsAndPrivacyModal.tsx), [`AccountErasureModal.tsx`](frontend/src/components/legal/AccountErasureModal.tsx), [`CelebrationOverlay.tsx`](frontend/src/features/gamification/components/CelebrationOverlay.tsx), [`ZoomableImage.tsx`](frontend/src/components/ui/ZoomableImage.tsx), [`AccessibilityToolbar.tsx`](frontend/src/components/accessibility/AccessibilityToolbar.tsx), [`Button.tsx`](frontend/src/components/ui/Button.tsx), [`OptionSelector.tsx`](frontend/src/features/practice/components/OptionSelector.tsx)) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- feat(diagnostic): Implemented deterministic 5-question starter diagnostic blueprints (1 Easy, 3 Medium, 1 Hard progressive difficulty across LC, CH, CN, MT) in [`diagnostic-utils.ts`](frontend/src/features/diagnostic/diagnostic-utils.ts) with `localStorage` persisted seen-questions tracking in [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts) to eliminate repetitive starter question runs ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- feat(practice): Implemented Multi-Year Mixed Simulation ("Simulado Misto") in official exam simulator ([`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), [`completed-exams.ts`](frontend/src/api/mocks/completed-exams.ts), [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx)):
  - Sourced complete authentic 180-question ENEM 2022 dataset with official INEP answer keys and resolutions in [`enem-2022-complete.json`](frontend/src/api/mocks/enem-2022-complete.json).
  - Added dedicated 'Misto' selection option in [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx).
  - Generates authentic 90-question test sessions blending questions across multiple exam editions (2022 and 2023) while strictly preserving INEP's canonical knowledge area question distribution (Day 1: 45 LC + 45 CH; Day 2: 45 CN + 45 MT).
  - Added unit test suite in [`completed-exams.test.ts`](frontend/src/api/mocks/completed-exams.test.ts) and extended component test suites.
- feat(practice): Safe, accessible Markdown formatting and responsive image rendering across question statements, resolutions, and AI tutor interactions ([`TASK-S6-31`](docs/BACKLOG.md#task-s6-31)):
  - **Universal Markdown & Math Parser ([`markdown-parser.tsx`](frontend/src/components/math/markdown-parser.tsx), [`MathRenderer.tsx`](frontend/src/components/math/MathRenderer.tsx))**: Added `renderMarkdown` and `parseInlineMarkdown` parsing bold (`**text**`, `__text__`), italic (`*text*`, `_text_`), combined bold-italic (`***text***`), inline code (` `code` `), external links (`[text](url)`), and images (`![alt](url)`).
  - **KaTeX Delimiter Isolation**: Preserved complete token isolation between KaTeX math formula tokenization (`$...$`, `$$...$$`) and Markdown parsing, ensuring equations like `$y = x \tan(\theta)$` and `$v_0 = 20\text{ m/s}$` render without asterisk or underscore collisions.
  - **Accessible Zoomable Image Primitive ([`ZoomableImage.tsx`](frontend/src/components/ui/ZoomableImage.tsx), [`QuestionImage.tsx`](frontend/src/features/practice/components/QuestionImage.tsx))**: Created `ZoomableImage` primitive supporting animated skeleton pulse during asset loading, graceful error state on broken assets, alt text, and accessible fullscreen lightbox dialog with `Escape` hotkey and body scroll lock. Block images render as full cards with zoom controls; inline images render responsively in text.
  - **Backend DTO Hydration ([`QuestionSummaryDto.java`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/dto/QuestionSummaryDto.java), [`QuestionDtoMapper.java`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/QuestionDtoMapper.java))**: Enriched `QuestionSummaryDto` with `figureUrl` and `figureAltText`, populated directly from `Question` domain entity in `QuestionDtoMapper.toSummaryDto()`.
  - **Unit Test Coverage**: Added test suite in [`markdown-parser.test.tsx`](frontend/src/components/math/markdown-parser.test.tsx) (11 tests covering formatting, block/inline images, safe URLs, and KaTeX integration).

### Changed
- docs(agents): Updated `AGENTS.md` with context-aware test verification (skipping test suites on pure markdown changes), strict Keep a Changelog specifications, synchronized specification paths, and mandatory repository-relative paths prohibiting local username exposure.
- docs(privacy): Purged all absolute machine paths and `file:///` URLs across documentation, changelogs, and configuration files, replacing them with repository-relative paths to prevent environment and username leakage.

### Fixed
- fix(frontend): Resolved `TS7030: Not all code paths return a value` under strict TypeScript `noImplicitReturns` compilation (`tsc && vite build`) by adding explicit `return undefined;` fallback paths to the `shouldRender` animation lifecycle `useEffect` hooks across [`AccessibilityToolbar.tsx`](frontend/src/components/accessibility/AccessibilityToolbar.tsx), [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), [`MobileDrawer.tsx`](frontend/src/components/layout/MobileDrawer.tsx), [`AccountErasureModal.tsx`](frontend/src/components/legal/AccountErasureModal.tsx), [`TermsAndPrivacyModal.tsx`](frontend/src/components/legal/TermsAndPrivacyModal.tsx), [`ZoomableImage.tsx`](frontend/src/components/ui/ZoomableImage.tsx), [`CelebrationOverlay.tsx`](frontend/src/features/gamification/components/CelebrationOverlay.tsx), [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), [`SocraticTutorDrawer.tsx`](frontend/src/features/practice/components/SocraticTutorDrawer.tsx), [`TimeAccommodationModal.tsx`](frontend/src/features/practice/components/TimeAccommodationModal.tsx), and [`TimeUpModal.tsx`](frontend/src/features/practice/components/TimeUpModal.tsx) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(ui): Resolved `position: fixed` viewport clipping and vertical displacement bug on practice modals and drawers by separating pure opacity keyframes (`@keyframes fade-in-only` / `@keyframes fade-out-only` with zero `transform` declarations) from transform keyframes in [`index.css`](frontend/src/index.css) and rendering practice overlays via `createPortal` to `#root` ([`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), [`TimeAccommodationModal.tsx`](frontend/src/features/practice/components/TimeAccommodationModal.tsx), [`TimeUpModal.tsx`](frontend/src/features/practice/components/TimeUpModal.tsx), [`SocraticTutorDrawer.tsx`](frontend/src/features/practice/components/SocraticTutorDrawer.tsx), [`CelebrationOverlay.tsx`](frontend/src/features/gamification/components/CelebrationOverlay.tsx), [`ZoomableImage.tsx`](frontend/src/components/ui/ZoomableImage.tsx)), preventing ancestor section wrappers from establishing CSS transform containing blocks ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(practice): Resolved top margin gap and viewport displacement caused by Tailwind's `.space-y-6` sibling margin injection onto fixed overlays ([`SocraticTutorDrawer.tsx`](frontend/src/features/practice/components/SocraticTutorDrawer.tsx), [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), [`TimeAccommodationModal.tsx`](frontend/src/features/practice/components/TimeAccommodationModal.tsx), [`TimeUpModal.tsx`](frontend/src/features/practice/components/TimeUpModal.tsx), [`CelebrationOverlay.tsx`](frontend/src/features/gamification/components/CelebrationOverlay.tsx)), moving all modals/drawers outside `.space-y-6` in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) and adding explicit `m-0` resets ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).
- fix(practice): Re-architected [`SocraticTutorDrawer.tsx`](frontend/src/features/practice/components/SocraticTutorDrawer.tsx) root container to match `MobileDrawer` (`fixed inset-0 z-50 flex justify-end m-0`), added `{ preventScroll: true }` to textarea focus and bounded `scrollIntoView` behavior to prevent browser window scrolling.
- fix(ui): Prevented header timer widget truncation and squishing on responsive viewports by adding `shrink-0 whitespace-nowrap` to [`QuizTimer.tsx`](frontend/src/features/practice/components/QuizTimer.tsx) and allowing [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) action bar to flex-wrap.
- fix(markdown): Implemented CommonMark § 2.4 unescaping for backslash-escaped numerals and punctuation (`1\.` -> `1.`) in [`markdown-parser.tsx`](frontend/src/components/math/markdown-parser.tsx) and cleaned escaped items in [`mock-data.ts`](frontend/src/api/mocks/mock-data.ts).
- fix(practice): Fixed TypeScript type-only import for `OfficialExamEdition` in [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx) to satisfy `@typescript-eslint/consistent-type-imports` rule and resolve CI ESLint static analysis failure.
- fix(practice): Rendered non-available exam years (2021, 2020, 2019) as disabled options in [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), positioned the 'Misto' option as last, and cleaned badge design with single-line '90 questões' pills.
- fix(ui): Added `whitespace-nowrap shrink-0` to [`Badge.tsx`](frontend/src/components/ui/Badge.tsx) and aligned `Edital INEP` and `Acessibilidade` badges alongside the `Ativo` indicator on the right (`shrink-0`) in [`TimeAccommodationModal.tsx`](frontend/src/features/practice/components/TimeAccommodationModal.tsx) so long option titles wrap cleanly without pushing the badge onto a separate left-aligned row.
- fix(practice): Sanitized external third-party broken image placeholders (`https://enem.dev/broken-image.svg`) across question statements in [`enem-2023-complete.json`](frontend/src/api/mocks/enem-2023-complete.json) and added defensive URL rejection in [`markdown-parser.tsx`](frontend/src/components/math/markdown-parser.tsx) to prevent third-party GitHub PR placeholders or broken assets from rendering.
- fix(ui): Added global `.scrollbar-none` CSS utility in [`index.css`](frontend/src/index.css) and updated [`QuestionCarousel.tsx`](frontend/src/features/practice/components/QuestionCarousel.tsx) with smooth wheel panning and overflow containment, eliminating the native browser horizontal scrollbar track underneath the question palette.
- fix(practice): Restricted "Simular Prova Oficial" modal ([`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx)) to only list completed official exam editions (e.g. ENEM 2023 with full Day 1 and Day 2 test day booklets), excluding incomplete editions with only small sample question sets (2019–2022). Integrated complete authentic ENEM 2023 question bank and INEP official answer keys ([`completed-exams.ts`](frontend/src/api/mocks/completed-exams.ts), [`enem-2023-complete.json`](frontend/src/api/mocks/enem-2023-complete.json)) in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx), displaying real-time question count badges and preventing truncated official simulation runs.
- fix(ui): Added backdrop click-to-dismiss behavior in [`ZoomableImage.tsx`](frontend/src/components/ui/ZoomableImage.tsx), closing the enlarged image lightbox modal whenever clicking outside the image container.
- fix(a11y): Sanitized Markdown images, links, formatting, and raw URLs in Web Speech API audio reader ([`tts-utils.ts`](frontend/src/features/practice/tts-utils.ts)), preventing "Ouvir questão" from reading raw image URLs, Markdown syntax, or UUID filenames out loud, and hardened TypeScript discriminated union checks across `UnifiedQuestion` types.
- fix(ui): Removed private coordinator access link ('Acesso da Coordenação') from the public student LGPD privacy footer in [`RootLayout.tsx`](frontend/src/layouts/RootLayout.tsx), restricting coordination portal access exclusively to authenticated coordinators via role-guarded header and drawer navigation.
- fix(ui): Restricted `Minha Conta` navigation item in [`MobileDrawer.tsx`](frontend/src/components/layout/MobileDrawer.tsx) strictly to authenticated users (`isAuthenticated`), preventing it from appearing in the guest navigation drawer.
- fix(ui): Hidden the desktop keyboard shortcut guide (`Selecione uma alternativa (ou use as teclas A–E)` and `[A–E] Escolher • [Enter] Confirmar • [← / →] Questões • [Espaço] Tutor IA`) on mobile viewports (`hidden md:flex`) in [`QuestionCard.tsx`](frontend/src/features/practice/components/QuestionCard.tsx).
- fix(ui): Centered the LGPD privacy notice and terms link on mobile viewports (`justify-center md:justify-start text-center md:text-left`) in the [`RootLayout.tsx`](frontend/src/layouts/RootLayout.tsx) footer.
- fix(practice): Automatically paused `QuizTimer` (`isPaused`) in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) whenever the Socratic AI Tutor drawer (`isTutorOpen`), configuration modals, or question submission state is active, and included `ENEM_2022_OFFICIAL_RESOLUTIONS` in instant answer grading lookup.
- fix(ui): Implemented CSS `@keyframes enter-animation`, `exit-animation`, and `card-swap-in` in [`index.css`](frontend/src/index.css) with `transform: none` end-state and exit transitions (`animate-out`, `fade-out`, `zoom-out-95`, `slide-out-to-right`, `slide-out-to-bottom-5`) across drawers and modals ([`SocraticTutorDrawer.tsx`](frontend/src/features/practice/components/SocraticTutorDrawer.tsx), [`MobileDrawer.tsx`](frontend/src/components/layout/MobileDrawer.tsx), [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx), [`TimeAccommodationModal.tsx`](frontend/src/features/practice/components/TimeAccommodationModal.tsx), [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx), [`TermsAndPrivacyModal.tsx`](frontend/src/components/legal/TermsAndPrivacyModal.tsx), [`AccessibilityToolbar.tsx`](frontend/src/components/accessibility/AccessibilityToolbar.tsx)), eliminating the `fixed` containing-block clipping bug while adding smooth open and close animations.
- fix(practice): Resolved raw Markdown syntax leakage (`![](url)` raw image tags and `**bold**` asterisks) in question statements.
- fix(practice): Added `shouldRenderHeaderFigure` guard in [`QuestionCard.tsx`](frontend/src/features/practice/components/QuestionCard.tsx) preventing duplicate figures when a question statement embeds images directly at author-intended paragraph positions.
- fix(practice): Replaced raw Unicode symbol `π` with LaTeX math delimiter `$\pi$` in ENEM 2023 item 136 statement to ensure consistent math typesetting and unblock Playwright cross-browser test matrix.
- fix(ci): Resolved Vitest, Cypress E2E, and Playwright cross-browser test regressions following dynamic starter diagnostic blueprint activation ([`PracticeHero.test.tsx`](frontend/src/features/practice/PracticeHero.test.tsx), [`01-student-quiz-journey.cy.ts`](frontend/cypress/e2e/01-student-quiz-journey.cy.ts), [`01-cross-browser-student-flow.spec.ts`](frontend/e2e/01-cross-browser-student-flow.spec.ts)) ([`TASK-S6-33`](docs/BACKLOG.md#task-s6-33)).

### Security
- sec(practice): Enforced strict URL protocol sanitization (`isSafeUrl`) allowing only `https://`, `http://`, `/`, `./`, and `data:image/` while neutralizing `javascript:` XSS vectors in Markdown links and images.

## [0.6.6] - 2026-10-21

### Added
- feat(practice): Added visible `Caderno Azul` exam booklet color badge (`border-sky-500/50 bg-sky-50/60 text-sky-700`) next to the edition badge in [`QuestionCard.tsx`](frontend/src/features/practice/components/QuestionCard.tsx) with updated screen reader announcements to provide clear question numbering context ([`TASK-S6-30`](docs/BACKLOG.md#task-s6-30)).

### Fixed
- fix(practice): Replaced synthetic, placeholder, and truncated test questions across database, ingestion pipeline, and frontend mock fallback with 25 authentic INEP historical questions (2019–2023 Caderno Azul) ([`TASK-S6-30`](docs/BACKLOG.md#task-s6-30)):
  - Sourced complete unabridged statements, figures, 5 alternatives (A to E), official INEP answer keys (gabaritos), official TRI parameters ($a$, $b$, $c$), and step-by-step pedagogical derivations with full distractor analysis in [`historical_questions_sample.json`](backend/ingestion-service/data/historical_questions_sample.json), [`sample_itens_prova_2019_2023.csv`](backend/ingestion-service/data/sample_itens_prova_2019_2023.csv), and [`mock-data.ts`](frontend/src/api/mocks/mock-data.ts).
  - Migrated PostgreSQL `exam_db` via Flyway migration [`V8__authentic_historical_question_catalog.sql`](backend/exam-service/src/main/resources/db/migration/V8__authentic_historical_question_catalog.sql).
- fix(practice): Fixed edition year mapping in [`exam.service.ts`](frontend/src/api/services/exam.service.ts) via `editionYearMap` mapping backend UUIDs directly to official editions (2019–2023), eliminating the bug where questions from prior years displayed as 2023.
- fix(practice): Eliminated `Uncaught Error: Maximum update depth exceeded` infinite render loop in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) by adding `hasUpgradedToLiveRef.current` guard and stabilizing dependencies to `questions.length`.

## [0.6.5] - 2026-10-20

### Added
- feat(practice): Connected frontend practice simulator directly to live backend exam question ingestion catalog and attempts API ([`TASK-S6-29`](docs/BACKLOG.md#task-s6-29)):
  - Connected `PracticeHero.tsx` to `useQuestionsQuery({ size: 100 })` and `useSubmitAnswerMutation()`, fetching real historical ENEM questions directly from PostgreSQL `exam_db` via Gateway `/api/v1/questions` and `/api/v1/sessions`.
  - Implemented DTO normalization in `examService.getQuestions()` and `examService.startSession()` mapping backend fields (`items`, `optionText`, `difficultyLevel`) into standard frontend types with automatic discipline-to-area mapping.
  - Added live attempt submission handling: answer confirmations submit to `POST /api/v1/sessions/{id}/attempts`, receiving official INEP gabaritos, full pedagogical explanations, and key concepts directly from the database.
  - Guarded live query hydration against active user interaction (`selectedAnswers.length === 0 && attempts.length === 0`) in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) to prevent race conditions during student answering.

### Fixed
- fix(math): Normalized pseudo-escaped Brazilian Real currency formats (`$R\$\ 4{,}50$`, `R\$ 12,00`, `R$ 4{,}50`) into clean plain text (`R$ 4,50`) via `sanitizeCurrencyDelimiters()` in [`latex-parser.ts`](frontend/src/components/math/latex-parser.ts), eliminating delimiter collisions and red KaTeX parse crashes. Verified with 11 unit tests in `latex-parser.test.ts`.

## [0.6.4] - 2026-10-20

### Added
- feat(diagnostic): Implemented dynamic non-repeating question selection algorithm for diagnostic recalibration ("Refazer Diagnóstico") ([`TASK-S6-28`](docs/BACKLOG.md#task-s6-28)):
  - Expanded `MOCK_QUESTIONS` from 5 static questions to 20 authentic ENEM items (5 questions per knowledge area: MT, CN, CH, LC) with matching comprehensive pedagogical resolutions in `MOCK_RESOLUTIONS` ([`mock-data.ts`](frontend/src/api/mocks/mock-data.ts)).
  - Implemented `selectDiagnosticQuestions(pool, excludeIds, count)` in [`diagnostic-utils.ts`](frontend/src/features/diagnostic/diagnostic-utils.ts): preserves canonical initial batch on first run, filters candidate questions outside `excludeIds` on recalibration, guarantees balanced area representation, and handles pool exhaustion gracefully.
  - Added `seenDiagnosticQuestionIds` tracking and `recordDiagnosticSeenQuestions` action in [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts).
- feat(auth): Protected student personal features (`Ranking`, `Meu Progresso & Conquistas`, `Ranking da Liga`, and `Diagnóstico`) so unauthenticated visitors cannot view personal metrics or synthetic mock data ([`TASK-S6-23`](docs/BACKLOG.md#task-s6-23)):
  - Restricted public guest navigation in [`Header.tsx`](frontend/src/components/layout/Header.tsx), [`BottomNav.tsx`](frontend/src/components/layout/BottomNav.tsx), and [`MobileDrawer.tsx`](frontend/src/components/layout/MobileDrawer.tsx) strictly to exploratory features (`Início`, `Praticar`).
  - Added accessible Student Login Gates in [`GamificationDashboard.tsx`](frontend/src/features/gamification/components/GamificationDashboard.tsx) and [`DiagnosticDashboard.tsx`](frontend/src/features/diagnostic/components/DiagnosticDashboard.tsx) when navigated directly via deep link, with in-place authentication and registration modal triggers.
  - Added global auth modal state management (`isAuthModalOpen`, `openAuthModal`, `closeAuthModal`) in Zustand [`useAuthStore.ts`](frontend/src/stores/useAuthStore.ts) and wired into `RootLayout.tsx`.
- feat(diagnostic): Implemented initial diagnostic assessment completion, level of understanding determination, and single-take persistence ([`TASK-S6-25`](docs/BACKLOG.md#task-s6-25)):
  - Updated `PracticeHero` to immediately remove QuestionCard and carousel upon completing diagnostic assessment, rendering [`DiagnosticResultView.tsx`](frontend/src/features/diagnostic/components/DiagnosticResultView.tsx) in its place.
  - Implemented `evaluateDiagnosticLevel` and `generateDiagnosticFromSession` in [`diagnostic-utils.ts`](frontend/src/features/diagnostic/diagnostic-utils.ts) computing estimated TRI score (360–860 scale), qualitative proficiency tier (`INICIANTE` to `EXCELENTE`), area radar breakdown vs national baseline, and weak topics.
  - Added single-take diagnostic persistence in [`useSessionStore.ts`](frontend/src/stores/useSessionStore.ts) via `localStorage` (`aprovaenem_diagnostic_completed`, `aprovaenem_diagnostic_report`), preserving completion across browser sessions with explicit `resetDiagnostic()` recalibration.

### Fixed
- fix(practice): Corrected question carousel indicator palette and badge icons in [`QuestionCarousel.tsx`](frontend/src/features/practice/components/QuestionCarousel.tsx) to accurately differentiate between correct answers (emerald green border/background with checkmark badge) and missed/incorrect answers (high-contrast rose/red border with `X` badge overlay and `(Incorreta)` screen reader text) ([`TASK-S6-24`](docs/BACKLOG.md#task-s6-24)).
- fix(ui): Standardized action toolbar button heights and eliminated text wrapping in calibrated diagnostic header bar ([`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx), [`Button.tsx`](frontend/src/components/ui/Button.tsx)) with uniform `h-9` height, `whitespace-nowrap`, and responsive layout adjustments ([`TASK-S6-27`](docs/BACKLOG.md#task-s6-27)).
- fix(ci): Resolved Cypress Interactive E2E Suite failures in CI pipeline ([`TASK-S6-26`](docs/BACKLOG.md#task-s6-26)): added authenticated student state to a11y specs, updated streak text match regex to `/Dias Seguidos|Sequência|Dias Consecutivos/i`, and added `cy.intercept` handlers for gamification endpoints to prevent 401 token invalidation.

## [0.6.3] - 2026-10-19

### Added
- feat(practice): Implemented authentic official ENEM exam simulation mode configurator by year and day of application ([`TASK-S6-20`](docs/BACKLOG.md#task-s6-20)):
  - Built accessible [`ExamSimulationModal.tsx`](frontend/src/features/practice/components/ExamSimulationModal.tsx) with WAI-ARIA modal semantics, focus trapping, Escape dismissal, and official edition selection (2019–2023).
  - Partitioned exams strictly by official INEP test days: Dia 1 (LC + CH) and Dia 2 (CN + MT), with timing modes (*Ritmo Oficial INEP* 3 min/question vs *Treino Livre*).
  - Added *"Simular Prova Oficial"* action button on practice control bar and dynamic session generator `handleStartCustomSimulation` in `PracticeHero.tsx`.
- feat(gamification): Re-architected badge shelf progression with dynamic tier ranks and authentic one-time milestone achievement cards ([`TASK-S6-21`](docs/BACKLOG.md#task-s6-21)):
  - Equipped 17 skill, volume, streak, and AI tracks with 4-tier progressive rankings (Bronze, Silver, Gold, Diamond), conquered tier retention, and automatic successor tier spawning (`computeVisibleBadges` in [`gamification-utils.ts`](frontend/src/features/gamification/gamification-utils.ts)).
  - Configured authentic one-time milestone achievements (`isProgressive: false`) for `DIAGNOSTICO_COMPLETO`, `PRIMEIRA_QUESTAO`, `GABARITO_PERFEITO`, `PODIO_LIGA`, and `TUTOR_SOCRATICO`.
  - Realigned categories: `DIAGNOSTICO_COMPLETO` to Jornada & Volume, `PODIO_LIGA` to Desafios & Precisão, and focused Especiais & IA strictly on Socratic AI interactions (`REVISAO_SOCRATICA`, `DIALOGO_SOCRATICO`, `EUREKA_SOCRATICO`).
  - Distinct metallic visual styling with crisp Lucide vector icons (`Medal`, `Crown`, `Gem`), replacing emojis across all badges ([`BadgeShelf.tsx`](frontend/src/features/gamification/components/BadgeShelf.tsx)).
- feat(gamification): Expanded achievements into an authentic 20-badge mission catalog with live dual-tone progress bars and category pill filtering ([`TASK-S6-19`](docs/BACKLOG.md#task-s6-19)).

### Changed
- feat(institutional): Segregated institutional and pedagogical coordination cohort diagnostics completely out of student views into dedicated coordinator portal ([`TASK-S6-22`](docs/BACKLOG.md#task-s6-22)):
  - Created [`InstitutionalDashboard.tsx`](frontend/src/features/institutional/components/InstitutionalDashboard.tsx) with strict RBAC: unauthenticated security gate with in-place login, student 403 Forbidden screen, and authorized coordinator view with zero data leakage.
  - Redesigned header to strictly display `PAINEL DA COORDENAÇÃO` in subtle indigo when in institutional mode, purged leaked cohort links from unauthenticated gates, and eliminated B2B White-Label jargon across the coordinator workspace.

### Fixed
- fix(practice): Fixed browser clipboard copy interception in [`OptionSelector.tsx`](frontend/src/features/practice/components/OptionSelector.tsx) and [`QuestionCard.tsx`](frontend/src/features/practice/components/QuestionCard.tsx) by guarding hotkey listeners with `if (e.ctrlKey || e.metaKey || e.altKey) return;`, restoring native `Ctrl+C` and `Cmd+C` clipboard copying ([`TASK-S6-20`](docs/BACKLOG.md#task-s6-20)).

## [0.6.2] - 2026-10-18

### Fixed
- fix(ci): Resolved all automated GitHub Actions CI pipeline failures across frontend linter, Cypress E2E, and Playwright matrix ([`TASK-S6-16`](docs/BACKLOG.md#task-s6-16)):
  - Fixed ESLint zero-warning gates in `Select.test.tsx` (type-only import) and `TimeUpModal.tsx` (`useCallback` dependency).
  - Implemented URL deep linking (`?section=practice`, `leaderboard`, `diagnostics`) with bidirectional browser history synchronization (`pushState` and `popstate`) in [`App.tsx`](frontend/src/App.tsx).
  - Fixed WCAG 2.1 SC 2.5.3 (Label in Name) axe-core violations by removing redundant `aria-label` from Header logo button and front-loading visible text in `QuestionCard.tsx` and `InstitutionalCohortView.tsx`.
- fix(gamification): Resolved celebration modal confetti animation, level title synchronization, and XP progress calculation bugs ([`TASK-S6-17`](docs/BACKLOG.md#task-s6-17)):
  - Replaced broken `top-0 animate-bounce` vibration with `@keyframes confetti-fall` and `.animate-confetti` in [`CelebrationOverlay.tsx`](frontend/src/features/gamification/components/CelebrationOverlay.tsx) and `index.css`.
  - Synchronized `MOCK_GAMIFICATION_PROFILE.levelTitle` to `"Calouro Iniciante"` and updated `currentXp` to 450 XP for Level 3, eliminating progress mathematical contradictions.
  - Eliminated duplicate progression titles in `LevelProgressBar.tsx` and connected celebration CTA to study flow.
- fix(gamification): Enforced division ranking privacy and accurate zone status mathematical thresholds in [`WeeklyLeagueLeaderboard.tsx`](frontend/src/features/gamification/components/WeeklyLeagueLeaderboard.tsx) and [`leaderboard-utils.ts`](frontend/src/features/gamification/leaderboard-utils.ts) ([`TASK-S6-18`](docs/BACKLOG.md#task-s6-18)):
  - Restricted participant tables strictly to student's active division (`userLeague`), preventing browsing of other divisions.
  - Refined zone thresholds: Top 20% `Classificado` (ranks 1-2), Middle 70% `Na Disputa`, Bottom 10% `Reforço` (rank 10). Replaced punitive terms with encouraging SISU/Academic classifications.
  - Replaced bulky clickable tabs with a minimalist horizontal progression track (*"Jornada das Ligas"*) with mystery next league (`???`).

## [0.6.1] - 2026-10-17

### Security
- sec(auth): Implemented JAM 2 Security Audit Tier 1 Critical Hotfixes ([`TASK-S6-10`](docs/BACKLOG.md#task-s6-10), [`jam2-fullstack-security-audit.md`](docs/audit/jam2-fullstack-security-audit.md)):
  - Active Socratic AI prompt injection guardrail (`DIRECT_ANSWER_REQUEST_PATTERN`) and post-generation answer key spoiler filter (`ANSWER_SPOILER_PATTERN`) in [`GeminiTutorClientAdapter.java`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/out/ai/GeminiTutorClientAdapter.java) (`VULN-JAM2-01`).
  - Production sourcemap elimination in `frontend/vite.config.ts` (`sourcemap: false`) preventing 4.5+ MB of TypeScript source disclosure (`VULN-JAM2-02`).
  - Spring Cloud Gateway wildcard CORS subdomain pattern matching (`allowedOriginPatterns`) in BFF `application.yml` (`VULN-JAM2-03`).
  - Student UI sign-out ("Sair") button in `Header.tsx` and `MobileDrawer.tsx` purging auth credentials, anonymous session, and query cache (`VULN-JAM2-04 & VULN-JAM2-05`).
  - Hardened Nginx CSP header with VLibras integration and removed deprecated `X-XSS-Protection` (`VULN-JAM2-07 & VULN-JAM2-15`).
- sec(tutor): Implemented JAM 2 Security Audit Tier 2 Quality Hardening ([`TASK-S6-11`](docs/BACKLOG.md#task-s6-11)):
  - Socratic textarea input bounding (`maxLength={1000}`) with live character indicator and payload truncation in [`SocraticTutorDrawer.tsx`](frontend/src/features/practice/components/SocraticTutorDrawer.tsx) (`VULN-JAM2-18`).
  - Explicit defensive security parameters (`trust: false`, `maxSize: 25`, `maxExpand: 100`) in `InlineMath.tsx` and `BlockMath.tsx` preventing href injection (`VULN-JAM2-23`).
  - Accessibility store persistence mutation test coverage in `useAccessibilityStore.test.ts` asserting `localStorage.setItem` calls (`VULN-JAM2-11 / AUD-JAM2-T01`).

### Changed
- feat(practice): Transformed disruptive exam-stopping modal into non-blocking question pacing alert in [`TimeUpModal.tsx`](frontend/src/features/practice/components/TimeUpModal.tsx) with prominent `"Continuar Respondendo"` action and untimed mode switch ([`TASK-S6-12`](docs/BACKLOG.md#task-s6-12)).
- feat(ui): Standardized enterprise flat design system across gamification, diagnostic, and landing pages: eliminated multi-color gradients in favor of flat white cards and solid semantic color tints in `GamificationDashboard.tsx`, `LevelProgressBar.tsx`, `DailyStreakCounter.tsx`, `BadgeShelf.tsx`, `CelebrationOverlay.tsx`, and `LandingPage.tsx` ([`TASK-S6-15`](docs/BACKLOG.md#task-s6-15)).
- feat(ui): Built WCAG 2.1 AA compliant custom `Select` dropdown component ([`Select.tsx`](frontend/src/components/ui/Select.tsx)) with ARIA combobox pattern, keyboard navigation, and hidden `<select>` for form/test compatibility, replacing native selects across registration, accessibility toolbar, and cohort views ([`TASK-S6-13`](docs/BACKLOG.md#task-s6-13)).
- feat(theme): Optimized dynamic contrast algorithm in [`color-contrast.ts`](frontend/src/tenants/color-contrast.ts) to prioritize pure white text on vibrant brand surfaces ($\ge 3.5:1$, Sky-600 `#0284c7`), restoring white typography on primary buttons, pills, and hero badges ([`TASK-S6-14`](docs/BACKLOG.md#task-s6-14)).
- feat(home): Created dedicated White-Label Home Landing Page ([`LandingPage.tsx`](frontend/src/features/home/LandingPage.tsx)) and distraction-free exam simulator in `PracticeHero.tsx` ([`TASK-S6-12`](docs/BACKLOG.md#task-s6-12)).
- feat(whitelabel): Enriched B2B multi-tenant architecture with full design manual tokens, SVG logos, partner typography, and distinct corner radii across all 5 partner organizations ([`presets.ts`](frontend/src/tenants/presets.ts), [`default.ts`](frontend/src/tenants/default.ts)) ([`TASK-S6-12`](docs/BACKLOG.md#task-s6-12)).
- feat(practice): Unified exam button labels to action-oriented `"Tirar Dúvida (IA)"` across timer bar, question card, and feedback banner ([`TASK-S6-12`](docs/BACKLOG.md#task-s6-12)).

### Fixed
- fix(practice): Added horizontal keyboard shortcuts (`ArrowLeft`/`ArrowRight`, `PageUp`/`PageDown`, `[`/`]`) for question traversal in [`PracticeHero.tsx`](frontend/src/features/practice/PracticeHero.tsx) ([`TASK-S6-12`](docs/BACKLOG.md#task-s6-12)).
- fix(legal): Restricted LGPD Art. 18 data subject rights to authenticated sessions and purged unowned privacy email ([`TASK-S6-12`](docs/BACKLOG.md#task-s6-12), [`TASK-S6-14`](docs/BACKLOG.md#task-s6-14)).
- fix(legal): Purged unowned placeholder privacy email (`privacidade@aprovaenem.org.br`) in favor of automated in-app self-service rights copy ([`TASK-S6-14`](docs/BACKLOG.md#task-s6-14)).
- fix(header): Removed internal `Sessão Anônima: anon-4cb52...` technical string from application header ([`TASK-S6-12`](docs/BACKLOG.md#task-s6-12)).
- fix(auth): Enhanced contrast and visibility of the active mode tab switch in [`RegisterModal.tsx`](frontend/src/components/auth/RegisterModal.tsx) ([`TASK-S6-14`](docs/BACKLOG.md#task-s6-14)).

## [0.6.0] - 2026-10-17

### Added
- feat(testing): Comprehensive Vitest & React Testing Library component testing suite with automated Axe-Core WCAG 2.1 Level AA accessibility audit (410 tests passing across 67 suites, 96.39% line coverage) ([`TASK-S6-01`](docs/BACKLOG.md#task-s6-01)).
- feat(testing): Cypress interactive student journey, multi-tenant white-label, Socratic AI tutor, and WCAG accessibility E2E testing suite (20 tests passing across 5 specs) ([`TASK-S6-02`](docs/BACKLOG.md#task-s6-02)).
- feat(testing): Playwright cross-browser, mobile emulation (Pixel 5, iPhone 13), and Axe-Core accessibility audit matrix across Chromium, Firefox, and WebKit (100 tests passing across 5 projects) ([`TASK-S6-03`](docs/BACKLOG.md#task-s6-03)).
- feat(infrastructure): Production multi-stage Nginx container build packaging React SPA into hardened `nginx:1.27-alpine` with wildcard multi-tenant ingress, immutable asset caching, and SPA fallback routing ([`TASK-S6-04`](docs/BACKLOG.md#task-s6-04)).
- feat(legal): Legal compliance, plain-Portuguese Terms of Use and LGPD Student Privacy Portal with interactive data portability export (Art. 18, V) and self-service account erasure modal (Art. 18, VI) ([`TASK-S6-09`](docs/BACKLOG.md#task-s6-09)).
- ci(pipeline): Full-stack GitHub Actions CI workflow pipeline update enforcing quality gates across backend, frontend, E2E, and ingestion services.

### Security
- sec(audit): Multi-stage full-stack security and test suite integrity master synthesis audit ([`TASK-S6-06`](docs/BACKLOG.md#task-s6-06)): Client Threat Model, Automated SAST/SCA Container scan, Runtime Pentesting, Test Quality & Mutation Resilience audit, and publication-grade formal attestation report ([`jam2-fullstack-security-audit.md`](docs/audit/jam2-fullstack-security-audit.md)).

## [0.5.1] - 2026-10-16

### Added
- feat(practice): Interactive Question Card & Timed Quiz Mode with dynamic KaTeX LaTeX notation, WebP diagrams with lightbox zoom modal, semantic option selector (A–E), countdown/elapsed quiz timer, and question navigation carousel ([`TASK-S5-01`](docs/BACKLOG.md#task-s5-01)).
- feat(practice): Instant Feedback Banner & Step-by-Step Resolution Accordion with immediate correctness indication, curated INEP resolution accordion, and 5-alternative distractor fallacy breakdown ([`TASK-S5-02`](docs/BACKLOG.md#task-s5-02)).
- feat(tutor): Socratic AI Tutor per-question slide-out chat drawer bound per question with Google Gemini 1.5 Flash conceptual hints, turn counter widget (up to 6 turns), midnight BRT quota reset, and thread reset engine ([`TASK-S5-03`](docs/BACKLOG.md#task-s5-03)).
- feat(gamification): Student gamification dashboard with dynamic level progression bar (200 XP/level), daily streak counter with emergency freeze shield, 9-badge shelf grid, and celebratory level-up confetti overlay ([`TASK-S5-04`](docs/BACKLOG.md#task-s5-04)).
- feat(leaderboard): Weekly league leaderboard UI displaying ranked participant tables across Bronze, Silver, Gold, Diamond tiers, live Sunday 23:59:59 BRT countdown, and top 20% promotion / bottom 10% relegation zones ([`TASK-S5-05`](docs/BACKLOG.md#task-s5-05)).
- feat(diagnostic): Interactive student-facing ENEM diagnostic skill radar (Recharts spider chart mapping MT, CN, CH, LC against 70% target and 60% baseline) and B2B institutional cohort analytics view ([`TASK-S5-06`](docs/BACKLOG.md#task-s5-06)).
- feat(accessibility): Universal accessibility baseline: Web Speech API TTS ("Ouvir Questão") with natural Portuguese math translation, comprehensive keyboard hotkeys & cheat sheet, live ARIA status announcements, and INEP time accommodations (`STANDARD`, `EXTENDED_INEP`, `UNTIMED`) ([`TASK-S5-07`](docs/BACKLOG.md#task-s5-07)).

## [0.5.0] - 2026-10-14

### Added
- feat(frontend): Initialized React 18, TypeScript, and Vite 5 SPA workspace with white-label multi-tenant architecture ([`TASK-S4-01`](docs/BACKLOG.md#task-s4-01)).
- feat(theming): Implemented Tailwind CSS White-Label Dynamic Theming & Token Engine with CSS Custom Properties runtime token engine (`applyTenantTheme`), mathematical color luminance & contrast engine (`color-contrast.ts`), and OpenDyslexic typography ([`TASK-S4-02`](docs/BACKLOG.md#task-s4-02)).
- feat(api): Implemented Multi-Tenant API Client SDK & TanStack Query Integration with 5 service modules (`examService`, `tutorService`, `gamificationService`, `tenantService`, `authService`) and offline mock fixtures ([`TASK-S4-03`](docs/BACKLOG.md#task-s4-03)).
- feat(tenant): Implemented 4-tier Hierarchical Tenant Context Resolver (`resolver.ts`), zero-FOUC LocalStorage caching, and comprehensive student session state machine in Zustand ([`TASK-S4-04`](docs/BACKLOG.md#task-s4-04)).
- feat(math): Implemented KaTeX & LaTeX Formula Rendering Engine with Brazilian Currency Protection, `<InlineMath />`, `<BlockMath />`, and universal `<MathRenderer />` ([`TASK-S4-05`](docs/BACKLOG.md#task-s4-05)).
- feat(layout): Implemented Responsive Layout Shell, mobile-first `<Header />`, sticky `<BottomNav />` with thumb-friendly touch targets, and accessible `<MobileDrawer />` ([`TASK-S4-06`](docs/BACKLOG.md#task-s4-06)).
- feat(accessibility): Implemented Universal Accessibility Baseline, floating toolbar (`<AccessibilityToolbar />`), 5 zoom levels, OpenDyslexic font, Daltonism filters (`<ColorBlindFilters />`), `<ReadingRuler />`, and official VLibras 3D avatar integration ([`TASK-S4-07`](docs/BACKLOG.md#task-s4-07)).
- feat(auth): Implemented Student Registration Terms of Use & LGPD Consent Modal (`<TermsAndPrivacyModal />`, `<RegisterModal />`) with privacy disclosures and mandatory consent ([`TASK-S4-08`](docs/BACKLOG.md#task-s4-08)).

### Fixed
- fix(ci): Resolved PMD `UnusedPrivateMethod` false-positive under multi-threaded reactor execution in `GlobalExceptionHandler` across `exam-service` and `auth-service`.


## [0.4.0] - 2026-10-07
### Added
- feat(docs): Transitioned frontend architecture and platform business strategy to a **White-Label B2B Multi-Tenant Engine** across all technical specifications, backlog, and root project documentation:
  - **`docs/specifications/01-business-and-market-strategy.md`**:
    - Expanded Business Model Canvas to incorporate B2B SaaS licensing for private school networks (*redes de ensino*), municipal and state education departments (*Secretarias de Educação*), and prep course franchises.
    - Added B2B Institutional Persona: *Dr. Roberto Mendes (Academic Vice-President / School Network Director)*.
    - Updated Value Proposition Canvas with Institutional Tenant Profile and defined B2B KPIs (Tenant onboarding $< 10\text{min}$, cohort diagnostic utilization, NRR).
  - **`docs/specifications/02-project-charter.md`**:
    - Added **Module 8: White-Label Multi-Tenant Frontend & Institutional Management** (`FR-27` Dynamic Theme Injection, `FR-28` Multi-Tenant Domain Routing, `FR-29` Ingress & Gateway Header Propagation, `FR-30` Institutional Cohort Dashboards, `FR-31` Tenant Isolation & Data Governance).
    - Added `NFR-08` White-Label Theming Performance (sub-50ms theme hydration, zero FOUC/FOIC).
    - Updated JAM 2 Scope Boundaries to formalize the single-build white-label client engine.
  - **`docs/specifications/03-system-architecture.md`**:
    - Added **Section 10: White-Label Multi-Tenant Frontend Architecture (B2B Engine)** with comprehensive sequence diagram, runtime CSS Custom Properties token design system (`--brand-primary`, `--brand-secondary`, etc.), 4-tier domain resolution pipeline (CNAME, Subdomain, Path, Default), dynamic Gateway CORS origin whitelisting in Redis, and `X-Tenant-Id` header propagation.
  - **`docs/specifications/05-api-specification.md`**:
    - Added `X-Tenant-Id` header to global request headers and CORS allowed headers.
    - Added **Section 11: White-Label Multi-Tenant Branding & Institutional Endpoints** (`GET /api/v1/tenants/branding`, `GET /api/v1/tenants/{tenantId}/branding`, `GET /api/v1/institutional/cohorts/{cohortId}/diagnostics`).
  - **`docs/BACKLOG.md`**:
    - Refined Sprint 4 (`S4-01` to `S4-04`), Sprint 5 (`S5-06`), and Sprint 6 (`S6-01`, `S6-04`, `S6-05`, `S6-07`) task descriptions, deliverables, and acceptance criteria to reflect the White-Label Design Token engine, tenant resolver, and institutional diagnostic views.
  - **`README.md`**:
    - Updated Overview and Features with the White-Label B2B Institutional Engine.
    - Added white-label dynamic token architecture to Frontend Tech Stack and updated Core API Routes summary with tenant branding endpoints.

## [0.3.21] - 2026-09-25
### Changed
- chore(domain): Purged all premature production domain references (`https://aprovaenem.com.br`) across configurations, documentation, and error responses:
  - **`docker-compose.yml`**, **`.env`**, **`.env.example`**: Removed `https://aprovaenem.com.br` from default and active `CORS_ALLOWED_ORIGINS` whitelists.
  - **`backend/frontend-api`**: Updated `allowedOrigins` in [`application.yml`](backend/frontend-api/src/main/resources/application.yml) to restrict origins to local developer frontends (`http://localhost:3000`, `http://localhost:5173`, `http://localhost:80`, `http://localhost`).
  - **`backend/exam-service`**: Switched Socratic AI Tutor error redirects (`signupUrl`, `upgradeUrl`) in [`GlobalExceptionHandler.java`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/GlobalExceptionHandler.java) and [`SocraticTutorControllerWebMvcTest.java`](backend/exam-service/src/test/java/com/aprovaenem/exam/infrastructure/adapter/in/web/SocraticTutorControllerWebMvcTest.java) from absolute domain URLs to relative application paths (`/register`, `/pro`).
  - **Documentation & Specifications**: Cleaned up ingress diagrams, CORS specifications, and API examples in [`README.md`](README.md), [`03-system-architecture.md`](docs/specifications/03-system-architecture.md), [`05-api-specification.md`](docs/specifications/05-api-specification.md), [`phase3-automated-security-scans.md`](docs/audit/phase3-automated-security-scans.md), and [`phase4-runtime-penetration-testing.md`](docs/audit/phase4-runtime-penetration-testing.md).

## [0.3.20] - 2026-09-23
### Added
- feat(exam): Bulk ingested, verified, and reconciled representative historical ENEM question catalog (TASK-S3-13):
  - **`backend/ingestion-service`**:
    - Aligned `SubjectAreaEnum` with database values (`MATHEMATICS`, `NATURAL_SCIENCES`, `HUMANITIES`, `LANGUAGES`).
    - Added defensive negative lookbehind (`(?<!R)(?<!US)`) to `validate_latex` in `validator.py` to prevent Brazilian currency `R$` from falsely triggering unbalanced LaTeX delimiter errors.
    - Updated `generator.py` to produce idempotent PostgreSQL `DO $$` blocks matching the actual `exam_db` schema (`exam_editions`, `topics`, `questions`, `question_options`, `question_resolutions`).
    - Added sample INEP microdados dataset [`sample_itens_prova_2019_2023.csv`](backend/ingestion-service/data/sample_itens_prova_2019_2023.csv) and historical catalog dataset [`historical_questions_sample.json`](backend/ingestion-service/data/historical_questions_sample.json) containing 25 verified questions (5 per edition across 2019–2023, 10 disciplines, 5 options A–E, KaTeX formulas, and pedagogical resolutions).
    - Generated 5 lossless 300 DPI WebP visual diagram assets in [`extracted_assets/`](backend/ingestion-service/extracted_assets/) and mounted to `exam-assets-data` volume (`/assets/questions/`), served via Nginx with immutable 1-year cache headers and full security headers.
    - Implemented unit and batch integration test [`test_batch_historical_ingestion.py`](backend/ingestion-service/tests/test_batch_historical_ingestion.py) verifying 100% concordance against official INEP gabaritos and TRI parameter ranges.
  - **`backend/exam-service`**:
    - Created Flyway migration [`V7__historical_question_catalog_seed.sql`](backend/exam-service/src/main/resources/db/migration/V7__historical_question_catalog_seed.sql) seeding 25 reconciled historical questions with TRI psychometric parameters ($a, b, c$) and competency skills ($H_1$–$H_{30}$).
    - Updated [`ExamPersistenceIT.java`](backend/exam-service/src/test/java/com/aprovaenem/exam/infrastructure/adapter/out/persistence/ExamPersistenceIT.java) with `shouldRetrieveHistoricalQuestionsFromCatalogV7()` asserting catalog queries across all 5 historical editions in real PostgreSQL 16 pgvector Testcontainer.
  - **Verification & Testing**:
    - Pytest suite: **11/11 tests passing** in 0.19s.
    - Testcontainers integration tests: **5/5 tests passing** in 37.07s.
    - Static analysis: **0 Checkstyle violations, 0 PMD violations** across all modules.
    - Automated pre-flight smoke suite: **7/7 probes passed** in 0.77s (total catalog active: 30 questions).
    - Automated Postman Newman contract suite: **42/42 requests, 75/75 assertions passed** with zero failures in 12.4s.
### Changed
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-13` as `DONE ✅`, updating the Mermaid Gantt roadmap (`S3-13` and `S3-16` marked done), and updating the `Milestone & Sprint Status Summary` to **18/18 completed (100% COMPLETED ✅)**.
### Fixed
- fix(ci): Calibrated Grafana k6 performance smoke verification, hardened Docker pull, and parallelized CI pipeline:
  - **`tests/stress/catalog-browse-load.js`**: Differentiated `IS_CI_FAST` stages (2 to 15 VUs over 25s) and calibrated smoke thresholds (`p(95) < 500ms`, `p(99) < 1000ms`, single question `p(95) < 300ms`) from full 1,000 VU production stress runs, eliminating false-positive threshold exits caused by CPU scheduling contention on shared 2-vCPU GitHub Actions runners. Verified 100% green pass locally in 25.4s (P95 latency: 35.84ms, 0 errors across 1,457 requests).
  - **`.github/workflows/ci.yml`**:
    - Decoupled `e2e-smoke-and-contracts` from `backend-quality-gate` by removing sequential `needs` blocking, allowing backend unit/static analysis and full Docker ecosystem contract/smoke testing to execute completely concurrently across independent GitHub runners.
    - Enabled parallel Docker container compilation via `DOCKER_BUILDKIT=1 docker compose build --parallel`.
    - Accelerated Maven multi-module compilation and testing with multi-core `-T 1C` thread allocation.
    - Added automated retry loops to `docker compose pull` to defend against transient Docker Hub "connection reset by peer" drops.
    - Optimized Newman CLI installation with `--no-audit --no-fund`.

## [0.3.19] - 2026-09-23
### Changed
- docs(backlog): Updated `docs/BACKLOG.md` marking `TASK-S3-16` as `DONE ✅`, advancing Sprint 3 completion to 94.4% (17/18 tasks completed).
### Security
- fix(security): Implemented supply chain BOM alignment, ingress proxy hardening, and container resource limits (TASK-S3-16):
  - **`backend/pom.xml`**:
    - Upgraded parent Spring Boot version from `3.3.3` to `3.3.11`.
    - Pinned `<tomcat.version>10.1.35</tomcat.version>` and `<netty.version>4.1.118.Final</netty.version>` to patch critical runtime CVEs in embedded web server components (Tomcat RCE `CVE-2025-24813`, Netty SNI bypass `CVE-2026-75595`, Spring Security 72-byte limit enforcement `CVE-2025-22228`).
  - **`backend/auth-service`**:
    - Defensively safeguarded legacy BCrypt password matching in [`BCryptPasswordEncoderAdapter`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/out/security/BCryptPasswordEncoderAdapter.java) against `IllegalArgumentException` thrown on inputs exceeding 72 bytes in Spring Security 6.3.8+.
    - Updated [`BCryptPasswordEncoderAdapterTest`](backend/auth-service/src/test/java/com/aprovaenem/auth/infrastructure/adapter/out/security/BCryptPasswordEncoderAdapterTest.java) to assert raw BCrypt rejection of $>72$ byte inputs while verifying that the HMAC-SHA256 peppered encoder processes arbitrary password lengths without collision.
  - **`backend/exam-service`**:
    - Clamped maximum page size to `MAX_PAGE_SIZE = 50` on [`QuestionFilterCommand`](backend/exam-service/src/main/java/com/aprovaenem/exam/domain/model/QuestionFilterCommand.java) to eliminate heap exhaustion / OOM denial-of-service risks via excessive `size` query parameters.
    - Updated [`DomainCommandsAndModelsTest`](backend/exam-service/src/test/java/com/aprovaenem/exam/domain/model/DomainCommandsAndModelsTest.java) to assert clamping behavior on oversized pagination queries.
  - **`backend/ingestion-service`**:
    - Hardened [`Dockerfile`](backend/ingestion-service/Dockerfile) by adding unprivileged non-root user `appuser:appuser` (`uid=1000`) and dropping root privileges at runtime.
  - **`infrastructure/nginx/nginx.conf`**:
    - Added `server_tokens off;` to suppress Nginx version banners and server information leakage.
    - Explicitly restored security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`) inside `location /assets/questions/` to prevent Nginx child block header inheritance dropping.
  - **`docker-compose.yml`**:
    - Upgraded `nginx-proxy` image from `nginx:1.25-alpine` to `nginx:1.27-alpine` (Alpine 3.20+ with patched `musl` and `libexpat`).
    - Removed obsolete `version: '3.8'` tag to align with Compose Specification v2.
    - Added explicit CPU and memory resource constraints (`deploy.resources.limits`) across all 14 container definitions to safeguard host memory against container exhaustion.
  - **Verification & Testing**:
    - Maven clean compile and unit test suite verified: **100% green pass rate** across all 6 modules.
    - Static analysis verified: **0 Checkstyle violations, 0 PMD violations** across all 6 modules.
    - Automated pre-flight smoke suite verified: **7/7 probes passed** in 657ms.
    - Automated Postman Newman contract suite verified: **42/42 requests, 75/75 assertions passed** with zero failures in 14.0s.

## [0.3.18] - 2026-09-23
### Changed
- docs(backlog): Updated `docs/BACKLOG.md` marking `TASK-S3-15` as `DONE ✅`, advancing Sprint 3 completion to 88.9% (16/18 tasks completed).
### Security
- fix(security): Remediated critical security vulnerabilities, architectural flaws, and test integrity gaps identified during the multi-stage security audit (TASK-S3-15):
  - **`common-core`**:
    - Created [`AccessDeniedException`](backend/common-core/src/main/java/com/aprovaenem/common/exception/AccessDeniedException.java) representing RFC 7807 403 Forbidden domain access denial; installed into local repository with unit test coverage.
  - **`exam-service`**:
    - **BOLA Remediation (`PracticeSessionController`)**: Enforced principal ownership validation on all session interaction endpoints (`GET /api/v1/sessions/{id}`, `POST /api/v1/sessions/{id}/attempts`, `POST /api/v1/sessions/{id}/complete`, `GET /api/v1/sessions/{id}/diagnostic`). Rejects cross-student access with HTTP 403 Forbidden (`AccessDeniedException`).
    - **Session Creation Spoofing Fix**: Resolved student `userId` strictly from verified JWT Bearer claims (or generated a guest `anonymousSessionId`), actively ignoring untrusted `userId` passed in request payloads.
    - **Cyclomatic Complexity Decomposition**: Decomposed `startSession` into clean private helpers (`resolveUserIdFromToken`, `resolveSessionId`, `buildStartSessionCommand`), dropping cyclomatic complexity from 15 to $\le 5$ and cleanly satisfying PMD.
    - **BFLA Remediation (`QuestionCatalogController`)**: Enforced administrator authorization (`ROLE_ADMIN`) on `PATCH /api/v1/questions/{id}/status`, rejecting student and unauthenticated requests with HTTP 403 Forbidden.
    - **RFC 7807 Error Handling**: Added `handleAccessDeniedException` to [`GlobalExceptionHandler`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/web/GlobalExceptionHandler.java) mapping to HTTP 403 Forbidden Problem Detail.
    - **Test Suite Authenticity**: Added explicit verification assertion (`verify(threadRepository, never()).save(any())`) to `TutorChatRepositoryAdapterTest` eliminating zero-assertion smells.
  - **`auth-service`**:
    - **Double-BCrypt Overhead Elimination**: Introduced [`PasswordVerificationResult`](backend/auth-service/src/main/java/com/aprovaenem/auth/domain/model/PasswordVerificationResult.java) and refactored [`BCryptPasswordEncoderAdapter`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/out/security/BCryptPasswordEncoderAdapter.java) to single-pass verification. Eliminated 50% CPU overhead and timing side-channels while preserving dual backward-compatibility and automatic pepper re-hashing.
    - **Fail-Fast Pepper Startup Check**: Added `@PostConstruct validatePepper()` in `BCryptPasswordEncoderAdapter` to halt application startup if `auth.password-pepper` is unset in non-test profiles, preventing silent unpeppered deployments.
    - **Downstream `X-User-Id` Trust Elimination**: Removed unauthenticated `X-User-Id` header fallback in [`GamificationController`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/in/web/GamificationController.java), relying strictly on authenticated `userDetails`.
    - **Seed Passwords**: Added Flyway migration [`V4__fix_seed_passwords.sql`](backend/auth-service/src/main/resources/db/migration/V4__fix_seed_passwords.sql) resetting placeholder hashes for `student@aprovaenem.com.br` and `admin@aprovaenem.com.br` to valid BCrypt hashes for `Password123!`.
    - **Test Suite Assertion Fix**: Added explicit `assertDoesNotThrow` and `verify(rabbitTemplate).convertAndSend(...)` to `RabbitMQNotificationPublisherAdapterTest`.
  - **`notification-service`**:
    - **Downstream `X-User-Id` Trust Elimination**: Removed unauthenticated `X-User-Id` header fallback in [`NotificationController`](backend/notification-service/src/main/java/com/aprovaenem/notification/infrastructure/adapter/in/web/NotificationController.java), strictly requiring verified JWT Bearer token resolution.
  - **`docker-compose.yml`**:
    - Injected missing `JWT_SECRET=${JWT_SECRET}` into `exam-service` environment, aligning signature verification with `auth-service` and `frontend-api`.
  - **Postman Newman Suite**:
    - Expanded [`AprovaENEM.postman_collection.json`](docs/postman/AprovaENEM.postman_collection.json) to 42 requests and 75 assertions (100% green pass rate) achieving 100% route coverage across all microservices and asserting critical negative and security scenarios:
      - Added missing endpoints: `POST /api/v1/auth/resend-verification` (200 OK), `POST /api/v1/auth/verify-email` (400 Bad Request on invalid/expired token), `GET /api/v1/questions?discipline=...` (200 OK catalog filter), and `PATCH /api/v1/notifications/{id}/read` (200 OK mark notification read).
      - Added automated security & negative assertions: BOLA access denial on practice sessions without ownership (403 Forbidden), BFLA access denial on question status updates when requested by student principal (403 Forbidden), bad login credentials (400 Bad Request), duplicate student registration (400 Bad Request), malformed registration payload (400 Bad Request), and daily Socratic AI consultation quota exhaustion (429 Too Many Requests).

## [0.3.17] - 2026-09-23
### Added
- feat(lgpd): Implemented comprehensive LGPD Art. 18 data portability and account erasure endpoints across backend microservices (TASK-S3-14):
  - **`common-core`**: Created [`UserDeletedEvent`](backend/common-core/src/main/java/com/aprovaenem/common/events/UserDeletedEvent.java) event contract (`userId`, `email`, `legalBasis`, `occurredAt`) installed into local `.m2` repository.
  - **`auth-service`**:
    - Implemented self-service Data Portability endpoint `GET /api/v1/auth/export` returning portable JSON payload aggregating personal identity, academic preferences, school type, target degree, legal basis (`Art. 7º, I e Art. 14 da Lei 13.709/2018 - Consentimento e Melhor Interesse do Estudante`), privacy policy version, and full gamification snapshot (`GamificationExport`: current level, level title, XP progress, streak days, streak freeze available, daily goal targets, and unlocked achievement badges).
    - Implemented Irrevocable Account Erasure endpoint `DELETE /api/v1/auth/me` (HTTP 204 No Content), cascading deletion of user account, credentials, gamification profile, and unlocked badges, and persisting a `UserDeletedEvent` to `outbox_events` within the same transaction.
    - Updated [`OutboxPollingWorker`](backend/auth-service/src/main/java/com/aprovaenem/auth/infrastructure/adapter/out/messaging/OutboxPollingWorker.java): sends raw JSON bytes directly with `MessageProperties.CONTENT_TYPE_JSON` using `rabbitTemplate.send()`, resolving Jackson double-string escaping and allowing downstream consumers to deserialize clean domain event POJOs without TypeId mismatch.
    - Updated RabbitMQ routing configuration binding `user.deleted` to exchange `auth.events`.
  - **`notification-service`**:
    - Added durable queue `notification.lgpd.queue` bound to `auth.events` with routing key `user.deleted`.
    - Added `@RabbitListener` in [`NotificationEventListener`](backend/notification-service/src/main/java/com/aprovaenem/notification/infrastructure/adapter/in/messaging/NotificationEventListener.java) to delete all notification logs and registered device tokens for `userId` upon receiving `UserDeletedEvent`.
    - Added null-safe metadata serialization in `handleEmailVerification`.
  - **`exam-service`**:
    - Added durable queue `exam.lgpd.queue` bound to `auth.events` with routing key `user.deleted`.
    - Implemented [`ExamEventListener`](backend/exam-service/src/main/java/com/aprovaenem/exam/infrastructure/adapter/in/messaging/ExamEventListener.java) to anonymize practice sessions (`UPDATE practice_sessions SET user_id = null WHERE user_id = :userId`) preserving psychometric TRI item calibration data under LGPD Art. 16, II (research exemption) without retaining PII, while irrevocably purging AI tutor chat threads and message history.
    - Added Flyway migrations [`V5__add_figure_alt_text.sql`](backend/exam-service/src/main/resources/db/migration/V5__add_figure_alt_text.sql) and [`V6__add_figure_url.sql`](backend/exam-service/src/main/resources/db/migration/V6__add_figure_url.sql) aligning live schema with JPA entity definitions.
  - **Verification & Testing**:
    - Unit tests passing across all modified modules (19 tests in `auth-service`, 23 tests in `notification-service`, and `ExamEventListenerTest` in `exam-service`).
    - Pre-flight smoke test verified with 100% green pass rate (7/7 probes in 238ms).
    - Postman Newman contract suite verified with 100% pass rate (31 requests, 56 assertions, 0 failures).
    - End-to-end multi-service event dispatch verified live across Docker stack.
### Changed
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-14` as `DONE ✅`, advancing Sprint 3 completion to 83.3% (15/18 tasks completed).

## [0.3.16] - 2026-09-21
### Changed
- docs(backlog): Reorganized project backlog in `docs/BACKLOG.md`:
  - Marked **`TASK-S3-11`** as **DONE ✅**.
  - Brought forward **`TASK-S3-13`** (**Historical Question Catalog Bulk Ingestion & Reconciliation 2019–2023**, 5 pts, P1) from JAM 2 Sprint 4 (`S4-00`) to the final of Sprint 3.
  - Brought forward **`TASK-S3-14`** (**LGPD Art. 18 Data Portability & Irrevocable Account Erasure Backend APIs**, 5 pts, P0) from the backend scope of JAM 2 Sprint 6 (`S6-09`) to the final of Sprint 3.
  - Added **`TASK-S3-15`** (**Backend Security Audit Critical P0 Remediation & Hardening**, 5 pts, P0) to remediate real operational vulnerabilities: Practice Session BOLA, Question Catalog BFLA, `JWT_SECRET` Docker Compose divergence, double-BCrypt login overhead elimination, and test suite zero-assert fixes.
  - Added **`TASK-S3-16`** (**Supply Chain, Ingress Perimeter & Resource Boundary Hardening**, 3 pts, P1) for Spring Boot BOM patch upgrades, Nginx 1.27 perimeter header inheritance fixes, and question catalog max pagination limits.
  - Re-scoped Sprint 4 to focus 100% on frontend architecture and design tokens (8 tasks starting with `S4-01`).
  - Re-scoped `S6-09` in Sprint 6 to the frontend **Student Privacy Portal, Terms of Use UI & LGPD Self-Service Dashboard**.
  - Synchronized the Mermaid Gantt chart and Milestone & Sprint Status Summary table (Sprint 3: 18 tasks total, 14 completed, 4 pending).
### Security
- sec(audit): Completed comprehensive multi-stage backend security, static analysis, and test authenticity audit across 6 independent subagent phases (TASK-S3-11):
  - **Phase 1 (Static Analysis & Workarounds)**: Audited rapid changes in Checkstyle regex, relaxed PMD CC 15 threshold, SpotBugs absence, `QuestionDtoMapper` static extraction, brittle shell script JSON parsing in `preflight-smoke.sh`, Newman `--delay-request 100` rate limiter masking, and double-BCrypt performance cost during pepper verification. Generated `docs/audit/phase1-static-analysis-workarounds.md` (Score: 52.0% | Grade F).
  - **Phase 2 (Threat Modeling & OWASP API Top 10)**: Identified 21 security findings (4 Critical, 6 High), including BOLA in `PracticeSessionController`, BFLA in unauthenticated `PATCH /api/v1/questions/{id}/status`, direct XP farming via `POST /api/v1/gamification/activity`, blind `X-User-Id` header trust, and unbounded pagination heap exhaustion. Generated `docs/audit/phase2-threat-modeling-owasp.md` (Score: 58.0% | Grade D+).
  - **Phase 3 (Automated SAST, SCA & Container Hardening)**: Audited dependencies via Aquasec Trivy discovering 49 High/Critical CVEs in Spring Boot 3.3.3 transitives (10 Critical in Tomcat/Netty), verified clean 82-commit git history via Gitleaks while identifying blanket path allowlist blindspots, flagged root execution in `ingestion-service`, Docker socket mount in `autoheal`, and Nginx header inheritance bugs. Generated `docs/audit/phase3-automated-security-scans.md` (Score: 66.8% | Grade D+).
  - **Phase 4 (Perimeter & Runtime Security)**: Validated network isolation in `docker-compose.yml` (`internal: true`), flagged `0.0.0.0` exposure in `docker-compose.override.dev.yml`, detected egress blackhole blocking Gemini LLM and SMTP, verified JJWT 0.12 signature enforcement, uncovered `JWT_SECRET` divergence bug in `exam-service`, and verified parameterized SQL queries. Generated `docs/audit/phase4-runtime-penetration-testing.md` (Score: 71.4% | Grade C-).
  - **Phase 5 (Test Suite Authenticity & Mutation Testing)**: Evaluated 1,148 assertion points across 344 test executions; identified 2 zero-assert tests, detected security filter stripping in 4/5 WebMvc slice tests (`addFilters = false`), and conducted PITest 50-mutant simulation achieving an 80.0% kill rate while identifying surviving mutants in session persistence. Generated `docs/audit/phase5-test-authenticity-mutation.md` (Score: 78.2% | Grade B-).
  - **Phase 6 (Master Synthesis & Formal Audit Report)**: Compiled unified weighted scorecard (Global Score: 65.58% | Grade D+), analyzed cross-cutting workaround risk cascades, generated Master Prioritized Remediation Backlog (10 Tier P0 Hotfixes), and published formal master audit report at `docs/audit/jam1-backend-security-audit.md` and `docs/audit/phase6-final-synthesis-remediation.md`.

## [0.3.15] - 2026-09-20
### Changed
- docs(license): Adopted PolyForm Noncommercial License 1.0.0 in root `LICENSE` file and synchronized OpenAPI configs, strictly prohibiting commercial monetization and private prep-course exploitation while preserving 100% free educational access for students, public schools, and non-profits.
- config(env): Added `AUTH_PASSWORD_PEPPER` configuration to `.env.example` under JWT & Password Security section, documenting HMAC-SHA256 secret pepper pre-hashing ($2^{10}$ BCrypt rounds).
- docs(backlog): Updated `docs/BACKLOG.md`:
  - Expanded **`TASK-S3-11`** scope to mandate a deep technical investigation and audit of all rapid changes and potential workarounds made without websearch (Checkstyle `MethodName` regex `^[a-z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$` for Spring Data JPA repository traversals vs `@Query`, PMD ruleset configuration $\le 15$ cyclomatic complexity, `QuestionDtoMapper` extraction and domain encapsulation, shell script regex parsing in `preflight-smoke.sh` vs `jq`, Newman `--delay-request 100` rate limiter interactions, and HMAC-SHA256 password pepper backward compatibility).
  - Marked **`TASK-S3-12`** as **DONE ✅** reflecting that the JAM 1 backend platform deliverable has been officially submitted to the Reconecta Recode platform.
  - Formally clarified that visual showcase assets (`docs/images/` catalog) are scheduled for Month 4 (Sprint 6/7) during full-stack presentation preparation, not Sprint 3.
  - Updated Sprint 3 milestone progress to 93% (13/14 tasks completed).
- docs(readme): Updated `README.md` and `docs/specifications/07-quality-gate-ci.md` to reference `.github/workflows/ci.yml`, document the 7-stage CI quality gate, and align PMD cyclomatic complexity ($\le 15$) and CPD token thresholds (100 tokens).
### Fixed
- ci(actions): Hardened GitHub Actions CI workflow in `.github/workflows/ci.yml`:
  - Fixed YAML scanner syntax error by enclosing all stage names containing colons in double quotes (`"Stage X: ..."`).
  - Configured `mvn clean install -B -DskipTests` in Stage 1 to install `common-core` into the runner's local repository, resolving multi-module dependencies during static analysis in Stage 2.
  - Resolved `jacoco:check` missing rules failure on parent `aprovaenem-parent` POM by aligning Stage 5 test execution with Maven lifecycle bindings (`mvn test -B -Dspring.profiles.active=test`).
  - Fixed global npm installation command in Job 2 (`npm install -g newman`, removing nonexistent `newman-reporter-junitxml` package as JUnit reporting is built into Newman core).
  - Created `.gitleaks.toml` allowlist to ignore documentation Markdown files (`docs/`, `README.md`) containing sample mock JWT tokens and API contract payloads, preventing false-positive secret detections.

## [0.3.14] - 2026-09-20
### Added
- ci(backend): Implement production-grade 7-stage GitHub Actions CI pipeline in `.github/workflows/ci.yml` (TASK-S3-10)
  - **Stage 1 (Strict Compilation)**: Configured strict Maven compilation enforcing Java 21 compiler flags (`-parameters`, `-Werror`) across all 6 backend modules (`common-core`, `frontend-api`, `auth-service`, `exam-service`, `notification-service`).
  - **Stage 2 (Static Analysis & Cyclomatic Complexity)**: Integrated `maven-checkstyle-plugin` (Google Java Style with Spring Data JPA extensions) and `maven-pmd-plugin` (ruleset bounding cyclomatic complexity $\le 15$ per method and $\le 80$ per class), achieving 0 violations across all 6 modules.
  - **Stage 3 (Code Duplication Detection)**: Configured PMD CPD duplication gate with a 100-token threshold (< 3% duplication budget); created shared `QuestionDtoMapper` in `exam-service` eliminating redundant mapping logic between `PracticeSessionController` and `QuestionCatalogController`.
  - **Stage 4 (Security Dependency & Secret Audit)**: Integrated Gitleaks commit history secret scan (`gitleaks/gitleaks-action@v2`) and Trivy vulnerability filesystem audit (`aquasecurity/trivy-action@master`).
  - **Stage 5 (Backend Test Suite & JaCoCo Quality Gate)**: Automated test execution and JaCoCo coverage quality gate ($\ge 80\%$ line, $\ge 75\%$ branch coverage) with automated artifact archiving for coverage reports (`jacoco.exec` and HTML reports).
  - **Stage 6 (Docker Compose Production Ecosystem & Pre-Flight Smoke Suite)**: Automated container ecosystem initialization and live health verification; created `tests/smoke/preflight-smoke.sh` executing 7 comprehensive probes (Edge Nginx `/health`, Gateway `/actuator/health`, distributed trace header propagation, question bank catalog browse, anonymous session creation, practice session start, and practice query verification) completing with 100% green pass rate in 147ms (well within the $< 15\text{s}$ SLA budget).
  - **Stage 7 (Automated Postman Newman API Contract Suite & k6 Smoke)**: Executed Postman collection `docs/postman/AprovaENEM.postman_collection.json` via Newman (31 requests, 56 assertions, 100% pass rate in 9.7s) and headless Grafana k6 smoke verification (`catalog-browse-load.js` in `CI_FAST` mode with 150 VUs, 0% errors, and sub-135ms P95 latency).
- feat(nginx): Added `/actuator/health` proxy location to `infrastructure/nginx/nginx.conf` routing to `frontend-api` BFF for standardized perimeter health checks and Kubernetes/Prometheus probes.
### Changed
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-10` as `DONE ✅`, advancing Sprint 3 completion to 86% (12/14 tasks completed).
### Fixed
- fix(quality): Cleaned up static analysis findings across services:
  - Removed unused imports in `GlobalGatewayExceptionHandler`, `PracticeSessionEntity`, and `NotificationEventListener`.
  - Wrapped long lines exceeding 160 characters in `EmailVerificationService`, `OpenApiConfig`, `BCryptPasswordEncoderAdapter`, and `GeminiTutorClientAdapter`.
  - Added curly braces to single-line control flow statements in `GamificationService` and `RedisTutorQuotaAdapter`.
  - Added structured audit logging for tier promotion/relegation metrics during weekly league resets.

## [0.3.13] - 2026-09-20
### Added
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
### Changed
- docs(benchmarks): Published comprehensive stress testing and saturation report in `docs/benchmarks/jam1-k6-stress-benchmarking.md` detailing architecture, test scenarios, percentile tables, bottleneck analysis, and SLA verification.
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-06b` as `DONE ✅`, advancing Sprint 3 completion to 79% (11/14 tasks completed).

## [0.3.12] - 2026-09-20
### Added
- test(auth): Added comprehensive unit and integration verification for peppered password hashing:
  - `BCryptPasswordEncoderAdapterTest`: 7 unit tests verifying peppered hashing, dual-check legacy validation, rejection of invalid credentials, immunity to BCrypt 72-byte truncation collision, empty pepper fallback, null safety, and default port method behavior.
  - `AuthServiceTest`: Added `shouldSeamlesslyUpgradeLegacyPasswordHashOnLogin` verifying automatic upgrade and persistence.
  - `AuthRepositoryAndFlywayIT`: 4 Testcontainers integration tests passing against real PostgreSQL 16.
  - Maintained high JaCoCo coverage in `auth-service`: 95.8% line coverage, 84.1% branch coverage (exceeding $\ge 80\%$ line and $\ge 75\%$ branch thresholds).
### Changed
- docs(backlog): Synchronized `docs/BACKLOG.md` marking `TASK-S3-07b` as `DONE ✅`, advancing Sprint 3 completion to 71% (10/14 tasks completed).
### Security
- sec(auth): Layer application-level secret pepper over BCrypt in `auth-service` via `BCryptPasswordEncoderAdapter` and `PasswordEncoderPort` (TASK-S3-07b)
  - Implemented HMAC-SHA256 pre-hashing using `javax.crypto.Mac` with Base64 encoding before standard BCrypt hashing ($2^{10}$ rounds).
  - Externalized secret pepper key to `AUTH_PASSWORD_PEPPER` environment variable (`auth.password-pepper` property in `application.yml` and `docker-compose.yml`) with secure fallback for local development.
  - Eliminated the known BCrypt 72-byte truncation collision attack vector, ensuring passwords of arbitrary length yield uniform 32-byte HMAC digests prior to BCrypt hashing.
  - Provided dual-check backward compatibility: `matches(rawPassword, encodedPassword)` evaluates HMAC-SHA256 + BCrypt first, and falls back to legacy raw BCrypt comparison.
  - Added seamless automatic hash migration on login: `AuthService.login()` detects legacy hashes via `isLegacyHash()` and transparently re-encodes with pepper and persists the updated hash to PostgreSQL within `@Transactional` boundary.

## [0.3.11] - 2026-09-20
### Added
- test(resilience): Implement Resilience4j Chaos and Circuit Breaker integration testing suite (`Resilience4jChaosAndCircuitBreakerIT`) across `exam-service` against real Testcontainers (`PostgreSQL 16 pgvector` + `Redis 7.2`) with embedded JDK HTTP fault injection server (TASK-S3-07)
  - Verified 6 fault injection and chaos scenarios:
    1. **Normal Operation (CLOSED state)**: Verified live Gemini API invocation (HTTP 200 OK) returning model output with `isFallback: false`, verifying Circuit Breaker remains in `CLOSED` state.
    2. **Latency Fault Injection (API Timeout > 1s)**: Simulated downstream API hang exceeding configured read timeout (2,000ms delay vs. 1,000ms timeout), triggering graceful Socratic fallback with reflective pedagogical hints and `isFallback: true`.
    3. **HTTP 429 Quota Exhaustion (Rate Limiting)**: Simulated upstream LLM quota exhaustion (`RESOURCE_EXHAUSTED`), verifying instant fallback execution and graceful degradation without throwing exceptions.
    4. **Sustained Chaos & Zero-Traffic Short-Circuiting**: Injected 3 consecutive HTTP 503 service failures, automatically tripping the Circuit Breaker from `CLOSED` to `OPEN` (breaching the 50% failure rate threshold over `minimum-number-of-calls: 3`). Verified that subsequent requests immediately short-circuit in memory without dispatching any network packets (`requestCounter` delta = 0).
    5. **Automated Recovery Cycle (`OPEN` -> `HALF_OPEN` -> `CLOSED`)**: Probed recovery transitions through `HALF_OPEN` state, verifying that 2 successful probe requests reset the breaker back to `CLOSED` and restore live LLM traffic.
    6. **End-to-End Service Orchestration**: Verified full flow through `SocraticTutorService.askTutor(...)`, confirming `TutorConsultationResult.isFallback()` propagation, fallback messaging containing curated INEP pedagogical concepts, and accurate thread history metadata recording (`modelUsed = "static-inep-fallback"` vs `"gemini-1.5-flash"`).
- test(unit): Updated `GeminiTutorClientAdapterTest` and `SocraticTutorServiceTest` to validate `TutorAiResult` return contracts and fallback propagation.
### Changed
- refactor(tutor): Refined `TutorAiPort` domain contract and `GeminiTutorClientAdapter` to return `TutorAiResult(String responseText, boolean isFallback)` domain record instead of primitive `String`, properly encapsulating AI invocation provenance and fallback status.
- config(network): Added `RestClientConfig` configuring `RestClient.Builder` with configurable connect and read timeouts (`gemini.timeout-seconds`, default 5s, 1s in test profile) via `SimpleClientHttpRequestFactory`.
- docs(backlog): Synchronize `docs/BACKLOG.md` marking `TASK-S3-07` as `DONE ✅`, advancing Sprint 3 completion to 64% (9/14 tasks completed), and schedule `TASK-S4-00` (Historical Question Catalog Bulk Ingestion & Reconciliation 2019–2023) as the kick-off task for Sprint 4.

## [0.3.10] - 2026-09-20
### Added
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
### Changed
- docs(benchmarks): Published comprehensive latency benchmark report in `docs/benchmarks/jam1-redis-latency-benchmarking.md` detailing architecture, test scenarios, execution metrics, percentile distributions, and production recommendations.
- docs(backlog): Synchronize `docs/BACKLOG.md` marking `TASK-S3-06` as `DONE ✅` and scheduling `TASK-S3-06b` (Backend Load & Stress Testing with Grafana k6).
- docs(quality-gate): Formalize automated Pre-Flight Smoke Testing (< 15s) and containerized Grafana k6 Full-System Stress & Load Testing (`tests/stress/`) across `docs/specifications/07-quality-gate-ci.md`, `README.md`, and `docs/BACKLOG.md` (covering Exam Rush 1,000+ VU simulation, Socratic consultation bursts, and post-deployment smoke verification in `TASK-S6-05`).

## [0.3.9] - 2026-09-20
### Added
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
### Changed
- docs(backlog): Synchronize `docs/BACKLOG.md` marking `TASK-S3-05` as `DONE ✅` and advancing Sprint 3 completion to 58% (7/12 tasks completed)
- docs(audit): Expand both milestone audit specifications (`TASK-S3-11` in Sprint 3 for backend and `TASK-S6-06` in Sprint 6 for full-stack) across `docs/BACKLOG.md` and `docs/specifications/07-quality-gate-ci.md` to establish a 5-Stage Security & Test Suite Integrity Audit framework, incorporating a dedicated Test Quality & Legitimacy Audit stage (detecting test smells, vacuous/tautological assertions, over-mocking, swallowed exceptions, unhandled async promise rejections, and mutant fault injection verification)
- docs(specs): Align `docs/specifications/04-data-modeling.md` (Question domain model attributes: `triParamA/B/C`, `figureUrl`, `figureAltText`, `contentLanguage`) and `docs/specifications/05-api-specification.md` (sequential section numbering for email resend verification) with current microservice implementations and Flyway DDL migrations
- docs(backlog): Add `TASK-S3-07b` (Password Storage Pepper Hardening via HMAC-SHA256 + BCrypt) to Sprint 3 backlog and roadmap to provide defense-in-depth against isolated database breaches
### Fixed
- fix(database): Align `V1__init_exam_schema.sql`, `QuestionEntity`, and `QuestionRepositoryAdapter` with `04-data-modeling.md` by including `figure_url` and `figure_alt_text` columns for INEP charts and WCAG 1.1.1 screen-reader descriptions

## [0.3.8] - 2026-09-20
### Added
- test(integration): Implement real container integration test suites across `auth-service`, `exam-service`, and `notification-service` verifying database migrations, JPA repositories, full-text search, and Redis caching with Testcontainers (5 test suites, 16 integration tests, 100% passing) (TASK-S3-04)
  - `AuthRepositoryAndFlywayIT` (4 tests): Verifies PostgreSQL 16 container executing Flyway migrations V1–V3 (`init_auth_schema`, `auth_indexes`, `gamification_and_sessions`), `UserRepositoryAdapter` CRUD, `GamificationRepositoryAdapter` profile persistence, XP accumulation, streaks, and `AnonymousSessionRepositoryAdapter` provisioning and post-registration claiming
  - `RedisLeaderboardIT` (2 tests): Verifies real Redis 7.2 container executing atomic ZSET operations (`ZADD`, `ZREVRANGE_WITHSCORES`), rank retrieval, score incrementation, and clean league reset eviction
  - `ExamPersistenceIT` (4 tests): Verifies `pgvector/pgvector:pg16` container with `vector` extension, Flyway migrations V1–V4 (`init_exam_schema`, `exam_performance_indexes`, `exam_seed_data`, `tutor_chat_schema`), Portuguese full-text search (`to_tsvector('portuguese', ...)` with GIN indexes), Question CRUD with status lifecycle transitions, and Practice Session persistence with Student Attempts
  - `RedisTutorQuotaIT` (3 tests): Verifies real Redis 7.2 container enforcing Socratic AI daily quota tracking with TTL, quota exhaustion for standard students, unlimited access bypass for premium students, and cross-student key isolation
  - `NotificationRepositoryAndFlywayIT` (3 tests): Verifies PostgreSQL 16 container executing Flyway migrations V1–V2 (`init_notification_schema`, `notification_indexes`), `UserDeviceTokenRepository` token registration, querying by active status, and deactivation, and `NotificationLogRepository` persisting multi-channel notifications (in-app, email, push) with JSONB metadata and unread status counting
- build(maven): Configure Maven Failsafe Plugin in root `backend/pom.xml` for integration test execution (`*IT.java`) with strict separation from Surefire fast unit tests (`*Test.java`), and Docker Java API version 1.44 negotiation properties for host Docker Engine 29+ compatibility
### Changed
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-04 as DONE, advancing Sprint 3 completion to 50% (6/12 tasks completed)

## [0.3.7] - 2026-09-20
### Added
- test(security): Implement comprehensive WebMvc MockMvc test suites across `auth-service`, `exam-service`, and `notification-service` verifying HTTP status codes, security boundaries, and validation rules (7 test suites, 48 tests, 100% passing, total backend tests reach 202 tests) (TASK-S3-03)
  - `AuthControllerWebMvcTest` (10 tests): Validates registration (201 Created / 400 Bad Request on duplicate/validation error), login (200 OK / 400 Bad Request on invalid credentials), authenticated user profile (200 OK / 401 Unauthorized), LGPD Art. 18 data portability export (200 OK), LGPD account erasure (204 No Content), email verification (200 OK), and resend verification (200 OK)
  - `GamificationControllerWebMvcTest` (7 tests): Validates authenticated profile retrieval (200 OK / 401 Unauthorized / 403 Forbidden without `ROLE_STUDENT`), daily study goal configuration (200 OK), weekly leaderboard rankings (200 OK), badge catalog (200 OK), and daily activity heatmap (200 OK)
  - `SessionControllerWebMvcTest` (3 tests): Validates public anonymous session creation with client IP resolution (201 Created), public session retrieval (200 OK), and non-existent session error handling (404 Not Found)
  - `SocraticTutorControllerWebMvcTest` (6 tests): Validates unauthenticated AI tutor access rejection with registration CTA problem details (401 Unauthorized), authenticated Socratic consultation with dynamic quota response headers `X-AI-Quota-*` (200 OK), daily quota exhaustion with RFC 7807 problem details (429 Too Many Requests), multi-turn chat history retrieval (200 OK), thread reset (200 OK), and daily quota check (200 OK)
  - `QuestionCatalogControllerWebMvcTest` (5 tests): Validates paginated question catalog retrieval with filter parameters and answer masking to prevent cheating (200 OK), single question detail retrieval (200 OK), question not found (404 Not Found), administrative status update (200 OK), and missing status validation (400 Bad Request)
  - `PracticeSessionControllerWebMvcTest` (8 tests): Validates starting practice session via `X-Session-Id` header (201 Created), starting session via request body (201 Created), missing session identifier validation (400 Bad Request), session retrieval (200 OK), answer submission with instant grading and explanation (201 Created), missing question ID validation (400 Bad Request), session completion (200 OK), and diagnostic report retrieval (200 OK)
  - `NotificationControllerWebMvcTest` (9 tests): Validates push token registration via `X-User-Id` header (201 Created), push token registration via Bearer JWT token (201 Created), unauthenticated token registration rejection (401 Unauthorized), invalid platform validation (400 Bad Request), notification feed retrieval (200 OK / 401 Unauthorized), marking notification as read (200 OK / 404 Not Found), and unread count query (200 OK)
### Changed
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-03 as DONE, advancing Sprint 3 completion to 42% (5/12 tasks completed), and embedding Mermaid Test Pyramid diagram

## [0.3.6] - 2026-09-20
### Added
- test(application): Implement comprehensive Mockito unit test suites for all Application Services and Use Cases across `exam-service`, `auth-service`, and `notification-service` (57 tests, 100% passing, total suite reaches 191 tests across backend) (TASK-S3-02)
  - `QuestionCatalogServiceTest` (6 tests): Validates paginated question catalog filtering by subject/difficulty, question detail retrieval, active status updates, and administrative suspension notes
  - `PracticeSessionServiceTest` (8 tests): Validates session initialization with question randomizer, answer submission with instant grading and duplicate submission rejection, diagnostic report generation with accuracy radar and pedagogical recommendations, and session abandonment
  - `SocraticTutorServiceTest` (6 tests): Validates Gemini AI Socratic guidance with RAG chunk injection, anonymous user access rejection, daily quota exhaustion guarding, 6-turn interaction threshold enforcement, and conversation thread resets
  - `AuthServiceTest` (7 tests): Validates student registration with BCrypt hashing and Outbox event dispatch, login authentication with JWT generation, credential rejection, deactivated account guarding, LGPD Art. 18 data portability export, and permanent account erasure
  - `GamificationServiceTest` (10 tests): Validates initial profile creation, comprehensive profile response DTO, daily goal targets, XP awarding (+10 per correct answer, +50 per session, +20 daily goal bonus), streak tracking with emergency monthly streak freeze consumption, badge unlock verification, Redis ZSET weekly leaderboard rankings with promotion zones, 19:00 BRT daily study goal reminder sweeps, and Sunday weekly league resets
  - `AnonymousSessionServiceTest` (5 tests): Validates 30-day anonymous session provisioning with SHA-256 IP hashing, session UUID retrieval, and session claiming post-registration
  - `EmailVerificationServiceTest` (8 tests): Validates 24-hour token email verification, expired token rejection, silent anti-enumeration resend handling, and Outbox event dispatch
  - `NotificationServiceTest` (7 tests): Validates Android/iOS push token registration with device deduplication, paginated notification feed retrieval with unread status filtering, marking notifications as read, and unread counter queries
### Changed
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-02 as DONE and advancing Sprint 3 completion to 33% (4/12 tasks completed)
- docs(agents): Create and expand `AGENTS.md` full-stack repository operating manual covering monorepo architecture (backend, frontend, infrastructure), English-only communication mandate, Mermaid diagram guidelines for Markdown documentation, zero uncommitted changes policy, Conventional Commits standard, pre-commit changelog updates, proactive web search with zero workarounds policy, error diagnosis protocol, and recursive documentation synchronization

## [0.3.5] - 2026-09-20
### Added
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
### Changed
- docs(backlog): Update `docs/BACKLOG.md` marking TASK-S3-01 as DONE, advancing Sprint 3 completion to 25%, and setting TASK-S3-02 (Application Service Unit Testing) as ACTIVE

## [0.3.4] - 2026-09-20
### Added
- feat(lgpd): Implement Brazilian General Data Protection Law (LGPD - Lei nº 13.709/2018) data subject rights in `auth-service`: `GET /api/v1/auth/export` (Art. 18, V - Data Portability) and `DELETE /api/v1/auth/me` (Art. 18, VI - Irrevocable Account Erasure & Psychometric Anonymization)
- test(contract): Recursively synchronize Postman contract test suite (`AprovaENEM.postman_collection.json`) with LGPD Art. 18 assertions, verified 100% green via Newman CLI (31 requests, 56 assertions passing)
### Changed
- docs(backlog): Add TASK-S4-08 (Student Registration Terms of Use & LGPD Consent Modal) and TASK-S6-09 (Legal Compliance, Terms of Use & LGPD Privacy Portal for JAM 3)
- docs(specs): Document Section 10 LGPD Compliance & Privacy by Design in `05-api-specification.md` and account purge lifecycle in `04-data-modeling.md`
- docs(readme): Add LGPD Compliance badge and Privacy by Design architectural highlights to `README.md`

## [0.3.3] - 2026-09-20
### Added
- docs(accessibility): Specify comprehensive Universal Digital Accessibility baseline across architecture, backlog, and quality gates adhering to WCAG 2.1 Level AA, e-MAG, and Lei Brasileira de Inclusão (LBI - Lei nº 13.146/2015)
- docs(backlog): Add TASK-S4-07 (Digital Accessibility Baseline & VLibras Integration), TASK-S5-07 (Accessible Question Reader, Hotkeys & INEP Accommodations), and update S6 with automated Axe-Core / Lighthouse accessibility quality gates ($\ge 95/100$)
- docs(data): Add `figure_alt_text` and `time_mode` (`STANDARD`, `EXTENDED_INEP`, `UNTIMED`) to `questions` and `practice_sessions` tables in `04-data-modeling.md`
- docs(api): Specify `figureAltText` in question payloads, `timeMode` in practice session creation, and Section 9 Universal Accessibility in `05-api-specification.md`
- docs(ci): Add Gate 5f automated Axe-Core WCAG 2.1 AA audit step to CI pipeline in `07-quality-gate-ci.md`
- docs(readme): Add WCAG 2.1 AA and VLibras badges, Universal Digital Accessibility feature highlights, and Accessibility tech stack to `README.md`

## [0.3.2] - 2026-09-20
### Added
- feat(api-docs): Implement interactive OpenAPI 3.0 specifications and Swagger UI (`/swagger-ui.html`) across `auth-service`, `exam-service`, and `notification-service`, with unified multi-spec gateway dropdown aggregation in `frontend-api` BFF and Nginx reverse proxy routing (TASK-S3-08)
- test(contract): Implement automated Newman / Postman end-to-end API contract test suite (`docs/postman/AprovaENEM.postman_collection.json` and `docs/postman/AprovaENEM.postman_environment.json`) covering 8 modules, 29 requests, and 53 assertions verifying status codes, schemas, and SLA latency (TASK-S3-09)

## [0.3.1] - 2026-09-20
### Changed
- refactor(docs): Rename foundational specifications directory from `docs/sprint-1/` to `docs/specifications/` to accurately reflect its permanent role as the platform architecture and technical baseline across all project phases
- docs(links): Synchronize internal documentation links, project directory tree, and backlog artifact cross-references across `README.md`, `docs/BACKLOG.md`, and `docs/specifications/02-project-charter.md`
- docs(specs): Synchronize API specification in `05-api-specification.md` with live controllers: added `GET /api/v1/auth/me`, `GET /api/v1/auth/session/{sessionUuid}`, `GET /api/v1/sessions/{id}/diagnostic`, `POST /api/v1/gamification/activity`, `POST /api/v1/gamification/reminders/trigger`, and `GET /api/v1/notifications/unread-count`; corrected question status route to `PATCH /api/v1/questions/{id}/status` and documented anti-cheating resolution encapsulation inside `AttemptResultResponse`
- docs(architecture): Clarify standard internal container port `5432` across all PostgreSQL databases and port `3000` for Grafana in `03-system-architecture.md`, distinguishing them from host developer overrides
- docs(data): Update persistence model boundaries in `04-data-modeling.md` to reflect three autonomous databases (`auth_db`, `exam_db`, and `notification_db`)
- docs(ingestion): Update extraction and reconciliation worker paths in `08-data-ingestion-pipeline.md` to point to the containerized `backend/ingestion-service/` modules and test suites

## [0.3.0] - 2026-09-20
### Added
- feat(gamification): Implement student gamification engine in `auth-service` with XP progression (+10 correct answer, +50 completed session, +20 daily goal bonus), 4-tier title levels (`Calouro Iniciante`, `Focado no SISU`, `Mestre dos Simulados`, `Nota 1000`), daily streak tracking in `America/Sao_Paulo` timezone, and emergency monthly streak freeze (TASK-S2-14)
- feat(leaderboard): Implement real-time weekly reset leaderboards with Redis `ZSET` (`leaderboard:weekly:{year}:{week}:{tier}`), sub-5ms rank lookup, top 20% promotion zone calculations, and scheduled Sunday 23:59:59 BRT league reset worker (TASK-S2-15)
- feat(scheduler): Implement daily 19:00 BRT study reminder scheduled worker in `auth-service` dispatching `DailyGoalReminderEvent` to RabbitMQ for students with pending daily goals (TASK-S2-16)
- feat(notifications): Implement decoupled `notification-service` microservice consuming RabbitMQ events (`notification.reminders.queue`, `notification.auth.queue`), registering device push tokens (WEB_PUSH, ANDROID, IOS), and serving the in-app notification inbox with read state tracking (TASK-S2-17)
- feat(ingestion): Implement on-demand data ingestion microservice (`ingestion-service`) with Docker Compose profile `ingestion`, IBM Docling layout parsing, KaTeX formula extraction, 300 DPI WebP diagram cropping, INEP ITENS_PROVA microdados reconciliation, and 5 automated quality gates (TASK-S2-02b)
### Fixed
- fix(infra): Optimize Nginx health check probe to use IPv4 loopback (`127.0.0.1/health`) and dual IPv4/IPv6 listen binding; disable unused `MailHealthIndicator` in Spring Boot Actuator to ensure 100% container health

## [0.2.1] - 2026-09-19
### Changed
- docs(specs): Synchronize OpenAPI specifications in `05-api-specification.md` with dual `/chat` and `/ask` route mapping, `@JsonAlias({"studentQuery"})` request body backward compatibility, and 429 quota exhaustion headers
- docs(architecture): Clarify internal container port mappings (`5432` standard) vs host developer overrides in `03-system-architecture.md`, and document BFF routing rules
- docs(data): Document per-question multi-turn thread persistence model, outbox event status lifecycle, and Redis key namespaces in `04-data-modeling.md`
- docs(readme): Update verified live operational endpoints, perimeter isolation architecture, and port matrix in `README.md`
### Fixed
- fix(compat): Add dual `/chat` and `/ask` route mapping and `@JsonAlias({"studentQuery"})` in `exam-service` for 100% backward compatibility

## [0.2.0] - 2026-09-18
### Added
- feat(gateway): Implement `frontend-api` BFF Edge Gateway with strict CORS origin whitelisting, perimeter security, Token Bucket Redis rate limiting, end-to-end distributed tracing (`X-Trace-Id`), and Prometheus scraping across all microservices (TASK-S2-12, TASK-S2-13)
- feat(tutor): Implement Socratic AI Tutor (`gemini-1.5-flash`), per-question multi-turn thread engine (up to 6 turns), conversation reset (`DELETE /chat`), Resilience4j Circuit Breaker fallback, PostgreSQL `pgvector` HNSW RAG knowledge retrieval, and Redis daily quota rate limiter (1 free question/day for `ROLE_STUDENT`, unlimited for `ROLE_PREMIUM_STUDENT`) in `exam-service` (TASK-S2-10, TASK-S2-11, TASK-S2-11b)
- feat(exam): Implement Examination & Assessment Engine (`exam-service`) with Hexagonal architecture, Portuguese GIN full-text search, Redis caching, practice sessions, instant grading, and diagnostic radar calculation (TASK-S2-06, TASK-S2-07, TASK-S2-08, TASK-S2-09, TASK-S2-02c)
- feat(auth): Implement Anonymous Sessions, Spring Security 6 stateless JWT & RBAC, and Transactional Outbox pattern with RabbitMQ publishing for auth-service (TASK-S2-04, TASK-S2-05, TASK-S2-05b)
- feat(build): Configure Java 21 LTS multi-module Maven parent POM and scaffold microservices (common-core, frontend-api, auth-service, exam-service, notification-service) with multi-stage Dockerfiles (TASK-S2-03)
- feat(infra): Implement production-ready Docker Compose stack with strict perimeter isolation (frontend-edge vs. internal private network), autoheal deadlock watchdog daemon, named volumes (driver: local), and local developer override (TASK-S2-01)
- feat(db): Implement Flyway migrations (V1 schemas, V2 performance indexes, V3 seed data) with PostgreSQL 16 + pgvector, GIN full-text search, composite B-Trees, and Transactional Outbox pattern across auth_db, exam_db, and notification_db (TASK-S2-02)

## [0.1.1] - 2026-09-18
### Added
- feat(tutor): Architect per-question multi-turn Socratic chat threads, daily quota unlock lifecycle, reset endpoint, and 90-day review retention across architecture, data modeling, and API specs
- feat(auth): Architect User entity modeling, Transactional Outbox pattern (outbox_events table), and asynchronous email confirmation lifecycle across data modeling, architecture, and API specs
- feat(auth): Require free registered account (ROLE_STUDENT) to access Socratic AI Tutor with 1 free consultation per day, eliminating cookie/session-clearing quota abuse while keeping core practice 100% free and anonymous with zero login required
- feat(mobile): Add TASK-M1-05 for AdMob Rewarded Video Ads with Brazil eCPM unit economics calibration and Server-Side Verification
- feat(tutor): Architect Redis-backed 1-per-day AI tutor rate limit for free tier with unlimited Pro plan, while preserving 100% free and unlimited core question training
- feat(storage): Architect Docker persistent named volume strategy (driver: local), shared OCR static media pipeline, and 12-factor stateless microservice boundaries
- feat(resilience): Architect self-healing Docker Compose topology with automated crash recovery (restart: unless-stopped), Spring Boot /actuator/health probes, boot sequencing (condition: service_healthy), and autoheal watchdog daemon
- feat(security): Architect Multi-Stage AI-Assisted and Real-Time Security Audit Framework terminating both backend (JAM 1 / Sprint 3 - TASK-S3-11) and full-stack (JAM 2 / Sprint 6 - TASK-S6-06) delivery milestones
- feat(cache): Architect Redis 7+ distributed caching grid (L2 entity cache, leaderboard ZSET, rate limiting) and comprehensive PostgreSQL indexing strategy (B-Tree, Partial, GIN Full-Text, HNSW Vector)
- feat(security): Specify zero-trust perimeter isolation, dedicated frontend-api BFF microservice, strict CORS engine with origin whitelisting, and zero public exposure for internal domain microservices
- feat(domain): Add question lifecycle status (ACTIVE, SUSPENDED, NEEDS_REVIEW, DRAFT, ANNULLED) with partial PostgreSQL indexes and admin management
- feat(notifications): Architect decoupled notification-service microservice for transactional emails, Web Push, and native mobile push (FCM/APNs), alongside native mobile app roadmap
- feat(gamification): Architect student game experience with XP progression, levels, daily goals, streak tracker, and weekly reset leaderboard leagues
- feat(rag): Architect Retrieval-Augmented Generation (RAG) pipeline using PostgreSQL 16 `pgvector` with HNSW cosine indexing to eliminate AI tutor hallucinations and anchor responses in official INEP curriculum guidelines
### Changed
- refactor(docs): Remove redundant 08-sprint-backlog.md and consolidate single source of truth in master BACKLOG.md, renumbering 08-data-ingestion-pipeline.md
- refactor(branding): Standardize project name to AprovaENEM across all documentation, removing legacy OpenENEM references and updating Java root packages to com.aprovaenem.*
- docs(readme): Synchronize System Architecture diagram (shared assets volume, autoheal, tiered daily AI quota) and Project Structure tree (grafana provisioning, evals harness)
- docs(backlog): Realign sprint backlog with Reconecta Recode program: JAM 1 (Sprints 1-3 Backend only, documented API deliverable), JAM 2 (Sprints 4-6 Frontend & Full-Stack Integration, deployed public URL deliverable), and Month 4 Career Placement
- docs(structure): Synchronize master README project structure tree (mobile KMP roadmap, Nginx/Prometheus infrastructure config) and align Access Endpoints with perimeter isolation
- docs(architecture): Synchronize master README system architecture diagram and project structure tree with frontend-api BFF, perimeter isolation, Redis 7+, RabbitMQ, and microservices
- docs(mobile): Pivot mobile application roadmap from React Native/Expo to Native Android (Kotlin / Java & Jetpack Compose) and Kotlin Multiplatform (KMP), unifying the stack under the modern JVM ecosystem with Room SQLite, CameraX, and WorkManager
- docs(ingestion): Architect on-demand ingestion-service container with IBM Docling, zero idle RAM footprint via Docker Compose profiles, and zero API costs
- docs(data): Explicitly specify Flyway database migrations and Spring Data JPA / Hibernate 6 decoupled persistence within Hexagonal Architecture
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
### Fixed
- fix(docs): Escape and quote edge labels containing parentheses and resolve invalid flowchart link syntax across 03-system-architecture.md and 04-data-modeling.md
- fix(docs): Replace invalid mermaid 'card' blocks in personas with native GitHub alert cards in 01-business-and-market-strategy.md

## [0.1.0] - 2026-09-17
### Added
- docs(business): Add Business Model Canvas, Value Proposition, and ICP Personas in 01-business-and-market-strategy.md
- docs(charter): Add Project Charter and INEP open data ingestion scope in 02-project-charter.md
- docs(architecture): Add System Architecture with Hexagonal layout and Gateway Token Bucket rate limiter in 03-system-architecture.md
- docs(data): Add PostgreSQL 16 DDL, ER diagram, and B-Tree indexing strategy in 04-data-modeling.md
- docs(api): Add OpenAPI 3.0 REST route specifications in 05-api-specification.md
- docs(observability): Add Prometheus metrics, Micrometer distributed tracing, and alert rules in 06-observability-datadog-style.md
- docs(ci): Add 6-stage Quality Gate specification in 07-quality-gate-ci.md
- docs(backlog): Add Multi-Sprint Backlog and Roadmap in BACKLOG.md and 08-sprint-backlog.md
- docs(readme): Add master project documentation in README.md
