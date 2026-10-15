import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import katex from 'katex';
import { MathRenderer } from './MathRenderer';
import { BlockMath } from './BlockMath';
import { InlineMath } from './InlineMath';

describe('MathRenderer Resilience & Security Tests', () => {
  it('renders authentic mathematical, physical, and chemical formulas correctly', () => {
    const content = `Um resistor de $10\\text{ W}$ consome $1{,}50\\text{ kWh}$.
A energia cinética é dada por:
$$E_c = \\frac{1}{2}mv^2$$
Reação de combustão: $\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$`;

    const { container } = render(<MathRenderer content={content} />);

    // Renders math elements
    const mathElements = container.querySelectorAll('[role="math"]');
    expect(mathElements.length).toBeGreaterThanOrEqual(3);

    // Text content preserved
    expect(screen.getByText(/Um resistor de/i)).toBeInTheDocument();
    expect(screen.getByText(/A energia cinética é dada por:/i)).toBeInTheDocument();
  });

  it('safely handles Brazilian currency notations without corrupting text or treating as LaTeX', () => {
    const text = 'O custo do produto foi R$ 120,50 e a taxa de entrega foi R$ 15,00.';
    const { container } = render(<MathRenderer content={text} />);

    expect(screen.getByText(/O custo do produto foi R\$ 120,50 e a taxa de entrega foi R\$ 15,00\./i)).toBeInTheDocument();
    // Should not render any KaTeX math block for currency
    expect(container.querySelectorAll('[role="math"]').length).toBe(0);
  });

  it('renders block math with accessible keyboard scrolling attributes', () => {
    const formula = 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';
    render(<BlockMath math={formula} ariaLabel="Fórmula de Bhaskara" />);

    const mathBlock = screen.getByRole('math', { name: /Fórmula de Bhaskara/i });
    expect(mathBlock).toBeInTheDocument();
    expect(mathBlock).toHaveAttribute('tabIndex', '0');
    expect(mathBlock).toHaveClass('block-math');
  });

  it('gracefully handles KaTeX renderToString errors in BlockMath by rendering error fallback', () => {
    const spy = vi.spyOn(katex, 'renderToString').mockImplementationOnce(() => {
      throw new Error('KaTeX simulation fatal error');
    });

    render(<BlockMath math="\\fatalError{test}" className="custom-error" />);

    const errorContainer = screen.getByText(/fatalError/);
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveClass('block-math-error');
    expect(errorContainer).toHaveClass('custom-error');

    spy.mockRestore();
  });

  it('gracefully handles KaTeX renderToString errors in InlineMath by rendering error fallback', () => {
    const spy = vi.spyOn(katex, 'renderToString').mockImplementationOnce(() => {
      throw new Error('KaTeX simulation fatal error');
    });

    render(<InlineMath math="\\fatalInline{x}" className="custom-inline-error" />);

    const errorContainer = screen.getByText(/fatalInline/);
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveClass('inline-math-error');
    expect(errorContainer).toHaveClass('custom-inline-error');

    spy.mockRestore();
  });

  it('neutralizes malicious XSS payloads embedded in content and formula tokens', () => {
    const malicious = '<script>alert("xss")</script><img src=x onerror=alert(1)>$\\text{<script>alert(2)</script>}$';
    const { container } = render(<MathRenderer content={malicious} />);

    // Must not execute or mount script tags
    expect(container.querySelectorAll('script').length).toBe(0);
    // Malicious image should be escaped text, not executable DOM element
    expect(container.querySelectorAll('img[onerror]').length).toBe(0);
    expect(screen.getByText(/<script>alert\("xss"\)<\/script>/i)).toBeInTheDocument();
  });

  it('handles empty or blank content gracefully without rendering errors', () => {
    const { container: emptyContainer } = render(<MathRenderer content="" />);
    expect(emptyContainer.firstChild).toBeNull();
  });
});
