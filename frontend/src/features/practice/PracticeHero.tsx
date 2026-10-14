import React, { useState } from 'react';
import { useTenantStore } from '@/stores/useTenantStore';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ThemeCustomizer } from '@/components/ui/ThemeCustomizer';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import type { QuestionOptionLetter } from '@/types';

export const PracticeHero: React.FC = () => {
  const { currentTenant } = useTenantStore();
  const [selectedOption, setSelectedOption] = useState<QuestionOptionLetter | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const sampleQuestion = {
    knowledgeArea: 'MT' as const,
    discipline: 'Matemática',
    difficulty: 'MEDIUM' as const,
    examYear: 2023,
    statement:
      'Um estudante do ensino médio deseja calcular a economia gerada ao substituir lâmpadas incandescentes por lâmpadas LED em sua residência. Considerando que uma lâmpada LED consome 10 W e permanece acesa por 5 horas diárias, determine o consumo mensal (30 dias) em quilowatts-hora (kWh).',
    options: [
      { letter: 'A' as const, text: '0,50 kWh' },
      { letter: 'B' as const, text: '1,50 kWh' },
      { letter: 'C' as const, text: '5,00 kWh' },
      { letter: 'D' as const, text: '15,00 kWh' },
      { letter: 'E' as const, text: '50,00 kWh' },
    ],
    correctOption: 'B' as const,
    explanation:
      'Consumo = Potência × Tempo = 10 W × 5 h/dia × 30 dias = 1500 Wh = 1,50 kWh. Alternativa correta: B.',
  };

  const handleSelectOption = (letter: QuestionOptionLetter) => {
    if (!isSubmitted) {
      setSelectedOption(letter);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic White-Label & Accessibility Customizer */}
      <ThemeCustomizer />

      {/* Hero Introduction */}
      <section className="bg-gradient-to-r from-brand-primary/10 via-brand-surface to-brand-primary/5 rounded-brand p-6 sm:p-8 border border-brand-primary/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary text-brand-primary-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            White-Label B2B Educational Platform &bull; {currentTenant.name}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Prática Inteligente com Alinhamento INEP e Tutor IA Socrático
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
            {currentTenant.tagline}. Arquitetura full-stack de alta acessibilidade com componentização rigorosa, consumo exclusivo via Gateway BFF (<code className="text-xs bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">frontend-api</code>), e suporte a multi-tenancy customizável.
          </p>
        </div>
      </section>

      {/* Interactive Question Card */}
      <section aria-labelledby="question-heading">
        <Card className="max-w-3xl mx-auto border-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{sampleQuestion.discipline}</Badge>
              <Badge variant="secondary">ENEM {sampleQuestion.examYear}</Badge>
              <Badge variant="warning">Nível Médio</Badge>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Questão #1 de 5
            </span>
          </CardHeader>

          <CardBody className="space-y-6">
            <h2 id="question-heading" className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {sampleQuestion.statement}
            </h2>

            {/* Options Selector List (A to E) */}
            <div className="space-y-3" role="radiogroup" aria-label="Alternativas da questão">
              {sampleQuestion.options.map((option) => {
                const isSelected = selectedOption === option.letter;
                const isCorrect = isSubmitted && option.letter === sampleQuestion.correctOption;
                const isWrong = isSubmitted && isSelected && !isCorrect;

                let optionStyles =
                  'border-slate-200 dark:border-slate-800 hover:border-brand-primary dark:hover:border-brand-primary bg-white dark:bg-slate-900';

                if (isSelected && !isSubmitted) {
                  optionStyles = 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-sm';
                } else if (isCorrect) {
                  optionStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
                } else if (isWrong) {
                  optionStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                }

                return (
                  <button
                    key={option.letter}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(option.letter)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-brand border-2 flex items-center justify-between gap-3 transition-all ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-brand-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {option.letter}
                      </span>
                      <span className="text-sm font-medium">{option.text}</span>
                    </div>

                    {isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    )}
                    {isWrong && (
                      <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Grading Resolution Accordion */}
            {isSubmitted && (
              <div
                className={`p-4 rounded-brand border-2 animate-in fade-in duration-300 ${
                  selectedOption === sampleQuestion.correctOption
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  {selectedOption === sampleQuestion.correctOption ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-800 dark:text-emerald-300">
                        Resposta Correta! (+10 XP concedidos)
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
                      <span className="text-rose-800 dark:text-rose-300">
                        Resposta Incorreta. Que tal consultar o Tutor IA Socrático?
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2">
                  <strong>Resolução Comentada:</strong> {sampleQuestion.explanation}
                </p>
              </div>
            )}
          </CardBody>

          <CardFooter className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {!selectedOption && 'Selecione uma alternativa para responder'}
              {selectedOption && !isSubmitted && `Alternativa (${selectedOption}) selecionada`}
              {isSubmitted && 'Resposta submetida e avaliada'}
            </span>

            <div className="flex items-center gap-2">
              {isSubmitted ? (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Tentar Novamente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedOption}
                  onClick={handleSubmit}
                >
                  Confirmar Resposta
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
};
