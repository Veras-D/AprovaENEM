export interface SkinToneOption {
  readonly id: string;
  readonly label: string;
  readonly hex: string;
  readonly shadow: string;
  readonly blush: string;
}

/**
 * 10 authentic, realistic human skin tones representing Brazil's diverse student population.
 * Free of cartoon/fantasy colors (no purple, green, or neon blue).
 */
export const REALISTIC_SKIN_PALETTE: readonly SkinToneOption[] = [
  { id: 'skin-1', label: 'Porcelana Clara', hex: '#fde8d7', shadow: '#eab8a0', blush: '#fca5a5' },
  { id: 'skin-2', label: 'Pêssego Natural', hex: '#f7d2b7', shadow: '#dea282', blush: '#f87171' },
  { id: 'skin-3', label: 'Marfim Quente', hex: '#edd0b0', shadow: '#cfa57e', blush: '#fb923c' },
  { id: 'skin-4', label: 'Bege Dourado', hex: '#e4b88d', shadow: '#c48f5e', blush: '#ea580c' },
  { id: 'skin-5', label: 'Morena Clara / Oliva', hex: '#d49e6d', shadow: '#b27745', blush: '#c2410c' },
  { id: 'skin-6', label: 'Caramelo Quente', hex: '#c08250', shadow: '#9a5e2f', blush: '#b91c1c' },
  { id: 'skin-7', label: 'Bronze Canela', hex: '#a36439', shadow: '#7d451e', blush: '#991b1b' },
  { id: 'skin-8', label: 'Castanho Médio', hex: '#854926', shadow: '#623114', blush: '#7f1d1d' },
  { id: 'skin-9', label: 'Cacau / Pele Negra', hex: '#613018', shadow: '#441d0a', blush: '#541c10' },
  { id: 'skin-10', label: 'Ébano / Negra Retinta', hex: '#3d1c0e', shadow: '#280f05', blush: '#381308' },
];
