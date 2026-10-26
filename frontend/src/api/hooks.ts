import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { examService } from './services/exam.service';
import { tutorService } from './services/tutor.service';
import { gamificationService } from './services/gamification.service';
import { tenantService } from './services/tenant.service';
import { authService } from './services/auth.service';
import { institutionalService } from './services/institutional.service';
import { notificationService } from './services/notification.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import type {
  GetQuestionsParams,
  StartSessionRequest,
  SubmitAnswerRequest,
  SocraticChatRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  RecordActivityRequest,
  ResetPasswordRequest,
  GamificationProfileDto,
  CreateInAppNotificationRequest,
} from './types';

// ============================================================================
// 1. Exam & Practice Session Hooks
// ============================================================================

export function useQuestionsQuery(params?: GetQuestionsParams) {
  return useQuery({
    queryKey: queryKeys.questions.list(params),
    queryFn: () => examService.getQuestions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useQuestionByIdQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.questions.detail(id),
    queryFn: () => examService.getQuestionById(id),
    enabled: Boolean(id),
  });
}

export function useQuestionResolutionQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.questions.resolution(id),
    queryFn: () => examService.getQuestionResolution(id),
    enabled: Boolean(id),
  });
}

export function useCreateSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req?: StartSessionRequest) => examService.startSession(req),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.sessions.detail(data.sessionId), data);
    },
  });
}

export function useSubmitAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, req }: { sessionId: string; req: SubmitAnswerRequest }) =>
      examService.submitAnswer(sessionId, req),
    onSuccess: () => {
      // Invalidate gamification profile to refresh XP & streak
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
    },
  });
}

export function useCompleteSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => examService.completeSession(sessionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.diagnostic(data.sessionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.leaderboard });
    },
  });
}

export function useDiagnosticReportQuery(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessions.diagnostic(sessionId),
    queryFn: () => examService.getDiagnosticReport(sessionId),
    enabled: Boolean(sessionId),
  });
}

// ============================================================================
// 2. Socratic AI Tutor Hooks
// ============================================================================

export function useSocraticThreadQuery(questionId: string) {
  return useQuery({
    queryKey: queryKeys.tutor.thread(questionId),
    queryFn: () => tutorService.getSocraticThread(questionId),
    enabled: Boolean(questionId),
    retry: false, // Don't retry if unauthenticated
  });
}

export function useAskSocraticTutorMutation(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: SocraticChatRequest) => tutorService.askSocraticTutor(questionId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tutor.thread(questionId) });
    },
  });
}

export function useResetSocraticThreadMutation(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => tutorService.resetSocraticThread(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tutor.thread(questionId) });
    },
  });
}

// ============================================================================
// 3. Gamification & Leaderboard Hooks
// ============================================================================

export function useGamificationProfileQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.gamification.profile,
    queryFn: () => gamificationService.getGamificationProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useLeaderboardQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.gamification.leaderboard,
    queryFn: () => gamificationService.getWeeklyLeaderboard(),
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// ============================================================================
// 4. White-Label Multi-Tenant Hooks
// ============================================================================

export function useTenantBrandingQuery(slug?: string) {
  return useQuery({
    queryKey: queryKeys.tenants.branding(slug),
    queryFn: () => tenantService.getTenantBranding(slug),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ============================================================================
// 5. Authentication & LGPD Hooks
// ============================================================================

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (req: AuthLoginRequest) => authService.login(req),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (req: AuthRegisterRequest) => authService.register(req),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
    },
  });
}

export function useRecordActivityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: RecordActivityRequest) => gamificationService.recordActivity(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.leaderboard });
    },
  });
}

export function useCurrentUserQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useExportUserDataMutation() {
  return useMutation({
    mutationFn: () => authService.exportUserData(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data: {
      fullName?: string;
      schoolType?: 'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL';
      targetDegree?: string;
      currentPassword?: string;
      newPassword?: string;
      avatarConfig?: string;
    }) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUpdateDailyGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (target: number) => gamificationService.updateDailyGoal(target),
    onSuccess: (_data, target) => {
      queryClient.setQueryData<GamificationProfileDto | undefined>(
        queryKeys.gamification.profile,
        (old) => (old ? { ...old, dailyGoalTarget: target } : old)
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      clearAuth();
      useSessionStore.getState().clearSession();
      queryClient.removeQueries();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (req: ResetPasswordRequest) => authService.resetPassword(req),
  });
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  const setEmailVerified = useAuthStore((s) => s.setEmailVerified);

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      setEmailVerified(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
}

// ============================================================================
// 6. Institutional Cohort Analytics Hooks
// ============================================================================

export function useCohortDiagnosticsQuery(cohortId?: string) {
  return useQuery({
    queryKey: queryKeys.institutional.cohortDiagnostics(cohortId),
    queryFn: () => institutionalService.getCohortDiagnostics(cohortId || 'cohort-default'),
    enabled: Boolean(cohortId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

// ============================================================================
// 7. Multi-Channel Notification Hooks
// ============================================================================

export function useNotificationsQuery(status: 'ALL' | 'UNREAD' = 'ALL') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.notifications.feed(status),
    queryFn: () => notificationService.getFeed(status),
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}

export function useNotificationUnreadCountQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useCreateInAppNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreateInAppNotificationRequest) => notificationService.createInAppNotification(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}


