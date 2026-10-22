import { describe, it, expect, vi } from 'vitest';
import { apiClient } from '../client';
import { examService } from './exam.service';
import { tutorService } from './tutor.service';
import { gamificationService } from './gamification.service';
import { tenantService } from './tenant.service';
import { authService } from './auth.service';
import { institutionalService } from './institutional.service';
import {
  MOCK_PAGINATED_QUESTIONS,
  MOCK_QUESTIONS,
  MOCK_RESOLUTION,
  MOCK_START_SESSION,
  MOCK_SUBMIT_ANSWER,
  MOCK_COMPLETE_SESSION,
  MOCK_DIAGNOSTIC_REPORT,
  MOCK_SOCRATIC_THREAD,
  MOCK_GAMIFICATION_PROFILE,
  MOCK_LEADERBOARD,
  MOCK_TENANT_BRANDING,
  MOCK_COHORT_DIAGNOSTICS,
} from '../mocks/mock-data';

describe('API Services', () => {
  describe('examService', () => {
    it('should query questions with filters', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: MOCK_PAGINATED_QUESTIONS });

      const result = await examService.getQuestions({ year: 2023, subject: 'MT' });

      expect(getSpy).toHaveBeenCalledWith('/questions', { params: { year: 2023, subject: 'MT' } });
      expect(result).toEqual(MOCK_PAGINATED_QUESTIONS);
    });

    it('should fetch single question by ID', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: MOCK_QUESTIONS[0] });

      const result = await examService.getQuestionById('q-123');

      expect(getSpy).toHaveBeenCalledWith('/questions/q-123');
      expect(result).toEqual(MOCK_QUESTIONS[0]);
    });

    it('should fetch resolution', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: MOCK_RESOLUTION });

      const result = await examService.getQuestionResolution('q-123');

      expect(getSpy).toHaveBeenCalledWith('/questions/q-123/resolution');
      expect(result).toEqual(MOCK_RESOLUTION);
    });

    it('should start a session', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: MOCK_START_SESSION });

      const result = await examService.startSession({ questionCount: 5 });

      expect(postSpy).toHaveBeenCalledWith('/sessions', { questionCount: 5 });
      expect(result).toEqual(MOCK_START_SESSION);
    });

    it('should submit an answer', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: MOCK_SUBMIT_ANSWER });

      const result = await examService.submitAnswer('sess-1', {
        questionId: 'q-123',
        selectedOption: 'B',
        timeSpentSeconds: 45,
      });

      expect(postSpy).toHaveBeenCalledWith('/sessions/sess-1/attempts', {
        questionId: 'q-123',
        selectedOption: 'B',
        timeSpentSeconds: 45,
      });
      expect(result).toEqual(MOCK_SUBMIT_ANSWER);
    });

    it('should complete session and get diagnostic report', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: MOCK_COMPLETE_SESSION });
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: MOCK_DIAGNOSTIC_REPORT });

      const completeResult = await examService.completeSession('sess-1');
      const diagnosticResult = await examService.getDiagnosticReport('sess-1');

      expect(postSpy).toHaveBeenCalledWith('/sessions/sess-1/complete');
      expect(getSpy).toHaveBeenCalledWith('/sessions/sess-1/diagnostic');
      expect(completeResult).toEqual(MOCK_COMPLETE_SESSION);
      expect(diagnosticResult).toEqual(MOCK_DIAGNOSTIC_REPORT);
    });
  });

  describe('tutorService', () => {
    it('should fetch socratic thread, ask tutor, and reset thread', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: MOCK_SOCRATIC_THREAD });
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          threadId: 't-1',
          questionId: 'q-1',
          turnNumber: 1,
          maxTurnsPerThread: 6,
          remainingTurnsInThread: 5,
          socraticResponse: 'Pense na Lei de Ohm',
          modelUsed: 'gemini-1.5-flash',
          isFallback: false,
        },
      });
      const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({});

      const thread = await tutorService.getSocraticThread('q-1');
      const response = await tutorService.askSocraticTutor('q-1', { message: 'Dúvida' });
      await tutorService.resetSocraticThread('q-1');

      expect(getSpy).toHaveBeenCalledWith('/questions/q-1/chat');
      expect(postSpy).toHaveBeenCalledWith('/questions/q-1/chat', { message: 'Dúvida' });
      expect(deleteSpy).toHaveBeenCalledWith('/questions/q-1/chat');
      expect(thread).toEqual(MOCK_SOCRATIC_THREAD);
      expect(response.socraticResponse).toBe('Pense na Lei de Ohm');
    });
  });

  describe('gamificationService', () => {
    it('should fetch profile, leaderboard, and update daily goal', async () => {
      const getSpy = vi
        .spyOn(apiClient, 'get')
        .mockResolvedValueOnce({ data: MOCK_GAMIFICATION_PROFILE })
        .mockResolvedValueOnce({ data: MOCK_LEADERBOARD });
      const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValueOnce({});

      const profile = await gamificationService.getGamificationProfile();
      const leaderboard = await gamificationService.getWeeklyLeaderboard();
      await gamificationService.updateDailyGoal(10);

      expect(getSpy).toHaveBeenNthCalledWith(1, '/gamification/profile');
      expect(getSpy).toHaveBeenNthCalledWith(2, '/gamification/leaderboard/weekly');
      expect(putSpy).toHaveBeenCalledWith('/gamification/daily-goal', { target: 10 });
      expect(profile).toEqual(MOCK_GAMIFICATION_PROFILE);
      expect(leaderboard).toEqual(MOCK_LEADERBOARD);
    });
  });

  describe('gamificationService profile normalization', () => {
    it('should map the backend profile of a brand-new account without NaN or undefined values', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          userId: 'usr-new',
          level: 1,
          levelTitle: 'Calouro Iniciante',
          currentXp: 0,
          streakDays: 0,
          streakFreezeAvailable: 1,
          dailyGoal: { targetQuestions: 10, completedQuestions: 0 },
          currentLeague: 'BRONZE',
          weeklyXp: 0,
          unlockedBadgesCount: 0,
        },
      });

      const profile = await gamificationService.getGamificationProfile();

      expect(profile.currentStreakDays).toBe(0);
      expect(profile.longestStreakDays).toBe(0);
      expect(profile.dailyGoalTarget).toBe(10);
      expect(profile.dailyGoalProgress).toBe(0);
      expect(profile.streakFreezeAvailable).toBe(true);
      expect(profile.weeklyLeague).toBe('BRONZE');
      expect(profile.unlockedBadges).toEqual([]);
    });

    it('should fall back to safe defaults when the backend omits fields', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { userId: 'usr-empty' } });

      const profile = await gamificationService.getGamificationProfile();

      expect(profile.level).toBe(1);
      expect(profile.currentXp).toBe(0);
      expect(profile.dailyGoalTarget).toBe(10);
      expect(Number.isNaN(profile.dailyGoalProgress)).toBe(false);
    });
  });

  describe('tenantService', () => {
    it('should fetch tenant branding', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: MOCK_TENANT_BRANDING });

      const branding = await tenantService.getTenantBranding('colegio-bandeirantes');

      expect(getSpy).toHaveBeenCalledWith('/tenants/branding', {
        params: { slug: 'colegio-bandeirantes' },
      });
      expect(branding).toEqual(MOCK_TENANT_BRANDING);
    });
  });

  describe('authService', () => {
    it('should login, register, getCurrentUser, export, and deleteAccount', async () => {
      const mockAuthResponse = {
        token: 'test-jwt',
        expiresInSeconds: 3600,
        user: {
          id: 'usr-1',
          email: 'test@example.com',
          name: 'Test',
          roles: ['ROLE_STUDENT' as const],
          isEmailVerified: true,
          createdAt: '2026-10-14T00:00:00Z',
        },
      };

      const postSpy = vi
        .spyOn(apiClient, 'post')
        .mockResolvedValueOnce({ data: mockAuthResponse })
        .mockResolvedValueOnce({ data: mockAuthResponse });

      const getSpy = vi
        .spyOn(apiClient, 'get')
        .mockResolvedValueOnce({ data: mockAuthResponse.user })
        .mockResolvedValueOnce({ data: { userId: 'usr-1', exported: true } });

      const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({});

      await authService.login({ email: 'test@example.com', password: 'Password123!' });
      await authService.register({ email: 'test@example.com', password: 'Password123!', fullName: 'Test' });
      const user = await authService.getCurrentUser();
      const exported = await authService.exportUserData();
      await authService.deleteAccount();

      expect(postSpy).toHaveBeenNthCalledWith(1, '/auth/login', {
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(postSpy).toHaveBeenNthCalledWith(2, '/auth/register', {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test',
      });
      expect(getSpy).toHaveBeenNthCalledWith(1, '/auth/me');
      expect(getSpy).toHaveBeenNthCalledWith(2, '/auth/export');
      expect(deleteSpy).toHaveBeenCalledWith('/auth/me');
      expect(user).toEqual(mockAuthResponse.user);
      expect(exported).toEqual({ userId: 'usr-1', exported: true });
    });

    it('should map frontend schoolType values to backend SchoolType enum on register', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: { userId: 'u-1', email: 'a@b.co', fullName: 'Ana Souza', role: 'ROLE_STUDENT', token: 't' },
      });

      await authService.register({
        email: 'a@b.co',
        password: 'Password@123',
        fullName: 'Ana Souza',
        schoolType: 'PRIVATE_SCHOLARSHIP',
      });
      await authService.register({
        email: 'a@b.co',
        password: 'Password@123',
        fullName: 'Ana Souza',
        schoolType: 'PUBLIC_SCHOOL',
      });

      expect(postSpy).toHaveBeenNthCalledWith(
        1,
        '/auth/register',
        expect.objectContaining({ schoolType: 'PRIVATE_SCHOOL' })
      );
      expect(postSpy).toHaveBeenNthCalledWith(
        2,
        '/auth/register',
        expect.objectContaining({ schoolType: 'PUBLIC_SCHOOL' })
      );
    });

    it('should normalize flat backend RegisterResponse, LoginResponse, and UserResponse payloads', async () => {
      const flatBackendAuthPayload = {
        userId: 'usr-flat-1',
        email: 'beatriz@escola.gov.br',
        fullName: 'Beatriz Silva',
        role: 'ROLE_STUDENT',
        emailVerified: false,
        token: 'flat-jwt-token',
        tokenType: 'Bearer',
        expiresInSeconds: 86400,
      };

      const flatBackendMePayload = {
        id: 'usr-flat-1',
        email: 'beatriz@escola.gov.br',
        fullName: 'Beatriz Silva',
        schoolType: 'PUBLIC_SCHOOL',
        targetDegree: 'Medicina',
        role: 'ROLE_STUDENT',
        emailVerified: true,
        createdAt: '2026-10-22T00:00:00Z',
      };

      vi.spyOn(apiClient, 'post')
        .mockResolvedValueOnce({ data: flatBackendAuthPayload })
        .mockResolvedValueOnce({ data: flatBackendAuthPayload });
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: flatBackendMePayload });

      const registerResult = await authService.register({
        email: 'beatriz@escola.gov.br',
        password: 'Password@123',
        fullName: 'Beatriz Silva',
      });
      const loginResult = await authService.login({
        email: 'beatriz@escola.gov.br',
        password: 'Password@123',
      });
      const meResult = await authService.getCurrentUser();

      expect(registerResult.token).toBe('flat-jwt-token');
      expect(registerResult.user.id).toBe('usr-flat-1');
      expect(registerResult.user.name).toBe('Beatriz Silva');
      expect(registerResult.user.roles).toEqual(['ROLE_STUDENT']);
      expect(registerResult.user.isEmailVerified).toBe(false);

      expect(loginResult.user.id).toBe('usr-flat-1');
      expect(meResult.id).toBe('usr-flat-1');
      expect(meResult.name).toBe('Beatriz Silva');
      expect(meResult.isEmailVerified).toBe(true);
    });
  });

  describe('institutionalService', () => {
    it('should query cohort diagnostics by cohortId', async () => {
      const getSpy = vi
        .spyOn(apiClient, 'get')
        .mockResolvedValueOnce({ data: MOCK_COHORT_DIAGNOSTICS });

      const result = await institutionalService.getCohortDiagnostics('cohort-med-2026');

      expect(getSpy).toHaveBeenCalledWith('/institutional/cohorts/cohort-med-2026/diagnostics');
      expect(result).toEqual(MOCK_COHORT_DIAGNOSTICS);
      expect(result.participationRate).toBe(92.8);
      expect(result.areasBreakdown).toHaveLength(4);
    });
  });
});
