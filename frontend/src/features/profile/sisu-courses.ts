/**
 * AprovaENEM — SISU Undergraduate Course Catalog & National Cutoff Benchmarks
 * Authoritative Brazilian SISU/ENEM cutoff score references (Ampla Concorrência averages)
 * and dynamic diagnostic mastery thresholds (Meta de Domínio).
 */

export type AcademicArea = 'SAUDE' | 'EXATAS_TECH' | 'HUMANAS' | 'BIOLOGICAS_AGRO';

export interface SisuCourseConfig {
  readonly id: string;
  readonly name: string;
  readonly area: AcademicArea;
  readonly areaLabel: string;
  readonly averageCutoff: number; // SISU TRI cutoff score (e.g. 805)
  readonly masteryTarget: number; // Diagnostic mastery percentage threshold (e.g. 85.0)
  readonly primaryCompetency: string; // Key ENEM discipline
  readonly description: string;
}

export const ACADEMIC_AREA_LABELS: Record<AcademicArea, string> = {
  SAUDE: 'Ciências da Saúde',
  EXATAS_TECH: 'Exatas & Tecnologia',
  HUMANAS: 'Humanas & Sociais Aplicadas',
  BIOLOGICAS_AGRO: 'Biológicas & Meio Ambiente',
};

export const DEFAULT_MASTERY_TARGET = 70.0;
export const DEFAULT_CUTOFF_SCORE = 700;

export const SISU_COURSES: readonly SisuCourseConfig[] = [
  // 1. Ciências da Saúde
  {
    id: 'medicina',
    name: 'Medicina',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 805,
    masteryTarget: 85.0,
    primaryCompetency: 'Ciências da Natureza & Redação',
    description: 'Curso mais concorrido do Brasil no SISU com peso expressivo em Biologia, Química e Física.',
  },
  {
    id: 'biomedicina',
    name: 'Biomedicina',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 750,
    masteryTarget: 77.0,
    primaryCompetency: 'Ciências da Natureza',
    description: 'Alta concorrência com foco em análises clínicas, microbiologia e pesquisa biológica.',
  },
  {
    id: 'odontologia',
    name: 'Odontologia',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 740,
    masteryTarget: 75.0,
    primaryCompetency: 'Ciências da Natureza',
    description: 'Forte concorrência nas universidades federais com elevada exigência em Natureza.',
  },
  {
    id: 'fisioterapia',
    name: 'Fisioterapia',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 695,
    masteryTarget: 70.0,
    primaryCompetency: 'Ciências da Natureza',
    description: 'Formação em reabilitação física e motora com corte equilibrado na área de saúde.',
  },
  {
    id: 'farmacia',
    name: 'Farmácia',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 690,
    masteryTarget: 69.0,
    primaryCompetency: 'Ciências da Natureza & Química',
    description: 'Formação científica focada no desenvolvimento de medicamentos e imunobiológicos.',
  },
  {
    id: 'nutricao',
    name: 'Nutrição',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 685,
    masteryTarget: 68.0,
    primaryCompetency: 'Ciências da Natureza',
    description: 'Graduação em saúde preventiva, alimentação clínica e saúde coletiva.',
  },
  {
    id: 'enfermagem',
    name: 'Enfermagem',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 675,
    masteryTarget: 67.0,
    primaryCompetency: 'Ciências da Natureza',
    description: 'Pilar do sistema hospitalar e de atenção primária no SUS com ampla demanda.',
  },
  {
    id: 'medicina-veterinaria',
    name: 'Medicina Veterinária',
    area: 'SAUDE',
    areaLabel: ACADEMIC_AREA_LABELS.SAUDE,
    averageCutoff: 670,
    masteryTarget: 67.0,
    primaryCompetency: 'Ciências da Natureza',
    description: 'Cuidados de saúde animal, zootecnia e biossegurança alimentar.',
  },

  // 2. Exatas & Tecnologia
  {
    id: 'engenharia-aeroespacial',
    name: 'Engenharia Aeroespacial / Aeronáutica',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 790,
    masteryTarget: 82.0,
    primaryCompetency: 'Matemática e suas Tecnologias',
    description: 'Uma das engenharias mais disputadas com altíssima nota de corte em Matemática e Física.',
  },
  {
    id: 'ciencia-computacao',
    name: 'Ciência da Computação',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 770,
    masteryTarget: 80.0,
    primaryCompetency: 'Matemática e suas Tecnologias',
    description: 'Crescimento exponencial de demanda impulsionado pelo mercado de IA e desenvolvimento global.',
  },
  {
    id: 'engenharia-computacao',
    name: 'Engenharia de Computação',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 765,
    masteryTarget: 79.0,
    primaryCompetency: 'Matemática e suas Tecnologias',
    description: 'Integração de hardware, arquitetura de sistemas e software de alta performance.',
  },
  {
    id: 'engenharia-mecanica',
    name: 'Engenharia Mecânica',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 730,
    masteryTarget: 74.0,
    primaryCompetency: 'Matemática & Física',
    description: 'Formação em termodinâmica, automação e projetos industriais de grande porte.',
  },
  {
    id: 'engenharia-quimica',
    name: 'Engenharia Química',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 725,
    masteryTarget: 73.0,
    primaryCompetency: 'Química & Matemática',
    description: 'Processos industriais, refino, farmacêutica e sustentabilidade energética.',
  },
  {
    id: 'engenharia-eletrica',
    name: 'Engenharia Elétrica',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 710,
    masteryTarget: 72.0,
    primaryCompetency: 'Matemática & Física',
    description: 'Sistemas elétricos de potência, telecomunicações e microeletrônica.',
  },
  {
    id: 'engenharia-civil',
    name: 'Engenharia Civil',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 700,
    masteryTarget: 70.0,
    primaryCompetency: 'Matemática e suas Tecnologias',
    description: 'Infraestrutura urbana, estruturas, geotecnia e saneamento ambiental.',
  },
  {
    id: 'sistemas-informacao',
    name: 'Sistemas de Informação',
    area: 'EXATAS_TECH',
    areaLabel: ACADEMIC_AREA_LABELS.EXATAS_TECH,
    averageCutoff: 695,
    masteryTarget: 70.0,
    primaryCompetency: 'Matemática e suas Tecnologias',
    description: 'Gestão de tecnologia, análise de dados e arquitetura de software corporativo.',
  },

  // 3. Humanas & Sociais Aplicadas
  {
    id: 'direito',
    name: 'Direito',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 745,
    masteryTarget: 76.0,
    primaryCompetency: 'Ciências Humanas & Redação',
    description: 'Tradicionalmente um dos cursos mais concorridos com alta exigência em argumentação e interpretação.',
  },
  {
    id: 'psicologia',
    name: 'Psicologia',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 735,
    masteryTarget: 75.0,
    primaryCompetency: 'Ciências Humanas & Natureza',
    description: 'Forte busca em universidades federais aliando desenvolvimento humano, cognição e saúde mental.',
  },
  {
    id: 'relacoes-internacionais',
    name: 'Relações Internacionais',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 720,
    masteryTarget: 73.0,
    primaryCompetency: 'Ciências Humanas & Linguagens',
    description: 'Diplomacia, política internacional, comércio exterior e análise geopolítica.',
  },
  {
    id: 'arquitetura-urbanismo',
    name: 'Arquitetura e Urbanismo',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 715,
    masteryTarget: 72.0,
    primaryCompetency: 'Matemática & Humanas',
    description: 'Planejamento urbano, design espacial e patrimônio histórico arquitetônico.',
  },
  {
    id: 'ciencias-economicas',
    name: 'Ciências Econômicas',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 680,
    masteryTarget: 68.0,
    primaryCompetency: 'Matemática & Ciências Humanas',
    description: 'Macroeconomia, mercado financeiro, finanças públicas e econometria.',
  },
  {
    id: 'publicidade-propaganda',
    name: 'Publicidade e Propaganda',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 665,
    masteryTarget: 66.0,
    primaryCompetency: 'Linguagens, Códigos e Redação',
    description: 'Comunicação estratégica, mídia digital, marcas e comportamento do consumidor.',
  },
  {
    id: 'jornalismo',
    name: 'Jornalismo',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 660,
    masteryTarget: 65.0,
    primaryCompetency: 'Linguagens, Códigos e Redação',
    description: 'Investigação jornalística, redação analítica e produção multimídia.',
  },
  {
    id: 'administracao',
    name: 'Administração',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 650,
    masteryTarget: 65.0,
    primaryCompetency: 'Matemática & Humanas',
    description: 'Gestão estratégica de organizações, liderança, operações e empreendedorismo.',
  },
  {
    id: 'ciencias-contabeis',
    name: 'Ciências Contábeis',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 640,
    masteryTarget: 64.0,
    primaryCompetency: 'Matemática e suas Tecnologias',
    description: 'Auditoria fiscal, governança corporativa, finanças e controle orçamentário.',
  },

  // 4. Biológicas, Agro & Licenciaturas
  {
    id: 'ciencias-biologicas',
    name: 'Ciências Biológicas',
    area: 'BIOLOGICAS_AGRO',
    areaLabel: ACADEMIC_AREA_LABELS.BIOLOGICAS_AGRO,
    averageCutoff: 655,
    masteryTarget: 65.0,
    primaryCompetency: 'Ciências da Natureza',
    description: 'Ecologia, biodiversidade brasileira, genética e biologia molecular.',
  },
  {
    id: 'educacao-fisica',
    name: 'Educação Física',
    area: 'BIOLOGICAS_AGRO',
    areaLabel: ACADEMIC_AREA_LABELS.BIOLOGICAS_AGRO,
    averageCutoff: 630,
    masteryTarget: 63.0,
    primaryCompetency: 'Ciências da Natureza & Humanas',
    description: 'Fisiologia do exercício, treinamento esportivo e promoção de saúde coletiva.',
  },
  {
    id: 'historia',
    name: 'História',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 625,
    masteryTarget: 62.0,
    primaryCompetency: 'Ciências Humanas e suas Tecnologias',
    description: 'Compreensão crítica da sociedade, processos históricos e memória cultural.',
  },
  {
    id: 'letras',
    name: 'Letras (Português / Inglês)',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 620,
    masteryTarget: 61.0,
    primaryCompetency: 'Linguagens, Códigos e Redação',
    description: 'Linguística aplicada, literatura clássica e ensino de línguas vernáculas.',
  },
  {
    id: 'pedagogia',
    name: 'Pedagogia',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 610,
    masteryTarget: 60.0,
    primaryCompetency: 'Linguagens & Humanas',
    description: 'Fundamentos da educação infantil, gestão escolar e métodos pedagógicos.',
  },
  {
    id: 'servico-social',
    name: 'Serviço Social',
    area: 'HUMANAS',
    areaLabel: ACADEMIC_AREA_LABELS.HUMANAS,
    averageCutoff: 600,
    masteryTarget: 60.0,
    primaryCompetency: 'Ciências Humanas e suas Tecnologias',
    description: 'Políticas públicas, direitos humanos e cidadania no contexto social brasileiro.',
  },
];

/**
 * Normalizes an input string by stripping accents and non-alphanumeric noise for robust fuzzy matching.
 */
function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Finds a matching course from the SISU catalog.
 * Supports exact IDs, exact names, or partial substring matching (e.g. "Medicina (USP)" -> Medicina).
 */
export function findSisuCourse(degreeString?: string | null): SisuCourseConfig | undefined {
  if (!degreeString || !degreeString.trim()) {
    return undefined;
  }

  const query = normalizeSearchText(degreeString);

  // 1. Direct ID match
  const byId = SISU_COURSES.find((c) => c.id === query);
  if (byId) return byId;

  // 2. Exact normalized name match
  const byExactName = SISU_COURSES.find((c) => normalizeSearchText(c.name) === query);
  if (byExactName) return byExactName;

  // 3. Substring match: query contains course name or vice versa
  return SISU_COURSES.find((c) => {
    const courseNormalized = normalizeSearchText(c.name);
    return query.includes(courseNormalized) || courseNormalized.includes(query);
  });
}

/**
 * Computes the dynamic mastery percentage target for a given degree.
 * If the course is known, returns its custom mastery target; otherwise falls back to standard 70%.
 */
export function getTargetMasteryThreshold(degreeString?: string | null): number {
  const match = findSisuCourse(degreeString);
  return match ? match.masteryTarget : DEFAULT_MASTERY_TARGET;
}

/**
 * Returns the estimated SISU TRI cutoff score for a given degree.
 * Falls back to 700 points if the degree is unlisted or custom.
 */
export function getCourseCutoffScore(degreeString?: string | null): number {
  const match = findSisuCourse(degreeString);
  return match ? match.averageCutoff : DEFAULT_CUTOFF_SCORE;
}
