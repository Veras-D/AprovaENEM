import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MathRenderer } from './MathRenderer';

describe('MathRenderer component', () => {
  it('should return null when content is empty', () => {
    const { container } = render(<MathRenderer content="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render plain text without math expressions', () => {
    render(<MathRenderer content="A Declaração Universal dos Direitos Humanos foi adotada em 1948." />);

    expect(
      screen.getByText('A Declaração Universal dos Direitos Humanos foi adotada em 1948.')
    ).toBeInTheDocument();
  });

  it('should render mixed text with inline and block formulas', () => {
    const content = `Um projétil é lançado obliquamente. Sua equação da trajetória é:
$$y = x\\tan(\\theta) - \\frac{g x^2}{2 v_0^2 \\cos^2(\\theta)}$$
onde a velocidade inicial é $v_0 = 20\\text{ m/s}$.`;

    render(<MathRenderer content={content} />);

    // Should have both inline and block math elements
    const mathElements = screen.getAllByRole('math');
    expect(mathElements).toHaveLength(2);

    expect(screen.getByText(/Um projétil é lançado obliquamente/)).toBeInTheDocument();
    expect(screen.getByText(/onde a velocidade inicial é/)).toBeInTheDocument();
  });

  it('should preserve Brazilian currency expressions as plain text without math distortion', () => {
    const content =
      'O valor da passagem é R$ 4,50. Se o passageiro pagar com R$ 10,00, o troco $T$ será $T = 10 - 4,50 = 5,50$.';

    render(<MathRenderer content={content} />);

    expect(screen.getByText(/O valor da passagem é R\$ 4,50/)).toBeInTheDocument();
    expect(screen.getByText(/Se o passageiro pagar com R\$ 10,00/)).toBeInTheDocument();

    const mathElements = screen.getAllByRole('math');
    expect(mathElements).toHaveLength(2); // $T$ and $T = 10 - 4,50 = 5,50$
  });

  it('should preserve newlines with <br /> elements when preserveNewlines is true', () => {
    const content = 'Linha 1\nLinha 2\nLinha 3';
    const { container } = render(<MathRenderer content={content} preserveNewlines={true} />);

    const brElements = container.querySelectorAll('br');
    expect(brElements).toHaveLength(2);
  });

  it('should render using custom polymorphic container tag (as="article")', () => {
    const { container } = render(
      <MathRenderer content="Texto do artigo com $x = 1$" as="article" className="article-wrapper" />
    );

    const article = container.querySelector('article.article-wrapper');
    expect(article).toBeInTheDocument();
  });
});
