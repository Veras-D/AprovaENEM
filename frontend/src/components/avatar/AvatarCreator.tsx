import React, { useState } from 'react';
import type {
  AvatarConfig,
  AvatarHairStyle,
  AvatarEyeExpression,
  AvatarMouthExpression,
  AvatarClothingStyle,
  AvatarAccessory,
} from '@/types';
import { DEFAULT_AVATAR_CONFIG } from '@/types';
import { AvatarRenderer } from './AvatarRenderer';
import { REALISTIC_SKIN_PALETTE } from './avatar-constants';
import {
  Sparkles,
  Dices,
  Check,
  Smile,
  Scissors,
  Shirt,
  Palette,
  Headphones,
} from 'lucide-react';

export interface AvatarCreatorProps {
  readonly initialConfig?: AvatarConfig;
  readonly onSave: (config: AvatarConfig) => void;
  readonly className?: string;
}

const SKIN_COLORS = REALISTIC_SKIN_PALETTE;

const HAIR_STYLES: { id: AvatarHairStyle; label: string }[] = [
  { id: 'short', label: 'Curto Clássico' },
  { id: 'curly', label: 'Cacheado / Black' },
  { id: 'wavy', label: 'Ondulado / Longo' },
  { id: 'bun', label: 'Coque Estudante' },
  { id: 'spiky', label: 'Espetado Aventureiro' },
  { id: 'bald', label: 'Careca / Raspado' },
];

const HAIR_COLORS = [
  { label: 'Castanho Escuro / Preto', hex: '#1a1614' },
  { label: 'Castanho Café', hex: '#422b1d' },
  { label: 'Castanho Chocolate', hex: '#6b3f23' },
  { label: 'Castanho Avelã', hex: '#915833' },
  { label: 'Loiro Dourado', hex: '#d99b3b' },
  { label: 'Loiro Claro', hex: '#ecc56d' },
  { label: 'Ruivo Cobre', hex: '#b84824' },
  { label: 'Ruivo Mogno', hex: '#7c2617' },
  { label: 'Grisalho', hex: '#8a9199' },
  { label: 'Branco Neve', hex: '#d8dde2' },
  { label: 'Azul Abigail', hex: '#2c4d75' },
  { label: 'Roxo Ametista', hex: '#5b326d' },
];

const EYE_EXPRESSIONS: { id: AvatarEyeExpression; label: string }[] = [
  { id: 'cheerful', label: 'Alegre (^‿^)' },
  { id: 'focused', label: 'Focado nos Estudos' },
  { id: 'glasses', label: 'Óculos de Grau' },
  { id: 'sunglasses', label: 'Óculos Escuros' },
];

const MOUTH_EXPRESSIONS: { id: AvatarMouthExpression; label: string }[] = [
  { id: 'openSmile', label: 'Sorriso Aberto' },
  { id: 'smile', label: 'Sorriso Suave' },
  { id: 'grin', label: 'Sorriso Largo' },
  { id: 'smirk', label: 'Confiante' },
];

const CLOTHING_STYLES: { id: AvatarClothingStyle; label: string }[] = [
  { id: 'tshirt', label: 'Camiseta Básica' },
  { id: 'hoodie', label: 'Moletom Confortável' },
  { id: 'academic', label: 'Camisa Acadêmica' },
  { id: 'vest', label: 'Colete Nota 1000' },
];

const CLOTHING_COLORS = [
  { label: 'Azul ENEM', hex: '#1e5f8a' },
  { label: 'Verde Floresta', hex: '#2f7444' },
  { label: 'Vinho / Rubi', hex: '#942929' },
  { label: 'Âmbar Solar', hex: '#cf7b23' },
  { label: 'Roxo Lavanda', hex: '#68458f' },
  { label: 'Terracota', hex: '#b85328' },
  { label: 'Grafite Carvão', hex: '#374151' },
  { label: 'Branco Algodão', hex: '#e2e8f0' },
];

const ACCESSORIES: { id: AvatarAccessory; label: string }[] = [
  { id: 'none', label: 'Nenhum' },
  { id: 'headphones', label: 'Fones de Ouvido' },
  { id: 'graduationCap', label: 'Capelo SISU' },
  { id: 'pencil', label: 'Lápis da Redação' },
];

const BACKGROUND_COLORS = [
  { label: 'Céu Fazenda', hex: '#bae6fd' },
  { label: 'Menta Primavera', hex: '#a7f3d0' },
  { label: 'Trigo Dourado', hex: '#fde68a' },
  { label: 'Pêssego Poente', hex: '#fbcfe8' },
  { label: 'Lavanda Suave', hex: '#ddd6fe' },
  { label: 'Noite Estrelada', hex: '#1e293b' },
];

type CreatorTab = 'skin' | 'hair' | 'face' | 'clothes' | 'accessories' | 'bg';

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({
  initialConfig,
  onSave,
  className = '',
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig ?? DEFAULT_AVATAR_CONFIG);
  const [activeTab, setActiveTab] = useState<CreatorTab>('skin');
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  const randomize = () => {
    const randomItem = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

    const randomSkin = randomItem(SKIN_COLORS).hex;
    const randomHairStyle = randomItem(HAIR_STYLES).id;
    const randomHairColor = randomItem(HAIR_COLORS).hex;
    const randomEye = randomItem(EYE_EXPRESSIONS).id;
    const randomMouth = randomItem(MOUTH_EXPRESSIONS).id;
    const randomClothing = randomItem(CLOTHING_STYLES).id;
    const randomClothingColor = randomItem(CLOTHING_COLORS).hex;
    const randomAccessory = randomItem(ACCESSORIES).id;
    const randomBg = randomItem(BACKGROUND_COLORS).hex;

    setConfig({
      skinColor: randomSkin,
      hairStyle: randomHairStyle,
      hairColor: randomHairColor,
      eyeExpression: randomEye,
      mouthExpression: randomMouth,
      clothingStyle: randomClothing,
      clothingColor: randomClothingColor,
      accessory: randomAccessory,
      backgroundColor: randomBg,
    });
    setIsSavedRecently(false);
  };

  const handleSave = () => {
    onSave(config);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const tabs: { id: CreatorTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'skin', label: 'Pele', icon: Sparkles },
    { id: 'hair', label: 'Cabelo', icon: Scissors },
    { id: 'face', label: 'Rosto', icon: Smile },
    { id: 'clothes', label: 'Roupas', icon: Shirt },
    { id: 'accessories', label: 'Acessórios', icon: Headphones },
    { id: 'bg', label: 'Fundo', icon: Palette },
  ];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 ${className}`}>
      {/* Header with Title and Stardew-style Randomize Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
            Criador de Avatar Pixel Art (Estilo Stardew Valley)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Personalize seu visual 16-bit com tons de pele realistas e peças perfeitamente ajustadas para o Ranking e os Simulados.
          </p>
        </div>

        <button
          type="button"
          onClick={randomize}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-brand border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          title="Gerar combinações aleatórias divertidas"
        >
          <Dices className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          <span>🎲 Aleatório</span>
        </button>
      </div>

      {/* Main Avatar Stage: Preview on the Left, Controls on the Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
        {/* Live Preview Display */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 rounded-xl p-6 border border-slate-100 dark:border-slate-800/60">
          <div className="relative group">
            <AvatarRenderer
              config={config}
              size={144}
              className="drop-shadow-md transition-transform duration-200 hover:scale-105"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary text-white shadow-xs">
              Preview
            </span>
          </div>

          <div className="mt-5 w-full space-y-2">
            <button
              type="button"
              onClick={handleSave}
              className={`w-full py-2.5 px-4 rounded-brand font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                isSavedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.98]'
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Avatar Salvo com Sucesso! 🎉</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Salvar Meu Avatar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabbed Customization Panel */}
        <div className="md:col-span-7 flex flex-col">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-700" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-brand text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary dark:bg-brand-primary/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Customizer Controls */}
          <div className="pt-4 flex-1">
            {/* SKIN TONE TAB (Realistic human tones only) */}
            {activeTab === 'skin' && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Escolha um tom de pele realista representativo da diversidade estudantil:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {SKIN_COLORS.map((item) => {
                    const isSelected = config.skinColor.toLowerCase() === item.hex.toLowerCase();
                    return (
                      <button
                        key={item.hex}
                        type="button"
                        onClick={() => {
                          setConfig((prev) => ({ ...prev, skinColor: item.hex }));
                          setIsSavedRecently(false);
                        }}
                        className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/30 dark:bg-brand-primary/10'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span
                          className="h-8 w-8 rounded-full border border-black/15 shadow-inner flex items-center justify-center shrink-0"
                          style={{ backgroundColor: item.hex }}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                        </span>
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* HAIR TAB */}
            {activeTab === 'hair' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Estilo de Penteado:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HAIR_STYLES.map((style) => {
                      const isSelected = config.hairStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, hairStyle: style.id }));
                            setIsSavedRecently(false);
                          }}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left truncate ${
                            isSelected
                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Cor do Cabelo:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {HAIR_COLORS.map((item) => {
                      const isSelected = config.hairColor.toLowerCase() === item.hex.toLowerCase();
                      return (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, hairColor: item.hex }));
                            setIsSavedRecently(false);
                          }}
                          title={item.label}
                          aria-label={`Cor do cabelo: ${item.label}`}
                          className={`h-9 w-9 rounded-full border-2 transition-transform flex items-center justify-center ${
                            isSelected
                              ? 'border-brand-primary scale-110 shadow-sm'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: item.hex }}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* FACE TAB (EYES & MOUTH) */}
            {activeTab === 'face' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Olhar e Expressão dos Olhos:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EYE_EXPRESSIONS.map((eye) => {
                      const isSelected = config.eyeExpression === eye.id;
                      return (
                        <button
                          key={eye.id}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, eyeExpression: eye.id }));
                            setIsSavedRecently(false);
                          }}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                            isSelected
                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {eye.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Expressão da Boca:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOUTH_EXPRESSIONS.map((mouth) => {
                      const isSelected = config.mouthExpression === mouth.id;
                      return (
                        <button
                          key={mouth.id}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, mouthExpression: mouth.id }));
                            setIsSavedRecently(false);
                          }}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                            isSelected
                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {mouth.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CLOTHES TAB */}
            {activeTab === 'clothes' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Estilo de Roupa:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CLOTHING_STYLES.map((style) => {
                      const isSelected = config.clothingStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, clothingStyle: style.id }));
                            setIsSavedRecently(false);
                          }}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                            isSelected
                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Cor da Roupa:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {CLOTHING_COLORS.map((item) => {
                      const isSelected = config.clothingColor.toLowerCase() === item.hex.toLowerCase();
                      return (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, clothingColor: item.hex }));
                            setIsSavedRecently(false);
                          }}
                          title={item.label}
                          aria-label={`Cor da roupa: ${item.label}`}
                          className={`h-9 w-9 rounded-full border-2 transition-transform flex items-center justify-center ${
                            isSelected
                              ? 'border-brand-primary scale-110 shadow-sm'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: item.hex }}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ACCESSORIES TAB */}
            {activeTab === 'accessories' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Escolha um Acessório Universitário ou de Estudo:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ACCESSORIES.map((acc) => {
                    const isSelected = config.accessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setConfig((prev) => ({ ...prev, accessory: acc.id }));
                          setIsSavedRecently(false);
                        }}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-2 ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-brand-primary shrink-0" />
                        <span className="truncate">{acc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BACKGROUND COLOR TAB */}
            {activeTab === 'bg' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cor de Fundo do Avatar:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {BACKGROUND_COLORS.map((item) => {
                    const isSelected = config.backgroundColor.toLowerCase() === item.hex.toLowerCase();
                    return (
                      <button
                        key={item.hex}
                        type="button"
                        onClick={() => {
                          setConfig((prev) => ({ ...prev, backgroundColor: item.hex }));
                          setIsSavedRecently(false);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-slate-50 dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: item.hex }}
                        />
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
