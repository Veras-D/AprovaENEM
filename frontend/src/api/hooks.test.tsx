import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useQuestionsQuery,
  useQuestionByIdQuery,
  useQuestionResolutionQuery,
  useCreateSessionMutation,
  useSubmitAnswerMutation,
  useCompleteSessionMutation,
  useDiagnosticReportQuery,
  useSocraticThreadQuery,
  useAskSocraticTutorMutation,
  useResetSocraticThreadMutation,
  useGamificationProfileQuery,
  useLeaderboardQuery,
  useTenantBrandingQuery,
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useCurrentUserQuery,
  useCohortDiagnosticsQuery,
} from './hooks';
import { examService } from './services/exam.service';
import { tutorService } from './services/tutor.service';
import { gamificationService } from './services/gamification.service';
import { tenantService } from './services/tenant.service';
import { authService } from './services/auth.service';
import { institutionalService } from './services/institutional.service';
import { useAuthStore } from '@/stores/useAuthStore';
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
  MOCK_AUTH_LOGIN_RESPONSE,
  MOCK_USER_PROFILE,
  MOCK_COHORT_DIAGNOSTICS,
} from './mocks/mock-data';

describe('TanStack Query Hooks', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return Wrapper;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useQuestionsQuery should fetch and return paginated questions', async () => {
    vi.spyOn(examService, 'getQuestions').mockResolvedValueOnce(MOCK_PAGINATED_QUESTIONS);

    const { result } = renderHook(() => useQuestionsQuery({ year: 2023 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_PAGINATED_QUESTIONS);
    expect(examService.getQuestions).toHaveBeenCalledWith({ year: 2023 });
  });

  it('useQuestionByIdQuery should fetch single question when ID is provided', async () => {
    vi.spyOn(examService, 'getQuestionById').mockResolvedValueOnce(MOCK_QUESTIONS[0]!);

    const { result } = renderHook(() => useQuestionByIdQuery('q-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_QUESTIONS[0]);
    expect(examService.getQuestionById).toHaveBeenCalledWith('q-123');
  });

  it('useQuestionResolutionQuery should fetch resolution when ID is provided', async () => {
    vi.spyOn(examService, 'getQuestionResolution').mockResolvedValueOnce(MOCK_RESOLUTION);

    const { result } = renderHook(() => useQuestionResolutionQuery('q-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_RESOLUTION);
  });

  it('useCreateSessionMutation should execute startSession and update query data', async () => {
    vi.spyOn(examService, 'startSession').mockResolvedValueOnce(MOCK_START_SESSION);

    const { result } = renderHook(() => useCreateSessionMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ questionCount: 5 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_START_SESSION);
    expect(examService.startSession).toHaveBeenCalledWith({ questionCount: 5 });
  });

  it('useSubmitAnswerMutation should submit answer attempt', async () => {
    vi.spyOn(examService, 'submitAnswer').mockResolvedValueOnce(MOCK_SUBMIT_ANSWER);

    const { result } = renderHook(() => useSubmitAnswerMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      sessionId: 'sess-1',
      req: {
        questionId: 'q-123',
        selectedOption: 'B',
        timeSpentSeconds: 30,
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_SUBMIT_ANSWER);
    expect(examService.submitAnswer).toHaveBeenCalledWith('sess-1', {
      questionId: 'q-123',
      selectedOption: 'B',
      timeSpentSeconds: 30,
    });
  });

  it('useCompleteSessionMutation should complete session and invalidate queries', async () => {
    vi.spyOn(examService, 'completeSession').mockResolvedValueOnce(MOCK_COMPLETE_SESSION);

    const { result } = renderHook(() => useCompleteSessionMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('sess-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_COMPLETE_SESSION);
  });

  it('useDiagnosticReportQuery should fetch diagnostic report', async () => {
    vi.spyOn(examService, 'getDiagnosticReport').mockResolvedValueOnce(MOCK_DIAGNOSTIC_REPORT);

    const { result } = renderHook(() => useDiagnosticReportQuery('sess-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_DIAGNOSTIC_REPORT);
  });

  it('useSocraticThreadQuery should fetch thread', async () => {
    vi.spyOn(tutorService, 'getSocraticThread').mockResolvedValueOnce(MOCK_SOCRATIC_THREAD);

    const { result } = renderHook(() => useSocraticThreadQuery('q-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_SOCRATIC_THREAD);
  });

  it('useAskSocraticTutorMutation and useResetSocraticThreadMutation should interact with tutorService', async () => {
    const mockTutorResponse = {
      threadId: 't-1',
      questionId: 'q-123',
      turnNumber: 1,
      maxTurnsPerThread: 6,
      remainingTurnsInThread: 5,
      socraticResponse: 'Veja a Lei de Ohm',
      modelUsed: 'gemini-1.5-flash',
      isFallback: false,
    };

    vi.spyOn(tutorService, 'askSocraticTutor').mockResolvedValueOnce(mockTutorResponse);
    vi.spyOn(tutorService, 'resetSocraticThread').mockResolvedValueOnce();

    const wrapper = createWrapper();

    const { result: askResult } = renderHook(() => useAskSocraticTutorMutation('q-123'), { wrapper });
    askResult.current.mutate({ message: 'Ajuda' });
    await waitFor(() => expect(askResult.current.isSuccess).toBe(true));
    expect(askResult.current.data).toEqual(mockTutorResponse);

    const { result: resetResult } = renderHook(() => useResetSocraticThreadMutation('q-123'), { wrapper });
    resetResult.current.mutate();
    await waitFor(() => expect(resetResult.current.isSuccess).toBe(true));
  });

  it('useGamificationProfileQuery and useLeaderboardQuery should fetch gamification data', async () => {
    useAuthStore.setState({ isAuthenticated: true, token: 'mock-token', user: MOCK_USER_PROFILE });
    vi.spyOn(gamificationService, 'getGamificationProfile').mockResolvedValueOnce(MOCK_GAMIFICATION_PROFILE);
    vi.spyOn(gamificationService, 'getWeeklyLeaderboard').mockResolvedValueOnce(MOCK_LEADERBOARD);

    const wrapper = createWrapper();

    const { result: profileResult } = renderHook(() => useGamificationProfileQuery(), { wrapper });
    await waitFor(() => expect(profileResult.current.isSuccess).toBe(true));
    expect(profileResult.current.data).toEqual(MOCK_GAMIFICATION_PROFILE);

    const { result: leaderboardResult } = renderHook(() => useLeaderboardQuery(), { wrapper });
    await waitFor(() => expect(leaderboardResult.current.isSuccess).toBe(true));
    expect(leaderboardResult.current.data).toEqual(MOCK_LEADERBOARD);
  });

  it('useTenantBrandingQuery should fetch tenant branding', async () => {
    vi.spyOn(tenantService, 'getTenantBranding').mockResolvedValueOnce(MOCK_TENANT_BRANDING);

    const { result } = renderHook(() => useTenantBrandingQuery('colegio-bandeirantes'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_TENANT_BRANDING);
    expect(tenantService.getTenantBranding).toHaveBeenCalledWith('colegio-bandeirantes');
  });

  it('useLoginMutation and useRegisterMutation should authenticate and update auth store', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce(MOCK_AUTH_LOGIN_RESPONSE);
    vi.spyOn(authService, 'register').mockResolvedValueOnce(MOCK_AUTH_LOGIN_RESPONSE);

    const wrapper = createWrapper();

    const { result: loginResult } = renderHook(() => useLoginMutation(), { wrapper });
    loginResult.current.mutate({ email: 'lucas@escola.gov.br', password: 'password123' });
    await waitFor(() => expect(loginResult.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().token).toBe(MOCK_AUTH_LOGIN_RESPONSE.token);
    expect(useAuthStore.getState().user?.email).toBe(MOCK_AUTH_LOGIN_RESPONSE.user.email);

    const { result: registerResult } = renderHook(() => useRegisterMutation(), { wrapper });
    registerResult.current.mutate({
      fullName: 'Lucas Silva',
      email: 'lucas@escola.gov.br',
      password: 'password123',
    });
    await waitFor(() => expect(registerResult.current.isSuccess).toBe(true));
  });

  it('useForgotPasswordMutation and useResetPasswordMutation should trigger authService methods', async () => {
    vi.spyOn(authService, 'forgotPassword').mockResolvedValueOnce({
      message: 'Instructions dispatched',
      dispatched: true,
    });
    vi.spyOn(authService, 'resetPassword').mockResolvedValueOnce({
      message: 'Password reset',
      success: true,
    });

    const wrapper = createWrapper();

    const { result: forgotResult } = renderHook(() => useForgotPasswordMutation(), { wrapper });
    forgotResult.current.mutate('student@escola.gov.br');
    await waitFor(() => expect(forgotResult.current.isSuccess).toBe(true));
    expect(authService.forgotPassword).toHaveBeenCalledWith('student@escola.gov.br');

    const { result: resetResult } = renderHook(() => useResetPasswordMutation(), { wrapper });
    resetResult.current.mutate({ token: 'tok-123', newPassword: 'NewPassword@2026' });
    await waitFor(() => expect(resetResult.current.isSuccess).toBe(true));
    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'tok-123',
      newPassword: 'NewPassword@2026',
    });
  });

  it('useVerifyEmailMutation and useResendVerificationMutation should call authService', async () => {
    vi.spyOn(authService, 'verifyEmail').mockResolvedValueOnce({
      message: 'Verified',
      isEmailVerified: true,
      verifiedAt: '2026-10-25T01:00:00Z',
    });
    vi.spyOn(authService, 'resendVerification').mockResolvedValueOnce({
      message: 'Sent',
      dispatched: true,
    });

    const wrapper = createWrapper();

    const { result: verifyResult } = renderHook(() => useVerifyEmailMutation(), { wrapper });
    verifyResult.current.mutate('token-abc-123');
    await waitFor(() => expect(verifyResult.current.isSuccess).toBe(true));
    expect(authService.verifyEmail).toHaveBeenCalledWith('token-abc-123');

    const { result: resendResult } = renderHook(() => useResendVerificationMutation(), { wrapper });
    resendResult.current.mutate('student@escola.gov.br');
    await waitFor(() => expect(resendResult.current.isSuccess).toBe(true));
    expect(authService.resendVerification).toHaveBeenCalledWith('student@escola.gov.br');
  });

  it('useCurrentUserQuery should fetch profile when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true, token: 'mock-token', user: MOCK_USER_PROFILE });
    vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(MOCK_USER_PROFILE);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCurrentUserQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_USER_PROFILE);
  });

  it('useCohortDiagnosticsQuery should fetch cohort diagnostic report', async () => {
    vi.spyOn(institutionalService, 'getCohortDiagnostics').mockResolvedValueOnce(MOCK_COHORT_DIAGNOSTICS);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCohortDiagnosticsQuery('cohort-med-2026'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_COHORT_DIAGNOSTICS);
    expect(result.current.data?.totalEnrolledStudents).toBe(42);
  });
});
