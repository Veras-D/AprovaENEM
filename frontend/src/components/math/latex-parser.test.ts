import { describe, it, expect } from 'vitest';
import { parseLatexTokens } from './latex-parser';

describe('latex-parser.ts — ENEM Math & Formula Tokenizer', () => {
  it('should return an empty array when given an empty string or nullish input', () => {
    expect(parseLatexTokens('')).toEqual([]);
  });

  it('should parse plain text with zero math formulas into a single text token', () => {
    const text = 'Em 1808, a família real portuguesa transferiu-se para o Brasil.';
    const tokens = parseLatexTokens(text);

    expect(tokens).toHaveLength(1);
    expect(tokens[0]!).toEqual({
      type: 'text',
      content: text,
      raw: text,
    });
  });

  it('should parse inline math delimited by $...$', () => {
    const text = 'Considere a função $f(x) = ax^2 + bx + c$ definida para todos os reais.';
    const tokens = parseLatexTokens(text);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]!).toEqual({
      type: 'text',
      content: 'Considere a função ',
      raw: 'Considere a função ',
    });
    expect(tokens[1]!).toEqual({
      type: 'inline-math',
      content: 'f(x) = ax^2 + bx + c',
      raw: '$f(x) = ax^2 + bx + c$',
    });
    expect(tokens[2]!).toEqual({
      type: 'text',
      content: ' definida para todos os reais.',
      raw: ' definida para todos os reais.',
    });
  });

  it('should parse block math delimited by $$...$$', () => {
    const text = 'A integral definida é:\n$$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$\ncalcule seu valor.';
    const tokens = parseLatexTokens(text);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]!.type).toBe('text');
    expect(tokens[1]!).toEqual({
      type: 'block-math',
      content: '\\int_0^1 x^2 \\, dx = \\frac{1}{3}',
      raw: '$$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$',
    });
    expect(tokens[2]!.type).toBe('text');
  });

  it('should parse LaTeX bracket syntax (\\[...\\] and \\(...\\))', () => {
    const text = 'Dada a equação \\[E = mc^2\\] com \\(m > 0\\).';
    const tokens = parseLatexTokens(text);

    expect(tokens).toHaveLength(5);
    expect(tokens[1]!).toEqual({
      type: 'block-math',
      content: 'E = mc^2',
      raw: '\\[E = mc^2\\]',
    });
    expect(tokens[3]!).toEqual({
      type: 'inline-math',
      content: 'm > 0',
      raw: '\\(m > 0\\)',
    });
  });

  describe('Brazilian Currency Protection (R$ false-positive prevention)', () => {
    it('should NOT treat R$ amounts as LaTeX math delimiters', () => {
      const text = 'O consumidor comprou um livro por R$ 45,00 e um caderno por R$ 12,50.';
      const tokens = parseLatexTokens(text);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.type).toBe('text');
      expect(tokens[0]!.content).toBe(text);
    });

    it('should NOT treat R $ with space as LaTeX math delimiter', () => {
      const text = 'O valor total foi R $ 100,00 à vista.';
      const tokens = parseLatexTokens(text);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.type).toBe('text');
    });

    it('should accurately distinguish Brazilian currency from real math in the same sentence', () => {
      const text =
        'O custo total foi de R$ 150,00, modelado pela função $C(x) = 25x + 50$, com $x \\ge 1$.';
      const tokens = parseLatexTokens(text);

      expect(tokens).toHaveLength(5);
      expect(tokens[0]!).toEqual({
        type: 'text',
        content: 'O custo total foi de R$ 150,00, modelado pela função ',
        raw: 'O custo total foi de R$ 150,00, modelado pela função ',
      });
      expect(tokens[1]!).toEqual({
        type: 'inline-math',
        content: 'C(x) = 25x + 50',
        raw: '$C(x) = 25x + 50$',
      });
      expect(tokens[2]!).toEqual({
        type: 'text',
        content: ', com ',
        raw: ', com ',
      });
      expect(tokens[3]!).toEqual({
        type: 'inline-math',
        content: 'x \\ge 1',
        raw: '$x \\ge 1$',
      });
      expect(tokens[4]!).toEqual({
        type: 'text',
        content: '.',
        raw: '.',
      });
    });
  });

  describe('Physics, Chemistry and Complex Formulas', () => {
    it('should tokenize Physics kinematic equations and Greek symbols', () => {
      const text = 'Pela equação de Torricelli, $v^2 = v_0^2 + 2a\\Delta S$, temos $\\Delta S = 50\\text{ m}$.';
      const tokens = parseLatexTokens(text);

      expect(tokens).toHaveLength(5);
      expect(tokens[1]!.content).toBe('v^2 = v_0^2 + 2a\\Delta S');
      expect(tokens[3]!.content).toBe('\\Delta S = 50\\text{ m}');
    });

    it('should tokenize Chemistry equilibrium equations', () => {
      const text = 'Considere o equilíbrio: $\\text{N}_2\\text{(g)} + 3\\text{H}_2\\text{(g)} \\rightleftharpoons 2\\text{NH}_3\\text{(g)}$.';
      const tokens = parseLatexTokens(text);

      expect(tokens).toHaveLength(3);
      expect(tokens[1]!.content).toBe('\\text{N}_2\\text{(g)} + 3\\text{H}_2\\text{(g)} \\rightleftharpoons 2\\text{NH}_3\\text{(g)}');
    });
  });
});
