import { apiClient } from '../client';
import { authService } from './auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  SocraticChatRequest,
  SocraticChatResponse,
  SocraticMessageItemDto,
  SocraticThreadDto,
} from '../types';

interface RawChatMessageDto {
  readonly id?: string;
  readonly role?: string;
  readonly content?: string;
  readonly message?: string;
  readonly timestamp?: string;
  readonly createdAt?: string;
  readonly isFallback?: boolean;
  readonly fallback?: boolean;
}

interface RawThreadDto {
  readonly threadId?: string;
  readonly questionId?: string;
  readonly remainingTurns?: number;
  readonly turnCount?: number;
  readonly maxTurns?: number;
  readonly messages?: readonly RawChatMessageDto[];
}

interface RawTutorChatResponse {
  readonly threadId?: string;
  readonly questionId?: string;
  readonly turnNumber?: number;
  readonly turnCount?: number;
  readonly maxTurnsPerThread?: number;
  readonly maxTurns?: number;
  readonly remainingTurnsInThread?: number;
  readonly socraticResponse?: string;
  readonly message?: string;
  readonly pedagogicalGoal?: string;
  readonly modelUsed?: string;
  readonly isFallback?: boolean;
  readonly fallback?: boolean;
}

function normalizeMessageRole(rawRole?: string): 'user' | 'assistant' {
  if (!rawRole) return 'assistant';
  const upper = rawRole.toUpperCase();
  if (upper === 'USER' || upper === 'STUDENT') {
    return 'user';
  }
  return 'assistant';
}

function hasPremiumJwtClaim(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload) as { role?: string };
    return Boolean(payload.role && payload.role.toUpperCase().includes('PREMIUM'));
  } catch {
    return true;
  }
}

export const tutorService = {
  /**
   * Retrieve active conversation thread for a specific question
   * Target endpoint: GET /api/v1/questions/{id}/chat
   */
  async getSocraticThread(questionId: string): Promise<SocraticThreadDto> {
    const response = await apiClient.get<RawThreadDto>(`/questions/${questionId}/chat`);
    const raw = response.data ?? {};
    const maxTurns = typeof raw.maxTurns === 'number' ? raw.maxTurns : 6;
    const turnCount = typeof raw.turnCount === 'number' ? raw.turnCount : 0;
    const remainingTurns =
      typeof raw.remainingTurns === 'number'
        ? raw.remainingTurns
        : Math.max(0, maxTurns - turnCount);

    const messages: SocraticMessageItemDto[] = Array.isArray(raw.messages)
      ? raw.messages.map((m, idx) => ({
          id: m.id ? String(m.id) : `msg-${idx}`,
          role: normalizeMessageRole(m.role),
          content: String(m.content ?? m.message ?? ''),
          timestamp: m.timestamp ?? m.createdAt ?? new Date().toISOString(),
          ...(m.isFallback !== undefined || m.fallback !== undefined
            ? { isFallback: Boolean(m.isFallback ?? m.fallback) }
            : {}),
        }))
      : [];

    return {
      threadId: String(raw.threadId ?? ''),
      questionId: String(raw.questionId ?? questionId),
      remainingTurns,
      maxTurns,
      messages,
    };
  },

  /**
   * Submit student query turn to Gemini Socratic AI Tutor
   * Target endpoint: POST /api/v1/questions/{id}/chat
   */
  async askSocraticTutor(questionId: string, req: SocraticChatRequest): Promise<SocraticChatResponse> {
    // Ensure Pro students always have a synced JWT with ROLE_PREMIUM_STUDENT claim
    const authState = useAuthStore.getState();
    if (
      authState.user?.roles.includes('ROLE_PREMIUM_STUDENT') &&
      !hasPremiumJwtClaim(authState.token)
    ) {
      try {
        const refreshed = await authService.updatePlan('PRO');
        if (refreshed.token) {
          authState.setAuth(refreshed.token, refreshed.user);
        }
      } catch {
        // Proceed with existing token if auth-service is unreachable
      }
    }

    const response = await apiClient.post<RawTutorChatResponse>(`/questions/${questionId}/chat`, req);
    const raw = response.data ?? {};
    const maxTurns = raw.maxTurnsPerThread ?? raw.maxTurns ?? 6;
    const turnNumber = raw.turnNumber ?? raw.turnCount ?? 1;
    const remainingTurnsInThread =
      typeof raw.remainingTurnsInThread === 'number'
        ? raw.remainingTurnsInThread
        : Math.max(0, maxTurns - turnNumber);
    const isFallback = Boolean(raw.isFallback ?? raw.fallback);

    return {
      threadId: String(raw.threadId ?? ''),
      questionId: String(raw.questionId ?? questionId),
      turnNumber,
      maxTurnsPerThread: maxTurns,
      remainingTurnsInThread,
      socraticResponse: String(raw.socraticResponse ?? raw.message ?? ''),
      pedagogicalGoal: raw.pedagogicalGoal,
      modelUsed: raw.modelUsed ?? (isFallback ? 'static-inep-fallback' : 'gemini-1.5-flash'),
      isFallback,
    };
  },

  /**
   * Reset conversation thread and start fresh
   * Target endpoint: DELETE /api/v1/questions/{id}/chat
   */
  async resetSocraticThread(questionId: string): Promise<void> {
    await apiClient.delete(`/questions/${questionId}/chat`);
  },
};
