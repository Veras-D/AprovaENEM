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
      'Um estudante do ensino médio deseja calcular a economia gerada ao substituir lâmpadas incandescentes por lâmpadas LED em sua residência. Considerando que uma lâmpada LED consome $10\\text{ W}$ e permanece acesa por $5\\text{ h}$ diárias, determine o consumo mensal (30 dias) em quilowatts-hora ($1\\text{ kWh} = 1000\\text{ Wh}$):',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '$0{,}50\\text{ kWh}$' },
      { optionLetter: 'B', text: '$1{,}50\\text{ kWh}$' },
      { optionLetter: 'C', text: '$5{,}00\\text{ kWh}$' },
      { optionLetter: 'D', text: '$15{,}00\\text{ kWh}$' },
      { optionLetter: 'E', text: '$50{,}00\\text{ kWh}$' },
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
      'Dois veículos partem simultaneamente de cidades separadas por uma distância de $120\\text{ km}$, deslocando-se em sentidos opostos em uma mesma rodovia retilínea com velocidades constantes de $v_1 = 60\\text{ km/h}$ e $v_2 = 40\\text{ km/h}$. Quanto tempo levarão para se encontrar?',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '$1{,}0\\text{ hora}$' },
      { optionLetter: 'B', text: '$1{,}2\\text{ horas}$' },
      { optionLetter: 'C', text: '$1{,}5\\text{ horas}$' },
      { optionLetter: 'D', text: '$2{,}0\\text{ horas}$' },
      { optionLetter: 'E', text: '$2{,}4\\text{ horas}$' },
    ],
  },
  {
    id: '99999999-aaaa-bbbb-cccc-dddddddddddd',
    year: 2023,
    subject: 'CN',
    discipline: 'Química',
    topic: 'Ligações Intermoleculares e Solubilidade',
    itemNumber: 114,
    statement:
      'A solubilidade de compostos orgânicos em meio aquoso é fortemente governada pela polaridade das ligações e pela formação de ligações de hidrogênio. Observe o diagrama esquemático da interação intermolecular apresentado a seguir:',
    figureUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    figureAltText: 'Diagrama esquemático de interações moleculares em solução aquosa',
    difficulty: 'HARD',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Predomínio de forças dipolo induzido-dipolo induzido (London)' },
      { optionLetter: 'B', text: 'Formação de redes tridimensionais covalentes apolares' },
      { optionLetter: 'C', text: 'Estabelecimento de ligações de hidrogênio entre hidroxilas e água' },
      { optionLetter: 'D', text: 'Ruptura das ligações sigma carbono-oxigênio por solvatação iônica' },
      { optionLetter: 'E', text: 'Neutralização eletrostática através de precipitação salina rápida' },
    ],
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    year: 2023,
    subject: 'CH',
    discipline: 'História do Brasil',
    topic: 'Cidadania e a Constituição de 1988',
    itemNumber: 62,
    contextText:
      'A Constituição da República Federativa do Brasil de 1988, denominada Constituição Cidadã por Ulysses Guimarães, consolidou a transição democrática após duas décadas de regime militar, consagrando o princípio da dignidade da pessoa humana e a universalidade dos direitos sociais.',
    statement:
      'No contexto da história republicana brasileira, a promulgação da Constituição de 1988 representou um marco institucional fundamental porque:',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Restringiu a participação eleitoral a cidadãos alfabetizados e contribuintes' },
      { optionLetter: 'B', text: 'Ampliou as garantias de direitos fundamentais e o acesso universal à saúde pública' },
      { optionLetter: 'C', text: 'Centralizou as prerrogativas orçamentárias exclusivamente no Poder Executivo' },
      { optionLetter: 'D', text: 'Extinguiu os partidos políticos em favor de um sistema bipartidário rígido' },
      { optionLetter: 'E', text: 'Subordinou as decisões do Supremo Tribunal Federal às Forças Armadas' },
    ],
  },
  {
    id: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    year: 2022,
    subject: 'LC',
    discipline: 'Língua Portuguesa e Literatura',
    topic: 'Funções da Linguagem e Modernismo',
    itemNumber: 28,
    contextText:
      '"Sentia a terra fremir, o chão palpitar sob os pés descalços. Sentia a vida crescer em torrentes, rompendo finalmente os diques da indiferença construídos pelo tempo."',
    statement:
      'No fragmento lírico apresentado, a construção expressiva baseada na atribuição de sensações físicas e emocionais à paisagem natural caracteriza o recurso estilístico de:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Prosopopeia ou personificação lírica dos elementos naturais' },
      { optionLetter: 'B', text: 'Paradoxo inconciliável entre o mundo rural e o urbano' },
      { optionLetter: 'C', text: 'Eufemismo atenuador da precariedade do trabalho rural' },
      { optionLetter: 'D', text: 'Metonímia quantitativa desprovida de carga afetiva' },
      { optionLetter: 'E', text: 'Antítese temporal puramente cronológica e descritiva' },
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

export const MOCK_RESOLUTIONS: Record<string, QuestionResolutionDto> = {
  '77777777-8888-9999-aaaa-bbbbbbbbbbbb': MOCK_RESOLUTION,
  '88888888-9999-aaaa-bbbb-cccccccccccc': {
    questionId: '88888888-9999-aaaa-bbbb-cccccccccccc',
    correctOption: 'B',
    baseExplanation:
      'Tempo de encontro: $t = \\frac{d}{v_1 + v_2} = \\frac{120\\text{ km}}{60\\text{ km/h} + 40\\text{ km/h}} = \\frac{120}{100} = 1{,}2\\text{ horas}$. Alternativa correta: B.',
    attribution: 'INEP Microdados 2022',
  },
  '99999999-aaaa-bbbb-cccc-dddddddddddd': {
    questionId: '99999999-aaaa-bbbb-cccc-dddddddddddd',
    correctOption: 'C',
    baseExplanation:
      'A elevada solubilidade do composto orgânico decorre da capacidade dos grupos hidroxila (-OH) formarem ligações de hidrogênio com a água. Alternativa correta: C.',
    attribution: 'INEP Microdados 2023',
  },
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee': {
    questionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    correctOption: 'B',
    baseExplanation:
      'A Carta Magna de 1988 instituiu o Estado Democrático de Direito, universalizou direitos sociais e a previdência, além de criar as bases do Sistema Único de Saúde (SUS). Alternativa correta: B.',
    attribution: 'INEP Microdados 2023',
  },
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff': {
    questionId: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    correctOption: 'A',
    baseExplanation:
      'A atribuição de ações, sentimentos ou características animadas/humanas à terra ("fremir", "palpitar") configura uma prosopopeia ou personificação. Alternativa correta: A.',
    attribution: 'INEP Microdados 2022',
  },
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

