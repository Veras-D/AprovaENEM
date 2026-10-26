import React from 'react';
import { useTenantStore } from '@/stores/useTenantStore';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import {
  Sparkles,
  BookOpen,
  Trophy,
  BarChart2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Bot,
  Accessibility,
  Clock,
} from 'lucide-react';

export interface LandingPageProps {
  readonly onStartPractice: () => void;
  readonly onNavigate: (section: string) => void;
  readonly onOpenAuthModal?: () => void;
}

/**
 * Institutional Landing Page / Home Portal.
 * Adapts dynamically to the active tenant's brand manual (typography, logo, geometry, colors),
 * presenting the core educational value propositions before entering the focused practice simulator.
 */
export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPractice,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { currentTenant } = useTenantStore();

  const keyFeatures = [
    {
      id: 'practice',
      title: 'Simulado Oficial INEP & KaTeX',
      description:
        'Pratique com questões reais comentadas, fórmulas matemáticas vetoriais em KaTeX, imagens WebP com zoom em alta definição e cronômetro com acomodações de tempo oficiais.',
      icon: BookOpen,
      actionText: 'Iniciar Simulado',
      action: onStartPractice,
      badge: 'Alinhamento TRI',
    },
    {
      id: 'tutor',
      title: 'Tutor IA Socrático Pedagógico',
      description:
        'Tire dúvidas em tempo real. Nossa IA pedagógica conduz seu raciocínio passo a passo com analogias, sem jamais dar spoiler do gabarito oficial.',
      icon: Bot,
      actionText: 'Aprender com IA',
      action: onStartPractice,
      badge: 'Anti-Spoiler Guardrail',
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade Universal (WCAG 2.1 AA)',
      description:
        'Avatar 3D VLibras para Língua Brasileira de Sinais, fonte adaptada para dislexia (OpenDyslexic), régua de leitura, sintetizador de voz e filtros para daltonismo.',
      icon: Accessibility,
      actionText: 'Simulado Acessível',
      action: onStartPractice,
      badge: 'e-MAG / WCAG AA',
    },
    {
      id: 'analytics',
      title: 'Diagnóstico TRI & Gamificação',
      description:
        'Acompanhe seu raio-X de proficiência nas 4 áreas do conhecimento, acumule pontos de XP, suba nas ligas semanais e mantenha sua ofensiva diária de estudos.',
      icon: Trophy,
      actionText: 'Ver Ranking & Métricas',
      action: () => onNavigate('leaderboard'),
      badge: 'Ligas & Streaks',
    },
  ];

  const highlights = [
    { label: 'Acesso 100% Gratuito', detail: 'Sem assinaturas ou paywalls' },
    { label: 'Questões Calibradas', detail: 'Matriz de Habilidades do ENEM' },
    { label: 'Tutor IA com Salvaguardas', detail: 'Foco pedagógico e ético' },
    { label: 'Privacidade LGPD Art. 18', detail: 'Transparência total dos seus dados' },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 py-2 sm:py-6">
      {/* Hero Presentation Section */}
      <section className="relative overflow-hidden rounded-brand bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xs animate-fade-up">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary text-brand-primary-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Portal Oficial &bull; {currentTenant.name}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Preparação Completa, Inteligente e Acessível para o ENEM
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentTenant.tagline}. Estude com simulados cronometrados, receba tutoria socrática inteligente por inteligência artificial e acompanhe sua proficiência com gráficos diagnósticos detalhados.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onStartPractice}
              className="text-base font-bold shadow-md hover:shadow-lg transition-shadow"
            >
              Começar Simulado Agora
              <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onNavigate('diagnostics')}
              className="text-base"
            >
              <BarChart2 className="h-5 w-5 mr-2" aria-hidden="true" />
              Mapeamento Diagnóstico
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Sem cadastro obrigatório
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-primary" />
              Acomodações de tempo INEP
            </span>
          </div>
        </div>
      </section>

      {/* Trust Highlights Bar */}
      <section aria-label="Destaques da plataforma" className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up stagger-1">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-brand bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">{item.detail}</p>
          </div>
        ))}
      </section>

      {/* 4 Pillars Feature Cards Grid */}
      <section aria-labelledby="features-heading" className="space-y-6 animate-fade-up stagger-2">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2
            id="features-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white"
          >
            Recursos Criados para o Seu Desempenho
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Tecnologia de ponta e pedagogia rigorosa para democratizar sua aprovação no SISU e Prouni.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyFeatures.map((feat) => {
            const Icon = feat.icon;

            return (
              <Card
                key={feat.id}
                className="flex flex-col justify-between hover:border-brand-primary/40 transition-colors shadow-xs"
              >
                <CardBody className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-brand bg-brand-primary/10 text-brand-primary">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={feat.action}
                      className="w-full sm:w-auto font-medium"
                    >
                      {feat.actionText}
                      <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Direct CTA Institutional Banner */}
      <section className="rounded-brand bg-slate-900 text-white p-8 sm:p-10 text-center space-y-4 animate-fade-up stagger-3">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-brand-primary/20 text-brand-primary mb-2">
          <Zap className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Pronto para testar seus conhecimentos?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Inicie agora um simulado rápido cronometrado ou consulte os diagnósticos pedagógicos de sua turma.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onStartPractice}
            className="w-full sm:w-auto font-bold"
          >
            Iniciar Simulado ENEM
            <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
          </Button>
          {onOpenAuthModal && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Criar Conta / Entrar
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};
