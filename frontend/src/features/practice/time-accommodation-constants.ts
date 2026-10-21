import type { TimeAccommodationMode } from '@/types';

export interface TimeAccommodationOption {
  readonly mode: TimeAccommodationMode;
  readonly title: string;
  readonly shortTitle: string;
  readonly timeDescription: string;
  readonly audience: string;
  readonly legalBadge?: string;
}

export const TIME_ACCOMMODATION_OPTIONS: readonly TimeAccommodationOption[] = [
  {
    mode: 'STANDARD',
    title: 'Tempo Padrão ENEM',
    shortTitle: 'Padrão (3 min/q)',
    timeDescription: '3 minutos por questão (180s) com contagem regressiva oficial.',
    audience: 'Condição padrão de realização das provas regulares do ENEM.',
  },
  {
    mode: 'EXTENDED_INEP',
    title: 'Atendimento Especializado INEP (+60 min)',
    shortTitle: 'Estendido (+60 min)',
    timeDescription: '5 minutos por questão (300s) — acréscimo de tempo regulamentar.',
    audience:
      'Garantido a participantes com TDAH, Autismo (TEA), Dislexia, déficit de atenção, baixa visão ou mobilidade reduzida (Lei nº 13.146/2015).',
    legalBadge: 'Edital INEP',
  },
  {
    mode: 'UNTIMED',
    title: 'Modo Sem Limite de Tempo (Livre de Ansiedade)',
    shortTitle: 'Sem Limite',
    timeDescription: 'Cronômetro decorrido progressivo sem contagem regressiva.',
    audience:
      'Projetado para reduzir ansiedade de desempenho, permitir ritmo personalizado de estudo e atender a processamento cognitivo flexível.',
    legalBadge: 'Acessibilidade',
  },
];
