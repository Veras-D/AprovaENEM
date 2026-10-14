import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { examService } from './services/exam.service';
import { tutorService } from './services/tutor.service';
import { gamificationService } from './services/gamification.service';
import { tenantService } from './services/tenant.service';
import type {
  GetQuestionsParams,
  StartSessionRequest,
  SubmitAnswerRequest,
  SocraticChatRequest,
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
  return useQuery({
    queryKey: queryKeys.gamification.profile,
    queryFn: () => gamificationService.getGamificationProfile(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useLeaderboardQuery() {
  return useQuery({
    queryKey: queryKeys.gamification.leaderboard,
    queryFn: () => gamificationService.getWeeklyLeaderboard(),
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
