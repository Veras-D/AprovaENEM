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
  InstitutionalCohortDiagnosticResponse,
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
  // --- Matemática e suas Tecnologias (MT) ---
  {
    id: '11111111-2222-3333-4444-555555555551',
    year: 2023,
    subject: 'MT',
    discipline: 'Matemática',
    topic: 'Geometria Espacial e Volume',
    itemNumber: 136,
    statement:
      'Um reservatório de água em formato de cilindro circular reto possui raio da base igual a $2\\text{ m}$ e altura de $5\\text{ m}$. Sabendo que $1\\text{ m}^3 = 1000\\text{ litros}$ e adotando $\\pi \\approx 3{,}14$, qual é a capacidade máxima de armazenamento desse reservatório em litros?',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '$15\\,700\\text{ litros}$' },
      { optionLetter: 'B', text: '$31\\,400\\text{ litros}$' },
      { optionLetter: 'C', text: '$62\\,800\\text{ litros}$' },
      { optionLetter: 'D', text: '$125\\,600\\text{ litros}$' },
      { optionLetter: 'E', text: '$314\\,000\\text{ litros}$' },
    ],
  },
  {
    id: '11111111-2222-3333-4444-555555555552',
    year: 2022,
    subject: 'MT',
    discipline: 'Matemática',
    topic: 'Estatística e Medidas de Centralidade',
    itemNumber: 142,
    statement:
      'Em uma turma preparatória para o ENEM com 7 estudantes, as pontuações obtidas em um simulado foram: $640$, $720$, $580$, $810$, $720$, $690$ e $850$. A mediana e a moda desse conjunto de notas são, respectivamente:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '$700\\text{ e } 720$' },
      { optionLetter: 'B', text: '$720\\text{ e } 720$' },
      { optionLetter: 'C', text: '$690\\text{ e } 720$' },
      { optionLetter: 'D', text: '$710\\text{ e } 690$' },
      { optionLetter: 'E', text: '$720\\text{ e } 810$' },
    ],
  },
  {
    id: '11111111-2222-3333-4444-555555555553',
    year: 2021,
    subject: 'MT',
    discipline: 'Matemática',
    topic: 'Função Afim e Modelagem Linear',
    itemNumber: 155,
    statement:
      'Uma empresa de transporte por aplicativo cobra uma tarifa fixa de bandeirada de $R\\$\\ 4{,}50$ mais $R\\$\\ 2{,}20$ por quilômetro rodado. Se um passageiro pagou um total de $R\\$\\ 37{,}50$ por uma corrida, qual foi a distância total percorrida?',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '$12\\text{ km}$' },
      { optionLetter: 'B', text: '$14\\text{ km}$' },
      { optionLetter: 'C', text: '$15\\text{ km}$' },
      { optionLetter: 'D', text: '$17\\text{ km}$' },
      { optionLetter: 'E', text: '$19\\text{ km}$' },
    ],
  },
  {
    id: '11111111-2222-3333-4444-555555555554',
    year: 2023,
    subject: 'MT',
    discipline: 'Matemática',
    topic: 'Probabilidade e Análise Combinatória',
    itemNumber: 168,
    statement:
      'Em uma urna há 12 bolas idênticas numeradas de 1 a 12. Uma bola é sorteada ao acaso. Qual é a probabilidade de que o número sorteado seja um número primo ou um múltiplo de 4?',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: '$1/3$' },
      { optionLetter: 'B', text: '$1/2$' },
      { optionLetter: 'C', text: '$2/3$' },
      { optionLetter: 'D', text: '$3/4$' },
      { optionLetter: 'E', text: '$5/6$' },
    ],
  },

  // --- Ciências da Natureza e suas Tecnologias (CN) ---
  {
    id: '22222222-3333-4444-5555-666666666661',
    year: 2023,
    subject: 'CN',
    discipline: 'Biologia',
    topic: 'Ecologia e Níveis Tróficos',
    itemNumber: 102,
    statement:
      'Em uma teia alimentar aquática continental, o fitoplâncton é consumido pelo zooplâncton, que serve de alimento para pequenos peixes, os quais são predados por peixes carnívoros maiores. Ao longo dessa cadeia trófica, o fluxo de energia disponível entre os níveis tróficos sucessivos:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Aumenta exponencialmente em decorrência do acúmulo de biomassa' },
      { optionLetter: 'B', text: 'Permanece constante em virtude da lei de conservação de massas' },
      { optionLetter: 'C', text: 'Diminui progressivamente em virtude das perdas por respiração e calor' },
      { optionLetter: 'D', text: 'Concentra-se prioritariamente no nível dos carnívoros de topo' },
      { optionLetter: 'E', text: 'Depende exclusivamente da taxa de decomposição abissal bentônica' },
    ],
  },
  {
    id: '22222222-3333-4444-5555-666666666662',
    year: 2022,
    subject: 'CN',
    discipline: 'Física',
    topic: 'Ondulatória e Radiação Eletromagnética',
    itemNumber: 120,
    statement:
      'Um forno micro-ondas opera emitindo radiação eletromagnética na frequência aproximada de $2{,}45\\text{ GHz}$. A razão física pela qual essa radiação aquece rapidamente os alimentos é o fato de:',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Ionizar os átomos de carbono presentes nas cadeias de carboidratos' },
      { optionLetter: 'B', text: 'Entrar em ressonância com o momento dipolar e rotação das moléculas de água' },
      { optionLetter: 'C', text: 'Provocar a fusão dos núcleos atômicos de hidrogênio da gordura animal' },
      { optionLetter: 'D', text: 'Induzir correntes parasitas de Foucault nos lipídios sólidos' },
      { optionLetter: 'E', text: 'Sublimar instantaneamente os sais minerais da matriz orgânica' },
    ],
  },
  {
    id: '22222222-3333-4444-5555-666666666663',
    year: 2021,
    subject: 'CN',
    discipline: 'Química',
    topic: 'Eletroquímica e Potencial de Redução',
    itemNumber: 128,
    statement:
      'O método de proteção catódica por ânodo de sacrifício é amplamente empregado na engenharia naval para proteger o aço dos cascos de navios da corrosão salina. Para exercer adequadamente esse papel protetor em relação ao ferro ($E^0_{\\text{red}} = -0{,}44\\text{ V}$), o metal de sacrifício deve apresentar:',
    difficulty: 'HARD',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Maior densidade volumétrica do que a água marinha' },
      { optionLetter: 'B', text: 'Menor potencial padrão de redução que o ferro, oxidando-se preferencialmente' },
      { optionLetter: 'C', text: 'Maior raio atômico e alta eletronegatividade no período' },
      { optionLetter: 'D', text: 'Inércia total à oxidação em qualquer meio aquoso salino' },
      { optionLetter: 'E', text: 'Ponto de fusão consideravelmente superior ao do aço estrutural' },
    ],
  },

  // --- Ciências Humanas e suas Tecnologias (CH) ---
  {
    id: '33333333-4444-5555-6666-777777777771',
    year: 2022,
    subject: 'CH',
    discipline: 'Geografia',
    topic: 'Urbanização e Segregação Socioespacial',
    itemNumber: 54,
    contextText:
      'A partir da segunda metade do século XX, o intenso processo de industrialização acelerou a migração campo-cidade no Brasil, concentrando contingentes populacionais expressivos nas periferias das grandes metrópoles sem infraestrutura básica correspondente.',
    statement:
      'O processo socioespacial caracterizado por essa expansão urbana desordenada e desprovida de serviços públicos essenciais é denominado:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Desmetropolização induzida' },
      { optionLetter: 'B', text: 'Segregação socioespacial e macrocefalia urbana' },
      { optionLetter: 'C', text: 'Conurbação planejada e sustentável' },
      { optionLetter: 'D', text: 'Gentrificação ruralizada periférica' },
      { optionLetter: 'E', text: 'Êxodo urbano reverso' },
    ],
  },
  {
    id: '33333333-4444-5555-6666-777777777772',
    year: 2023,
    subject: 'CH',
    discipline: 'Filosofia e Sociologia',
    topic: 'Teoria Política e Contratualismo',
    itemNumber: 71,
    contextText:
      '"O homem nasce livre, e por toda parte encontra-se a ferros. O que se crê senhor dos demais não deixa de ser mais escravo do que eles." (Jean-Jacques Rousseau, Do Contrato Social).',
    statement:
      'Para Rousseau, a legitimação da autoridade política e a recuperação da liberdade civil fundamentam-se no conceito de:',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Submissão incondicional à vontade absoluta de um monarca despótico' },
      { optionLetter: 'B', text: 'Exercício da vontade geral e soberania popular inalienável' },
      { optionLetter: 'C', text: 'Preservação irrestrita do estado de natureza individualista' },
      { optionLetter: 'D', text: 'Hereditariedade divina das castas aristocráticas dominantes' },
      { optionLetter: 'E', text: 'Primazia dos interesses corporativos particulares sobre a polis' },
    ],
  },
  {
    id: '33333333-4444-5555-6666-777777777773',
    year: 2021,
    subject: 'CH',
    discipline: 'História Geral',
    topic: 'Imperialismo e Partilha da África',
    itemNumber: 80,
    statement:
      'No final do século XIX, a Conferência de Berlim (1884–1885) consolidou a partilha territorial da África entre as potências colonialistas europeias. Uma consequência histórica direta desse processo foi:',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'O respeito minucioso às fronteiras culturais e étnicas milenares dos povos nativos' },
      { optionLetter: 'B', text: 'O traçado de fronteiras artificiais gerando conflitos étnicos prolongados' },
      { optionLetter: 'C', text: 'A industrialização equânime e autonomia comercial de todos os reinos africanos' },
      { optionLetter: 'D', text: 'O imediato declínio da exploração predatória de recursos minerais' },
      { optionLetter: 'E', text: 'A tutela pacífica mediada por tratados de cooperação horizontal mútua' },
    ],
  },
  {
    id: '33333333-4444-5555-6666-777777777774',
    year: 2022,
    subject: 'CH',
    discipline: 'História do Brasil',
    topic: 'Era Vargas e Direitos Sociais',
    itemNumber: 68,
    statement:
      'Durante o governo de Getúlio Vargas, a criação do Ministério do Trabalho e a posterior consolidação das leis trabalhistas (CLT em 1943) expressavam um projeto político focado em:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Extinguir o controle do Poder Executivo sobre a organização dos trabalhadores' },
      { optionLetter: 'B', text: 'Cooptar a classe trabalhadora urbana por meio de concessões reguladas pelo Estado' },
      { optionLetter: 'C', text: 'Incentivar greves e manifestações anarquistas como motores da república' },
      { optionLetter: 'D', text: 'Universalizar a legislação trabalhista aos trabalhadores do campo imediatamente' },
      { optionLetter: 'E', text: 'Eliminar qualquer tipo de tributação sobre as corporações empresariais' },
    ],
  },

  // --- Linguagens, Códigos e suas Tecnologias (LC) ---
  {
    id: '44444444-5555-6666-7777-888888888881',
    year: 2023,
    subject: 'LC',
    discipline: 'Língua Portuguesa',
    topic: 'Variação Linguística e Preconceito Linguístico',
    itemNumber: 15,
    contextText:
      'A língua portuguesa no Brasil é dinâmica e manifesta-se através de diversas variedades regionais, sociais e etárias, cada qual detentora de lógica interna e plena adequação comunicativa.',
    statement:
      'Com base nos postulados da sociolinguística contemporânea frequentemente avaliados no ENEM, as variedades populares e regionais:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Evidenciam incapacidade analítica e empobrecimento cognitivo de seus falantes' },
      { optionLetter: 'B', text: 'Constituem sistemas linguísticos legítimos com gramática e fonologia estruturadas' },
      { optionLetter: 'C', text: 'Devem ser banidas formalmente dos ambientes escolares e comunitários' },
      { optionLetter: 'D', text: 'Representam meros erros fortuitos decorrentes de descuido na escrita' },
      { optionLetter: 'E', text: 'São inadequadas para a expressão literária, musical ou poética' },
    ],
  },
  {
    id: '44444444-5555-6666-7777-888888888882',
    year: 2023,
    subject: 'LC',
    discipline: 'Literatura e Artes',
    topic: 'Modernismo e Antropofagia',
    itemNumber: 22,
    contextText:
      '"Tupi or not tupi that is the question. (...) Só a Antropofagia nos une. Socialmente. Economicamente. Filosoficamente." (Oswald de Andrade, Manifesto Antropófago).',
    statement:
      'A metáfora antropofágica proposta pela vanguarda modernista brasileira da década de 1920 preconizava:',
    difficulty: 'MEDIUM',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'A recusa xenofóbica de todas as influências culturais estrangeiras' },
      { optionLetter: 'B', text: 'A deglutição crítica da cultura europeia reelaborada com a identidade nacional' },
      { optionLetter: 'C', text: 'A imitação fiel e submissa do academicismo parnasiano francês' },
      { optionLetter: 'D', text: 'O retorno idílico e ingênuo ao romantismo indianista oitocentista' },
      { optionLetter: 'E', text: 'A negação do papel da linguagem na transformação da sociedade' },
    ],
  },
  {
    id: '44444444-5555-6666-7777-888888888883',
    year: 2022,
    subject: 'LC',
    discipline: 'Língua Portuguesa',
    topic: 'Gêneros Digitais e Intertextualidade',
    itemNumber: 35,
    statement:
      'Os memes de internet consolidaram-se como um gênero textual híbrido e amplamente compartilhado. O sucesso comunicativo desse gênero decorre principalmente da:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Rigorosa subserviência às regras do registro formal da gramática normativa' },
      { optionLetter: 'B', text: 'Mobilização de repertório sociocultural compartilhado e intertextualidade' },
      { optionLetter: 'C', text: 'Completa rejeição a trocadilhos ou ambiguidades semânticas polissêmicas' },
      { optionLetter: 'D', text: 'Exigência de validação prévia por autoridades acadêmicas certificadas' },
      { optionLetter: 'E', text: 'Utilização estrita de linguagem verbal desprovida de qualquer signo visual' },
    ],
  },
  {
    id: '44444444-5555-6666-7777-888888888884',
    year: 2021,
    subject: 'LC',
    discipline: 'Língua Portuguesa',
    topic: 'Coesão Referencial e Argumentação',
    itemNumber: 41,
    statement:
      'Em um texto dissertativo-argumentativo padrão ENEM, os operadores argumentativos desempenham a função de:',
    difficulty: 'EASY',
    status: 'ACTIVE',
    options: [
      { optionLetter: 'A', text: 'Substituir a necessidade de argumentos concretos ou evidências científicas' },
      { optionLetter: 'B', text: 'Encadear ideias estabelecendo relações lógicas de causa, oposição e conclusão' },
      { optionLetter: 'C', text: 'Camuflar propositalmente falhas no raciocínio dialético do candidato' },
      { optionLetter: 'D', text: 'Reduzir a complexidade sintática dos parágrafos de desenvolvimento' },
      { optionLetter: 'E', text: 'Neutralizar a expressividade opinativa para torná-lo um mero relato jornalístico' },
    ],
  },
];

export const MOCK_PAGINATED_QUESTIONS: PaginatedResponse<QuestionItemDto> = {
  content: MOCK_QUESTIONS,
  page: 0,
  size: 10,
  totalElements: MOCK_QUESTIONS.length,
  totalPages: Math.ceil(MOCK_QUESTIONS.length / 10),
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
    distractorAnalysis: {
      A: 'Incorreta: Falácia de subtração de velocidades ou cálculo incompleto ($120/120 = 1{,}0\\text{ h}$).',
      B: 'Correta: Velocidade relativa de aproximação $v_{\\text{rel}} = 60 + 40 = 100\\text{ km/h}$; portanto $t = 120/100 = 1{,}2\\text{ h}$.',
      C: 'Incorreta: Média aritmética simples de tempos sem considerar a conservação do deslocamento.',
      D: 'Incorreta: Considerou apenas o veículo mais rápido ($120/60 = 2{,}0\\text{ h}$), ignorando o deslocamento simultâneo do segundo.',
      E: 'Incorreta: Multiplicou o tempo correto por 2 arbitrariamente.',
    },
    attribution: 'INEP Microdados 2022',
  },
  '99999999-aaaa-bbbb-cccc-dddddddddddd': {
    questionId: '99999999-aaaa-bbbb-cccc-dddddddddddd',
    correctOption: 'C',
    baseExplanation:
      'A elevada solubilidade do composto orgânico decorre da capacidade dos grupos hidroxila (-OH) formarem ligações de hidrogênio com as moléculas de água. Alternativa correta: C.',
    distractorAnalysis: {
      A: 'Incorreta: Forças de London (dipolo induzido) são fracas e predominam em hidrocarbonetos e compostos apolares.',
      B: 'Incorreta: Redes covalentes tridimensionais caracterizam sólidos macromoleculares insolúveis como o diamante.',
      C: 'Correta: Os pares de elétrons livres e hidrogênios polarizados da hidroxila interagem fortemente com a água por ligações de hidrogênio.',
      D: 'Incorreta: Não ocorre quebra de ligação sigma C-O por solvatação em moléculas neutras.',
      E: 'Incorreta: Não há espécie iônica precipitante na interação intermolecular apresentada.',
    },
    attribution: 'INEP Microdados 2023',
  },
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee': {
    questionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    correctOption: 'B',
    baseExplanation:
      'A Carta Magna de 1988 instituiu o Estado Democrático de Direito, universalizou direitos sociais e a previdência, além de criar as bases do Sistema Único de Saúde (SUS). Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: A CF/88 estendeu o direito de voto aos analfabetos (art. 14, § 1º, II, a), ampliando a cidadania.',
      B: 'Correta: Consolidou garantias fundamentais inalienáveis, seguridade social universal e a criação do SUS.',
      C: 'Incorreta: A CF/88 descentralizou o orçamento e fortaleceu a fiscalização pelo Congresso Nacional e TCU.',
      D: 'Incorreta: A CF/88 consagrou expressamente o princípio do pluralismo político e partidário (art. 1º, V).',
      E: 'Incorreta: O texto constitucional subordina as Forças Armadas à autoridade suprema da Presidência civil.',
    },
    attribution: 'INEP Microdados 2023',
  },
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff': {
    questionId: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    correctOption: 'A',
    baseExplanation:
      'A atribuição de ações, sentimentos ou características animadas/humanas à terra ("fremir", "palpitar") configura uma prosopopeia ou personificação. Alternativa correta: A.',
    distractorAnalysis: {
      A: 'Correta: A personificação atribui comportamentos orgânicos e vitais a elementos inanimados da paisagem.',
      B: 'Incorreta: O trecho não estabelece uma contradição lógica conceitual insolúvel (paradoxo).',
      C: 'Incorreta: Não há atenuação de termo desagradável ou chocante (eufemismo), mas sim exaltação sensorial.',
      D: 'Incorreta: A figuração não se baseia em relação de contiguidade parte/todo sem carga expressiva.',
      E: 'Incorreta: A construção é figurativa e afetiva, não uma mera antítese cronológica descritiva.',
    },
    attribution: 'INEP Microdados 2022',
  },
  '11111111-2222-3333-4444-555555555551': {
    questionId: '11111111-2222-3333-4444-555555555551',
    correctOption: 'C',
    baseExplanation:
      'Volume do cilindro: $V = \\pi r^2 h = 3{,}14 \\times (2)^2 \\times 5 = 3{,}14 \\times 4 \\times 5 = 62{,}8\\text{ m}^3$. Como $1\\text{ m}^3 = 1000\\text{ L}$, a capacidade é $62{,}8 \\times 1000 = 62\\,800\\text{ litros}$. Alternativa correta: C.',
    distractorAnalysis: {
      A: 'Incorreta: Erro no cálculo da área da base, esquecendo de elevar o raio ao quadrado ($3{,}14 \\times 2 \\times 5 = 31{,}4$, depois dividido por 2).',
      B: 'Incorreta: Considerou apenas o raio linearmente sem elevar ao quadrado ($3{,}14 \\times 2 \\times 5 = 31{,}4\\text{ m}^3 = 31\\,400\\text{ L}$).',
      C: 'Correta: Cálculo correto da área da base multiplicada pela altura ($62{,}8\\text{ m}^3$) e conversão em litros ($62\\,800\\text{ L}$).',
      D: 'Incorreta: Multiplicou pelo diâmetro ao quadrado em vez do raio ao quadrado.',
      E: 'Incorreta: Confundiu a altura ou aplicou fator de escala decimal equivocado.',
    },
    attribution: 'INEP Microdados 2023',
  },
  '11111111-2222-3333-4444-555555555552': {
    questionId: '11111111-2222-3333-4444-555555555552',
    correctOption: 'B',
    baseExplanation:
      'Ordenando o rol em ordem crescente: 580, 640, 690, 720, 720, 810, 850. O termo central (4º elemento de 7) é 720 (mediana). O valor mais frequente é 720 (moda). Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: Calculou uma média aproximada em vez da mediana do rol ordenado.',
      B: 'Correta: Mediana é o elemento central do rol ordenado (720) e a moda é o valor com maior frequência (720).',
      C: 'Incorreta: Tomou o 3º elemento do rol como mediana.',
      D: 'Incorreta: Inverteu os conceitos de mediana e tomou 690 como moda.',
      E: 'Incorreta: Apontou a nota máxima como moda.',
    },
    attribution: 'INEP Microdados 2022',
  },
  '11111111-2222-3333-4444-555555555553': {
    questionId: '11111111-2222-3333-4444-555555555553',
    correctOption: 'C',
    baseExplanation:
      'Equação do custo total: $C(x) = 4{,}50 + 2{,}20x$. Substituindo $C(x) = 37{,}50$: $2{,}20x = 37{,}50 - 4{,}50 = 33{,}00 \\implies x = 33 / 2{,}20 = 15\\text{ km}$. Alternativa correta: C.',
    distractorAnalysis: {
      A: 'Incorreta: Erro aritmético na divisão por 2,20.',
      B: 'Incorreta: Subtraiu a bandeirada incorretamente antes de dividir.',
      C: 'Correta: Subtração da taxa inicial ($37{,}50 - 4{,}50 = 33{,}00$) e divisão pelo valor por quilômetro ($33 / 2{,}2 = 15\\text{ km}$).',
      D: 'Incorreta: Somou a bandeirada em vez de subtrair.',
      E: 'Incorreta: Dividiu diretamente 37,50 por 2,20 ignorando a bandeirada fixa.',
    },
    attribution: 'INEP Microdados 2021',
  },
  '11111111-2222-3333-4444-555555555554': {
    questionId: '11111111-2222-3333-4444-555555555554',
    correctOption: 'C',
    baseExplanation:
      'Números primos entre 1 e 12: {2, 3, 5, 7, 11} (5 números). Múltiplos de 4 entre 1 e 12: {4, 8, 12} (3 números). Como esses conjuntos são disjuntos, a união possui $5 + 3 = 8$ elementos. Probabilidade: $8/12 = 2/3$. Alternativa correta: C.',
    distractorAnalysis: {
      A: 'Incorreta: Considerou apenas os múltiplos de 4 ($3/12 = 1/4$) ou apenas primos pares.',
      B: 'Incorreta: Considerou o número 1 como primo indevidamente ou esqueceu números primos da contagem.',
      C: 'Correta: Soma dos casos favoráveis disjuntos ($5 + 3 = 8$) sobre o total de 12 possibilidades ($8/12 = 2/3$).',
      D: 'Incorreta: Contou números compostos adicionais na união.',
      E: 'Incorreta: Superestimou os elementos favoráveis considerando números ímpares não primos.',
    },
    attribution: 'INEP Microdados 2023',
  },
  '22222222-3333-4444-5555-666666666661': {
    questionId: '22222222-3333-4444-5555-666666666661',
    correctOption: 'C',
    baseExplanation:
      'De acordo com a 2ª Lei da Termodinâmica aplicada à ecologia, a energia flui unidirecionalmente e decresce a cada nível trófico sucessivo, pois cerca de 90% da energia é dissipada na forma de calor e processos metabólicos. Alternativa correta: C.',
    distractorAnalysis: {
      A: 'Incorreta: O fluxo energético é sempre decrescente; quem pode se acumular é a biomassa em pirâmides invertidas marinhas pontuais ou poluentes (bioacumulação).',
      B: 'Incorreta: A energia não se conserva integralmente na forma aproveitável pelos seres vivos, dissipando-se como calor.',
      C: 'Correta: Apenas cerca de 10% da energia de um nível trófico é transferida para o nível seguinte, havendo decréscimo progressivo.',
      D: 'Incorreta: Os carnívoros de topo recebem a menor quantidade absoluta de energia transferida na cadeia.',
      E: 'Incorreta: O fluxo energético independe exclusivamente do ambiente bentônico abissal.',
    },
    attribution: 'INEP Microdados 2023',
  },
  '22222222-3333-4444-5555-666666666662': {
    questionId: '22222222-3333-4444-5555-666666666662',
    correctOption: 'B',
    baseExplanation:
      'As micro-ondas de 2,45 GHz interagem com as moléculas polares de água, que tentam se alinhar com a oscilação do campo elétrico da onda. Esse atrito e movimento rotacional geram calor por efeito dielétrico. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: Micro-ondas são radiações não ionizantes; não possuem energia suficiente para arrancar elétrons de átomos de carbono.',
      B: 'Correta: O aquecimento ocorre pela agitação rotacional forçada das moléculas polares de água devido ao campo eletromagnético alternado.',
      C: 'Incorreta: Não ocorrem reações nucleares de fusão em eletrodomésticos.',
      D: 'Incorreta: Correntes de Foucault ocorrem por indução magnética em condutores metálicos (como em fogões de indução), não em lipídios.',
      E: 'Incorreta: Sais minerais não sofrem sublimação instantânea nessa faixa de frequência e temperatura.',
    },
    attribution: 'INEP Microdados 2022',
  },
  '22222222-3333-4444-5555-666666666663': {
    questionId: '22222222-3333-4444-5555-666666666663',
    correctOption: 'B',
    baseExplanation:
      'Para atuar como ânodo de sacrifício, o metal deve oxidar-se preferencialmente ao ferro. Para isso, ele deve apresentar maior facilidade de oxidação, o que corresponde a um menor potencial padrão de redução ($E^0_{\\text{red}}$) do que o ferro (por exemplo, zinco ou magnésio). Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: A densidade do material não determina sua espontaneidade de oxirredução.',
      B: 'Correta: O metal de sacrifício deve possuir menor potencial de redução que o ferro para atuar como ânodo e ser oxidado primeiro.',
      C: 'Incorreta: Metais com alta eletronegatividade tendem a reter elétrons e sofrer redução, não oxidação.',
      D: 'Incorreta: Se o metal fosse inerte, não sacrificaria elétrons para manter o ferro na forma reduzida.',
      E: 'Incorreta: O ponto de fusão não tem relação com o potencial eletroquímico de corrosão.',
    },
    attribution: 'INEP Microdados 2021',
  },
  '33333333-4444-5555-6666-777777777771': {
    questionId: '33333333-4444-5555-6666-777777777771',
    correctOption: 'B',
    baseExplanation:
      'O rápido e desordenado crescimento demográfico nas metrópoles brasileiras, decorrente do êxodo rural sem planejamento habitacional ou saneamento, provocou a segregação socioespacial (divisão desigual da cidade entre áreas ricas e periferias desprovidas) e macrocefalia urbana. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: O processo descrito foi de concentração metropolitana (metropolização), e não desmetropolização.',
      B: 'Correta: A ocupação periférica precária decorrente da industrialização acelerada gera segregação espacial e macrocefalia.',
      C: 'Incorreta: A urbanização periférica não foi planejada nem ecologicamente sustentável.',
      D: 'Incorreta: Gentrificação é a valorização e expulsão de populações de baixa renda de áreas centrais, não a expansão periférica ruralizada.',
      E: 'Incorreta: Houve êxodo rural maciço em direção às cidades, e não o inverso.',
    },
    attribution: 'INEP Microdados 2022',
  },
  '33333333-4444-5555-6666-777777777772': {
    questionId: '33333333-4444-5555-6666-777777777772',
    correctOption: 'B',
    baseExplanation:
      'Jean-Jacques Rousseau estabelece que a legitimidade do pacto social decorre da vontade geral, em que a soberania emana exclusivamente do povo (soberania popular inalienável), garantindo a liberdade e a igualdade civil. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: Rousseau é frontalmente contrário ao absolutismo e à tirania monárquica.',
      B: 'Correta: A vontade geral expressa o bem comum e fundamenta a soberania popular inalienável no Contrato Social.',
      C: 'Incorreta: O estado de natureza é superado pelo pacto social para instituir a liberdade civil guiada pela lei legítima.',
      D: 'Incorreta: Rousseau rejeita privilégios hereditários e hierarquias aristocráticas tradicionais.',
      E: 'Incorreta: A vontade geral distingue-se da vontade de todos justamente por transcender os interesses particulares egoístas.',
    },
    attribution: 'INEP Microdados 2023',
  },
  '33333333-4444-5555-6666-777777777773': {
    questionId: '33333333-4444-5555-6666-777777777773',
    correctOption: 'B',
    baseExplanation:
      'A Conferência de Berlim partilhou a África sem qualquer consideração pelas realidades culturais, históricas e linguísticas locais, traçando fronteiras artificiais com régua e esquadro que geraram conflitos civis e instabilidade prolongada. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: As potências imperialistas ignoraram categoricamente os limites territoriais das comunidades tradicionais africanas.',
      B: 'Correta: O traçado artificial de fronteiras uniu etnias antagônicas sob o mesmo domínio e separou povos com laços culturais idênticos.',
      C: 'Incorreta: A dominação colonial impediu o desenvolvimento industrial autóctone e subordinou as economias à exportação de commodities.',
      D: 'Incorreta: A exploração colonial e extrativista intensificou-se drasticamente após a conferência.',
      E: 'Incorreta: A relação foi de dominação colonial coercitiva violenta, e não de cooperação horizontal mútua.',
    },
    attribution: 'INEP Microdados 2021',
  },
  '33333333-4444-5555-6666-777777777774': {
    questionId: '33333333-4444-5555-6666-777777777774',
    correctOption: 'B',
    baseExplanation:
      'O corporativismo varguista combinava concessões reais à classe trabalhadora (jornada de trabalho, férias remuneradas, salário mínimo) com estrito controle estatal sobre os sindicatos (através da carta sindical e imposto sindical), neutralizando a mobilização autônoma de oposição. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: Vargas enquadrou e reprimiu sindicatos de vertente anarquista ou comunista, atrelando os sindicatos ao Ministério do Trabalho.',
      B: 'Correta: O trabalhismo varguista caracterizou-se pela outorga controlada de direitos associada à subordinação dos sindicatos ao Estado.',
      C: 'Incorreta: O Estado varguista era fortemente centralizador e intervencionista nas relações de produção e trabalho.',
      D: 'Incorreta: Os trabalhadores rurais só obtiveram direitos trabalhistas equivalentes décadas depois com o Estatuto do Trabalhador Rural (1963).',
      E: 'Incorreta: Vargas manteve a arrecadação tributária e promoveu a industrialização substitutiva de importações em parceria com o capital nacional.',
    },
    attribution: 'INEP Microdados 2022',
  },
  '44444444-5555-6666-7777-888888888881': {
    questionId: '44444444-5555-6666-7777-888888888881',
    correctOption: 'B',
    baseExplanation:
      'Para a linguística contemporânea, não há variedade linguística errada ou inferior; todas as variedades idiomáticas (inclusive as dialetais e populares) possuem regularidades sintáticas, morfológicas e fonológicas consistentes, cumprindo plenamente seus propósitos comunicativos. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: Trata-se de preconceito linguístico infundado refutado pela linguística científica.',
      B: 'Correta: As variações linguísticas constituem manifestações legítimas e dotadas de coerência estrutural interna.',
      C: 'Incorreta: A escola deve ensinar a norma-padrão como ampliação de repertório sem banir ou estigmatizar as variedades de origem dos alunos.',
      D: 'Incorreta: A variação não é erro acidental, mas fruto de fenômenos regulares e históricos da evolução da língua.',
      E: 'Incorreta: A literatura e a música brasileira (ex: Guimarães Rosa, Patativa do Assaré, rap) utilizam amplamente a riqueza das variedades regionais.',
    },
    attribution: 'INEP Microdados 2023',
  },
  '44444444-5555-6666-7777-888888888882': {
    questionId: '44444444-5555-6666-7777-888888888882',
    correctOption: 'B',
    baseExplanation:
      'O conceito de Antropofagia, formulado por Oswald de Andrade no Modernismo, consistia metaforicamente em devorar criticamente as influências culturais estrangeiras (como as vanguardas europeias) e sintetizá-las para criar uma arte autêntica e profundamente brasileira. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: O modernismo antropofágico não recusava influências externas, mas sim as assimilava ativamente.',
      B: 'Correta: A metáfora defendia a deglutição e reinterpretação crítica das referências europeias sob a ótica nacional.',
      C: 'Incorreta: O modernismo de 1922 combatia justamente a cópia servil dos modelos clássicos e parnasianos.',
      D: 'Incorreta: A antropofagia satirizava a visão idealizada e romântica do indígena como bom selvagem europeizado.',
      E: 'Incorreta: Os modernistas viam a renovação da linguagem poética como fator indissociável da transformação sociocultural.',
    },
    attribution: 'INEP Microdados 2023',
  },
  '44444444-5555-6666-7777-888888888883': {
    questionId: '44444444-5555-6666-7777-888888888883',
    correctOption: 'B',
    baseExplanation:
      'O meme opera pela intertextualidade e pela apropriação de fatos cotidianos, imagens icônicas e referências populares. O efeito de sentido só se concretiza quando emissor e receptor compartilham desse repertório cultural comum. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: Os memes costumam utilizar linguagem coloquial, gírias e transgressões gramaticais com finalidade expressiva e cômica.',
      B: 'Correta: A compreensão e o engajamento com o meme dependem de referências intertextuais e conhecimentos prévios partilhados pelos interlocutores.',
      C: 'Incorreta: A intertextualidade e a paródia de imagens preexistentes são elementos fundantes do gênero.',
      D: 'Incorreta: O meme é um gênero livre, colaborativo e de rápida difusão horizontal nas redes, sem chancela acadêmica prévia.',
      E: 'Incorreta: Os memes são textos multimodais que combinam signos visuais (imagens, vídeos) e texto verbal.',
    },
    attribution: 'INEP Microdados 2022',
  },
  '44444444-5555-6666-7777-888888888884': {
    questionId: '44444444-5555-6666-7777-888888888884',
    correctOption: 'B',
    baseExplanation:
      'Os operadores argumentativos são conjunções e locuções que estruturam a coesão sequencial de um texto argumentativo, sinalizando relações lógicas indispensáveis (consequência, concessão, adversidade, adição) para a progressão textual coerente. Alternativa correta: B.',
    distractorAnalysis: {
      A: 'Incorreta: Os conectivos articulam os argumentos, mas não substituem os dados e evidências constitutivos da tese.',
      B: 'Correta: Operadores argumentativos encadeiam orações e parágrafos explicitando a orientação lógica e semântica da argumentação.',
      C: 'Incorreta: A clareza lógica e a precisão dos conectivos evitam a obscuridade e fundamentam a defesa da tese.',
      D: 'Incorreta: O papel do conectivo é sintático-semântico de ligação, e não métrico de redução de caracteres.',
      E: 'Incorreta: Os conectores delimitam com precisão as relações hierárquicas entre tese, argumentos e contra-argumentos.',
    },
    attribution: 'INEP Microdados 2021',
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
  studentName: 'Lucas Silva',
  scorePercentage: 78.5,
  radar: [
    {
      knowledgeArea: 'MT',
      areaName: 'Matemática e suas Tecnologias',
      scorePercentage: 85.0,
      totalQuestions: 20,
      correctQuestions: 17,
      masteryLevel: 'MASTERED',
      topWeakTopic: 'Análise Combinatória',
    },
    {
      knowledgeArea: 'CN',
      areaName: 'Ciências da Natureza e suas Tecnologias',
      scorePercentage: 70.0,
      totalQuestions: 20,
      correctQuestions: 14,
      masteryLevel: 'MASTERED',
      topWeakTopic: 'Circuitos e Eletrodinâmica',
    },
    {
      knowledgeArea: 'CH',
      areaName: 'Ciências Humanas e suas Tecnologias',
      scorePercentage: 65.0,
      totalQuestions: 20,
      correctQuestions: 13,
      masteryLevel: 'ATTENTION_NEEDED',
      topWeakTopic: 'Brasil Colônia e Economia Açucareira',
    },
    {
      knowledgeArea: 'LC',
      areaName: 'Linguagens, Códigos e suas Tecnologias',
      scorePercentage: 90.0,
      totalQuestions: 20,
      correctQuestions: 18,
      masteryLevel: 'MASTERED',
      topWeakTopic: 'Variação Linguística e Figuras de Linguagem',
    },
  ],
  topicBreakdown: {
    'Potência Elétrica': { accuracy: 100.0, total: 5, correct: 5, status: 'MASTERED' },
    'Cinemática': { accuracy: 80.0, total: 5, correct: 4, status: 'MASTERED' },
    'Cidadania e Direitos': { accuracy: 60.0, total: 5, correct: 3, status: 'ATTENTION_NEEDED' },
    'Interpretação Textual': { accuracy: 90.0, total: 5, correct: 4, status: 'MASTERED' },
  },
  recommendedTopics: ['Brasil Colônia', 'Análise Combinatória', 'Circuitos e Eletrodinâmica'],
  generatedAt: '2026-10-14T10:05:00Z',
};

export const MOCK_COHORT_DIAGNOSTICS: InstitutionalCohortDiagnosticResponse = {
  cohortId: 'cohort-med-2026',
  cohortName: '3º Ano EM - Turma Medicina',
  tenantId: 'tenant-aprovaenem',
  totalEnrolledStudents: 42,
  activeParticipants: 39,
  participationRate: 92.8,
  averageScorePercentage: 74.5,
  areasBreakdown: [
    {
      subjectArea: 'MATHEMATICS',
      areaName: 'Matemática e suas Tecnologias',
      averageScorePercentage: 68.2,
      status: 'ATTENTION_NEEDED',
      topWeakTopic: 'Funções Trigonométricas',
    },
    {
      subjectArea: 'NATURAL_SCIENCES',
      areaName: 'Ciências da Natureza',
      averageScorePercentage: 71.0,
      status: 'MASTERED',
      topWeakTopic: 'Termodinâmica e Calorimetria',
    },
    {
      subjectArea: 'HUMANITIES',
      areaName: 'Ciências Humanas',
      averageScorePercentage: 82.4,
      status: 'MASTERED',
      topWeakTopic: 'Cidadania e Direitos no Brasil República',
    },
    {
      subjectArea: 'LANGUAGES',
      areaName: 'Linguagens e Códigos',
      averageScorePercentage: 76.5,
      status: 'MASTERED',
      topWeakTopic: 'Variação Linguística e Norma Culta',
    },
  ],
  commonDistractorPitfalls: [
    {
      questionId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      questionTitle: 'ENEM 2023 - Física / Dinâmica Circular',
      correctOption: 'C',
      misleadingOption: 'B',
      failedPercentage: 46.2,
      pedagogicalExplanation:
        'Confusão frequente entre aceleração centrípeta e aceleração tangencial decorrente da leitura desatenta do raio de curvatura.',
    },
    {
      questionId: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
      questionTitle: 'ENEM 2023 - Matemática / Potência e Consumo',
      correctOption: 'B',
      misleadingOption: 'A',
      failedPercentage: 38.5,
      pedagogicalExplanation:
        'Não consideração do fator de 30 dias na multiplicação do consumo diário de energia elétrica em quilowatts-hora.',
    },
    {
      questionId: '99999999-aaaa-bbbb-cccc-dddddddddddd',
      questionTitle: 'ENEM 2023 - Química / Eletroquímica',
      correctOption: 'D',
      misleadingOption: 'E',
      failedPercentage: 31.0,
      pedagogicalExplanation:
        'Inversão dos potenciais de redução padrão na determinação do ânodo e cátodo em pilhas galvânicas.',
    },
  ],
  generatedAt: '2026-10-15T18:00:00Z',
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
  currentXp: 450,
  level: 3,
  levelTitle: 'Calouro Iniciante',
  currentStreakDays: 5,
  longestStreakDays: 14,
  streakFreezeAvailable: true,
  dailyGoalTarget: 5,
  dailyGoalProgress: 3,
  weeklyLeague: 'GOLD',
  unlockedBadges: ['PRIMEIRA_QUESTAO', 'STREAK_DIAS', 'MESTRE_MATEMATICA', 'MESTRE_MATEMATICA_SILVER'],
};

export const MOCK_LEAGUE_LEADERBOARDS: Record<'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND', LeaderboardResponseDto> = {
  BRONZE: {
    league: 'BRONZE',
    leagueTier: 'BRONZE',
    weekNumber: 42,
    year: 2026,
    resetsAt: '2026-10-18T23:59:59Z',
    totalParticipants: 10,
    entries: [
      { rank: 1, userId: 'usr-b1', studentName: 'Camila Fernandes', displayName: 'Camila Fernandes', weeklyXp: 480, streakDays: 4, promotionZone: true, isCurrentUser: false },
      { rank: 2, userId: 'usr-b2', studentName: 'Felipe Martins', displayName: 'Felipe Martins', weeklyXp: 410, streakDays: 3, promotionZone: true, isCurrentUser: false },
      { rank: 3, userId: 'usr-b3', studentName: 'Larissa Rocha', displayName: 'Larissa Rocha', weeklyXp: 350, streakDays: 2, promotionZone: false, isCurrentUser: false },
      { rank: 4, userId: 'usr-b4', studentName: 'Thiago Ribeiro', displayName: 'Thiago Ribeiro', weeklyXp: 290, streakDays: 1, promotionZone: false, isCurrentUser: false },
      { rank: 5, userId: 'usr-b5', studentName: 'Ana Clara', displayName: 'Ana Clara', weeklyXp: 220, streakDays: 1, promotionZone: false, isCurrentUser: false },
      { rank: 6, userId: 'usr-b6', studentName: 'Gabriel Santos', displayName: 'Gabriel Santos', weeklyXp: 180, streakDays: 0, promotionZone: false, isCurrentUser: false },
      { rank: 7, userId: 'usr-b7', studentName: 'Juliana Paes', displayName: 'Juliana Paes', weeklyXp: 140, streakDays: 0, promotionZone: false, isCurrentUser: false },
      { rank: 8, userId: 'usr-b8', studentName: 'Matheus Lima', displayName: 'Matheus Lima', weeklyXp: 110, streakDays: 0, promotionZone: false, isCurrentUser: false },
      { rank: 9, userId: 'usr-b9', studentName: 'Rafaela Dias', displayName: 'Rafaela Dias', weeklyXp: 80, streakDays: 0, promotionZone: false, isCurrentUser: false },
      { rank: 10, userId: 'usr-b10', studentName: 'Bruno Carvalho', displayName: 'Bruno Carvalho', weeklyXp: 40, streakDays: 0, promotionZone: false, isCurrentUser: false },
    ],
  },
  SILVER: {
    league: 'SILVER',
    leagueTier: 'SILVER',
    weekNumber: 42,
    year: 2026,
    resetsAt: '2026-10-18T23:59:59Z',
    totalParticipants: 10,
    entries: [
      { rank: 1, userId: 'usr-s1', studentName: 'Rodrigo Alencar', displayName: 'Rodrigo Alencar', weeklyXp: 690, streakDays: 6, promotionZone: true, isCurrentUser: false },
      { rank: 2, userId: 'usr-s2', studentName: 'Fernanda Neves', displayName: 'Fernanda Neves', weeklyXp: 610, streakDays: 5, promotionZone: true, isCurrentUser: false },
      { rank: 3, userId: 'usr-s3', studentName: 'Vinicius Prado', displayName: 'Vinicius Prado', weeklyXp: 540, streakDays: 4, promotionZone: false, isCurrentUser: false },
      { rank: 4, userId: 'usr-s4', studentName: 'Mariana Duarte', displayName: 'Mariana Duarte', weeklyXp: 490, streakDays: 3, promotionZone: false, isCurrentUser: false },
      { rank: 5, userId: 'usr-s5', studentName: 'Eduardo Gomes', displayName: 'Eduardo Gomes', weeklyXp: 420, streakDays: 3, promotionZone: false, isCurrentUser: false },
      { rank: 6, userId: 'usr-s6', studentName: 'Isabela Monteiro', displayName: 'Isabela Monteiro', weeklyXp: 380, streakDays: 2, promotionZone: false, isCurrentUser: false },
      { rank: 7, userId: 'usr-s7', studentName: 'Leonardo Cruz', displayName: 'Leonardo Cruz', weeklyXp: 310, streakDays: 2, promotionZone: false, isCurrentUser: false },
      { rank: 8, userId: 'usr-s8', studentName: 'Carolina Castro', displayName: 'Carolina Castro', weeklyXp: 260, streakDays: 1, promotionZone: false, isCurrentUser: false },
      { rank: 9, userId: 'usr-s9', studentName: 'Guilherme Silveira', displayName: 'Guilherme Silveira', weeklyXp: 190, streakDays: 1, promotionZone: false, isCurrentUser: false },
      { rank: 10, userId: 'usr-s10', studentName: 'Paula Guimarães', displayName: 'Paula Guimarães', weeklyXp: 120, streakDays: 0, promotionZone: false, isCurrentUser: false },
    ],
  },
  GOLD: {
    league: 'GOLD',
    leagueTier: 'GOLD',
    weekNumber: 42,
    year: 2026,
    resetsAt: '2026-10-18T23:59:59Z',
    totalParticipants: 10,
    entries: [
      { rank: 1, userId: 'usr-1', studentName: 'Beatriz Costa', displayName: 'Beatriz Costa', weeklyXp: 820, streakDays: 12, promotionZone: true, isCurrentUser: false },
      { rank: 2, userId: 'usr-123', studentName: 'Lucas Silva', displayName: 'Lucas Silva', weeklyXp: 750, streakDays: 7, promotionZone: true, isCurrentUser: true },
      { rank: 3, userId: 'usr-3', studentName: 'Carlos Souza', displayName: 'Carlos Souza', weeklyXp: 680, streakDays: 9, promotionZone: false, isCurrentUser: false },
      { rank: 4, userId: 'usr-4', studentName: 'Daniela Barbosa', displayName: 'Daniela Barbosa', weeklyXp: 590, streakDays: 6, promotionZone: false, isCurrentUser: false },
      { rank: 5, userId: 'usr-5', studentName: 'Renato Farias', displayName: 'Renato Farias', weeklyXp: 520, streakDays: 5, promotionZone: false, isCurrentUser: false },
      { rank: 6, userId: 'usr-6', studentName: 'Sofia Meireles', displayName: 'Sofia Meireles', weeklyXp: 460, streakDays: 4, promotionZone: false, isCurrentUser: false },
      { rank: 7, userId: 'usr-7', studentName: 'Gustavo Henrique', displayName: 'Gustavo Henrique', weeklyXp: 390, streakDays: 3, promotionZone: false, isCurrentUser: false },
      { rank: 8, userId: 'usr-8', studentName: 'Helena Pires', displayName: 'Helena Pires', weeklyXp: 320, streakDays: 3, promotionZone: false, isCurrentUser: false },
      { rank: 9, userId: 'usr-9', studentName: 'Otávio Mendonça', displayName: 'Otávio Mendonça', weeklyXp: 270, streakDays: 2, promotionZone: false, isCurrentUser: false },
      { rank: 10, userId: 'usr-10', studentName: 'Vanessa Moreira', displayName: 'Vanessa Moreira', weeklyXp: 180, streakDays: 1, promotionZone: false, isCurrentUser: false },
    ],
  },
  DIAMOND: {
    league: 'DIAMOND',
    leagueTier: 'DIAMOND',
    weekNumber: 42,
    year: 2026,
    resetsAt: '2026-10-18T23:59:59Z',
    totalParticipants: 10,
    entries: [
      { rank: 1, userId: 'usr-d1', studentName: 'Arthur Nogueira', displayName: 'Arthur Nogueira', weeklyXp: 1450, streakDays: 32, promotionZone: false, isCurrentUser: false },
      { rank: 2, userId: 'usr-d2', studentName: 'Yasmin Vasconcelos', displayName: 'Yasmin Vasconcelos', weeklyXp: 1380, streakDays: 28, promotionZone: false, isCurrentUser: false },
      { rank: 3, userId: 'usr-d3', studentName: 'Marcelo Brandão', displayName: 'Marcelo Brandão', weeklyXp: 1290, streakDays: 25, promotionZone: false, isCurrentUser: false },
      { rank: 4, userId: 'usr-d4', studentName: 'Clarice Fontes', displayName: 'Clarice Fontes', weeklyXp: 1180, streakDays: 21, promotionZone: false, isCurrentUser: false },
      { rank: 5, userId: 'usr-d5', studentName: 'Igor Medeiros', displayName: 'Igor Medeiros', weeklyXp: 1050, streakDays: 19, promotionZone: false, isCurrentUser: false },
      { rank: 6, userId: 'usr-d6', studentName: 'Letícia Xavier', displayName: 'Letícia Xavier', weeklyXp: 960, streakDays: 16, promotionZone: false, isCurrentUser: false },
      { rank: 7, userId: 'usr-d7', studentName: 'Caio Junqueira', displayName: 'Caio Junqueira', weeklyXp: 880, streakDays: 14, promotionZone: false, isCurrentUser: false },
      { rank: 8, userId: 'usr-d8', studentName: 'Bruna Takahashi', displayName: 'Bruna Takahashi', weeklyXp: 810, streakDays: 12, promotionZone: false, isCurrentUser: false },
      { rank: 9, userId: 'usr-d9', studentName: 'Vitor Hugo Abreu', displayName: 'Vitor Hugo Abreu', weeklyXp: 740, streakDays: 10, promotionZone: false, isCurrentUser: false },
      { rank: 10, userId: 'usr-d10', studentName: 'Milena Barreto', displayName: 'Milena Barreto', weeklyXp: 620, streakDays: 8, promotionZone: false, isCurrentUser: false },
    ],
  },
};

export const MOCK_LEADERBOARD: LeaderboardResponseDto = MOCK_LEAGUE_LEADERBOARDS.GOLD;

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

