import type {
  QuestionItemDto,
  PaginatedResponse,
  QuestionResolutionDto,
  StartSessionResponse,
  SubmitAnswerResponse,
  CompleteSessionResponse,
  DiagnosticReportDto,
  SocraticThreadDto,
  GamificationProfileDto,
  LeaderboardResponseDto,
  TenantBrandingDto,
  AuthLoginResponse,
} from '../types';
import type { UserProfile } from '@/types';

export const MOCK_QUESTIONS: readonly QuestionItemDto[] = [
  {
    id: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
    year: 2023,
    subject: 'MT',
    discipline: 'Matemática',
    topic: 'Potência e Consumo de Energia',
    itemNumber: 105,
    statement:
      'Um estudante do ensino médio deseja calcular a economia gerada ao substituir lâmpadas incandescentes por lâmpadas LED em sua residência. Considerando que uma lâmpada LED consome 10 W e permanece acesa por 5 horas diárias, determine o consumo mensal (30 dias) em quilowatts-hora (kWh).',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '0,50 kWh' },
      { optionLetter: 'B', text: '1,50 kWh' },
      { optionLetter: 'C', text: '5,00 kWh' },
      { optionLetter: 'D', text: '15,00 kWh' },
      { optionLetter: 'E', text: '50,00 kWh' },
    ],
  },
  {
    id: '88888888-9999-aaaa-bbbb-cccccccccccc',
    year: 2022,
    subject: 'CN',
    discipline: 'Física',
    topic: 'Cinemática e Movimento Uniforme',
    itemNumber: 92,
    statement:
      'Dois veículos partem simultaneamente de cidades separadas por uma distância de 120 km, deslocando-se em sentidos opostos com velocidades constantes de 60 km/h e 40 km/h. Quanto tempo levarão para se encontrar?',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '1,0 hora' },
      { optionLetter: 'B', text: '1,2 horas' },
      { optionLetter: 'C', text: '1,5 horas' },
      { optionLetter: 'D', text: '2,0 horas' },
      { optionLetter: 'E', text: '2,4 horas' },
    ],
  },
];

export const MOCK_PAGINATED_QUESTIONS: PaginatedResponse<QuestionItemDto> = {
  content: MOCK_QUESTIONS,
  page: 0,
  size: 10,
  totalElements: MOCK_QUESTIONS.length,
  totalPages: 1,
};

export const MOCK_RESOLUTION: QuestionResolutionDto = {
  questionId: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
  correctOption: 'B',
  baseExplanation:
    'Consumo = Potência × Tempo = 10 W × 5 h/dia × 30 dias = 1500 Wh = 1,50 kWh. Alternativa correta: B.',
  distractorAnalysis: {
    A: 'Incorreta: Dividiu incorretamente por 3.',
    B: 'Correta: Cálculo exato de 1,50 kWh.',
    C: 'Incorreta: Esqueceu de multiplicar pelos 30 dias do mês.',
    D: 'Incorreta: Erro de potência de 10 na conversão para kWh.',
    E: 'Incorreta: Multiplicação arbitrária.',
  },
  attribution: 'INEP Microdados 2023',
};

export const MOCK_START_SESSION: StartSessionResponse = {
  sessionId: 'session-mock-1234',
  status: 'IN_PROGRESS',
  totalQuestions: 2,
  currentQuestionIndex: 0,
  questions: MOCK_QUESTIONS,
  createdAt: '2026-10-14T10:00:00Z',
};

export const MOCK_SUBMIT_ANSWER: SubmitAnswerResponse = {
  attemptId: 'attempt-mock-5678',
  questionId: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
  selectedOption: 'B',
  correctOption: 'B',
  isCorrect: true,
  baseExplanation: 'Consumo = 1,50 kWh. Parabéns!',
  keyConcepts: 'Potência Elétrica, Energia em kWh',
};

export const MOCK_COMPLETE_SESSION: CompleteSessionResponse = {
  sessionId: 'session-mock-1234',
  status: 'COMPLETED',
  totalQuestions: 2,
  correctCount: 2,
  scorePercentage: 100.0,
  durationSeconds: 180,
  recommendedAction: 'Continue praticando Ciências Humanas e Linguagens!',
};

export const MOCK_DIAGNOSTIC_REPORT: DiagnosticReportDto = {
  id: 'report-mock-9999',
  sessionId: 'session-mock-1234',
  scorePercentage: 100.0,
  topicBreakdown: {
    'Potência Elétrica': { accuracy: 100.0, total: 1, correct: 1, status: 'MASTERED' },
    'Cinemática': { accuracy: 100.0, total: 1, correct: 1, status: 'MASTERED' },
  },
  recommendedTopics: ['Termodinâmica', 'Funções Quadráticas'],
  generatedAt: '2026-10-14T10:05:00Z',
};

export const MOCK_SOCRATIC_THREAD: SocraticThreadDto = {
  threadId: 'thread-mock-1111',
  questionId: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
  remainingTurns: 5,
  maxTurns: 6,
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Como converter Watts em quilowatts-hora?',
      timestamp: '2026-10-14T10:01:00Z',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content:
        'Lembre-se do prefixo "quilo" (k), que representa 1000. Se 1 kW = 1000 W, o que acontece quando você divide a potência total em Watts por 1000?',
      timestamp: '2026-10-14T10:01:02Z',
    },
  ],
};

export const MOCK_GAMIFICATION_PROFILE: GamificationProfileDto = {
  userId: 'usr-123',
  currentXp: 350,
  level: 3,
  levelTitle: 'Calouro Dedicado',
  currentStreakDays: 5,
  longestStreakDays: 14,
  streakFreezeAvailable: true,
  dailyGoalTarget: 5,
  dailyGoalProgress: 3,
  weeklyLeague: 'GOLD',
  unlockedBadges: ['PRIMEIRA_QUESTAO', 'STREAK_3_DIAS', 'MESTRE_MATEMATICA'],
};

export const MOCK_LEADERBOARD: LeaderboardResponseDto = {
  league: 'GOLD',
  resetsAt: '2026-10-18T23:59:59Z',
  entries: [
    { rank: 1, userId: 'usr-1', studentName: 'Beatriz Costa', weeklyXp: 820, isCurrentUser: false },
    { rank: 2, userId: 'usr-123', studentName: 'Lucas Silva', weeklyXp: 350, isCurrentUser: true },
    { rank: 3, userId: 'usr-3', studentName: 'Carlos Souza', weeklyXp: 290, isCurrentUser: false },
  ],
};

export const MOCK_TENANT_BRANDING: TenantBrandingDto = {
  tenantId: 'tenant-bandeirantes',
  slug: 'colegio-bandeirantes',
  name: 'Colégio Bandeirantes',
  shortName: 'Bandeirantes',
  tagline: 'Excelência Acadêmica e Formação Integral',
  logoUrl: '/favicon.svg',
  faviconUrl: '/favicon.svg',
  theme: {
    primaryColor: '#15803d',
    primaryDarkColor: '#166534',
    secondaryColor: '#0f172a',
    accentColor: '#eab308',
    surfaceColor: '#ffffff',
    surfaceDarkColor: '#090d16',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, sans-serif',
  },
  features: {
    socraticAiEnabled: true,
    gamificationEnabled: true,
    leaderboardEnabled: true,
    diagnosticRadarEnabled: true,
    institutionalAnalyticsEnabled: false,
  },
};

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'usr-123',
  email: 'lucas.silva@escola.gov.br',
  name: 'Lucas Silva',
  roles: ['ROLE_STUDENT'],
  isEmailVerified: true,
  createdAt: '2026-09-01T10:00:00Z',
};

export const MOCK_AUTH_LOGIN_RESPONSE: AuthLoginResponse = {
  token: 'mock-jwt-bearer-token-12345',
  expiresInSeconds: 86400,
  user: {
    id: 'usr-123',
    email: 'lucas.silva@escola.gov.br',
    name: 'Lucas Silva',
    roles: ['ROLE_STUDENT'],
    isEmailVerified: true,
    createdAt: '2026-09-01T10:00:00Z',
  },
};

