import type { UserProfile } from '@/types';

/**
 * Starter questions to guide the student conceptually without giving away the direct answer.
 */
export const SOCRATIC_STARTER_PROMPTS = [
  'Qual é o conceito ou lei física/matemática principal desta questão?',
  'Como interpreto os dados fornecidos no enunciado?',
  'Quais relações ou fórmulas devo aplicar no primeiro passo?',
  'Qual é a pegadinha ou distrator mais comum nesse tipo de problema?',
] as const;

/**
 * Calculates remaining time until midnight Brasília Time (BRT: UTC-3).
 * Brazil does not currently observe DST (Daylight Saving Time), remaining at UTC-3 year-round.
 */
export function calculateTimeUntilMidnightBrt(now: Date = new Date()): {
  hours: number;
  minutes: number;
  formatted: string;
} {
  try {
    const brtFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = brtFormatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
    const second = parseInt(parts.find((p) => p.type === 'second')?.value ?? '0', 10);

    const totalSecondsToday = hour * 3600 + minute * 60 + second;
    const totalSecondsInDay = 24 * 3600;
    const remainingSeconds = Math.max(0, totalSecondsInDay - totalSecondsToday);

    const remHours = Math.floor(remainingSeconds / 3600);
    const remMinutes = Math.floor((remainingSeconds % 3600) / 60);

    const formatted = `${String(remHours).padStart(2, '0')}h ${String(remMinutes).padStart(2, '0')}m`;
    return { hours: remHours, minutes: remMinutes, formatted };
  } catch {
    return { hours: 0, minutes: 0, formatted: '00h 00m' };
  }
}

/**
 * Formats an ISO 8601 timestamp string into a friendly HH:mm display.
 */
export function formatMessageTimestamp(timestamp?: string): string {
  if (!timestamp) return '--:--';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

/**
 * Checks if the current authenticated user has Pro or Administrator access.
 */
export function isProOrAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return user.roles.some(
    (role) => role === 'ROLE_PREMIUM_STUDENT' || role === 'ROLE_ADMIN' || role === 'ROLE_INSTITUTIONAL_ADMIN'
  );
}
