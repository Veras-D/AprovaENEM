import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MathRenderer } from './MathRenderer';
import { isSafeUrl } from './markdown-parser';

describe('Markdown & Image Parsing in MathRenderer', () => {
  describe('isSafeUrl validator', () => {
    it('permits safe protocols', () => {
      expect(isSafeUrl('https://enem.dev/image.png')).toBe(true);
      expect(isSafeUrl('http://example.com/fig.jpg')).toBe(true);
      expect(isSafeUrl('/assets/images/cone.png')).toBe(true);
      expect(isSafeUrl('./diagram.svg')).toBe(true);
      expect(isSafeUrl('data:image/png;base64,iVBORw...')).toBe(true);
    });

    it('rejects unsafe and malicious protocols', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('')).toBe(false);
      expect(isSafeUrl(undefined)).toBe(false);
    });

    it('rejects broken-image placeholders and external PR advertisements', () => {
      expect(isSafeUrl('https://enem.dev/broken-image.svg')).toBe(false);
      expect(isSafeUrl('https://example.com/broken_image.png')).toBe(false);
    });
  });

  describe('Markdown formatting rendering', () => {
    it('renders bold text with <strong> tag and eliminates raw asterisks', () => {
      const content = 'BICUDO, F. Jardineiro da pesada. Ecologia. **Pesquisa Fapesp**, ed. 231, maio 2015 (adaptado).';
      render(<MathRenderer content={content} />);

      const strongElement = screen.getByText('Pesquisa Fapesp');
      expect(strongElement.tagName).toBe('STRONG');
      expect(screen.queryByText(/\*\*Pesquisa Fapesp\*\*/)).not.toBeInTheDocument();
    });

    it('renders italic text with <em> tag', () => {
      const content = 'Texto com *ênfase em itálico* para leitura atenta.';
      render(<MathRenderer content={content} />);

      const emElement = screen.getByText('ênfase em itálico');
      expect(emElement.tagName).toBe('EM');
    });

    it('renders combined bold and italic with <strong> and <em> tags', () => {
      const content = 'Aviso: ***informação importantíssima*** a seguir.';
      render(<MathRenderer content={content} />);

      const emElement = screen.getByText('informação importantíssima');
      expect(emElement.tagName).toBe('EM');
      expect(emElement.parentElement?.tagName).toBe('STRONG');
    });

    it('renders inline code with <code> tag', () => {
      const content = 'Utilize a função `console.log()` para inspecionar os valores.';
      render(<MathRenderer content={content} />);

      const codeElement = screen.getByText('console.log()');
      expect(codeElement.tagName).toBe('CODE');
    });

    it('renders external links with safe target and rel attributes', () => {
      const content = 'Consulte o portal oficial em [INEP ENEM](https://www.gov.br/inep/pt-br).';
      render(<MathRenderer content={content} />);

      const link = screen.getByRole('link', { name: 'INEP ENEM' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://www.gov.br/inep/pt-br');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Image rendering (block and inline)', () => {
    it('renders block image on its own line using ZoomableImage with zoom and accessibility', () => {
      const content = `Um artista plástico esculpe uma escultura a partir de um bloco de madeira de lei.

![](https://enem.dev/2023/questions/136/565c2d5a-96a0-4468-9bb1-2710707a40fd.png)

Em seguida, perfura esse tronco de cone, removendo um cilindro reto.`;

      const { container } = render(<MathRenderer content={content} />);

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        'src',
        'https://enem.dev/2023/questions/136/565c2d5a-96a0-4468-9bb1-2710707a40fd.png'
      );

      // Verify raw markdown syntax ![](...) is NOT rendered as text
      expect(container.textContent).not.toContain('![](https://enem.dev');
    });

    it('renders inline image within a sentence alongside text', () => {
      const content =
        'Mantendo-se a força ![](https://enem.dev/2022/questions/103/04cf32d8-f517-483e-b0d5-189de1.png) constante durante o ensaio.';

      const { container } = render(<MathRenderer content={content} />);

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveClass('inline-block');
      expect(container.textContent).toContain('Mantendo-se a força');
      expect(container.textContent).toContain('constante durante o ensaio.');
      expect(container.textContent).not.toContain('![](https://enem.dev');
    });

    it('renders block image with explicit caption when provided in alt brackets', () => {
      const content = '![Figura 1: Esquema óptico](https://enem.dev/figura.png)';
      render(<MathRenderer content={content} />);

      const img = screen.getByRole('img', { name: 'Figura 1: Esquema óptico' });
      expect(img).toBeInTheDocument();
      expect(screen.getByText('Figura 1: Esquema óptico')).toBeInTheDocument();
    });
  });

  describe('Seamless integration with KaTeX math formulas', () => {
    it('renders both Markdown bold and KaTeX formulas without interference', () => {
      const content = `**Equação da Trajetória:**
$$y = x\\tan(\\theta) - \\frac{gx^2}{2v_0^2\\cos^2(\\theta)}$$
onde a **velocidade inicial** é dada por $v_0 = 20\\text{ m/s}$.`;

      render(<MathRenderer content={content} />);

      expect(screen.getByText('Equação da Trajetória:')).toBeInTheDocument();
      expect(screen.getByText('velocidade inicial')).toBeInTheDocument();

      const mathBlocks = screen.getAllByRole('math');
      expect(mathBlocks).toHaveLength(2); // block math and inline math
    });

    it('renders bold wrapping inline math (**$0$**, **$\\pi$**), bullet lists (- item), and horizontal rules (---)', () => {
      const content = `$$e^{i\\pi} + 1 = 0$$

Cinco das constantes matemáticas mais importantes:
- O **$0$** e o **$1$** (a base da aritmética);
- O **$\\pi$** (presente nos círculos e na geometria);
- O **$e$** (a base dos logaritmos naturais);
- E o **$i$** (a unidade imaginária).

---

### Reflexão Filosófica`;

      const { container } = render(<MathRenderer content={content} />);

      // Should not leave raw ** or --- in text output
      expect(container.textContent).not.toContain('**');
      expect(container.textContent).not.toContain('---');

      // Should render semantic unordered list and list items
      const ul = container.querySelector('ul');
      expect(ul).toBeInTheDocument();
      expect(container.querySelectorAll('li')).toHaveLength(4);

      // Should render horizontal rule
      expect(container.querySelector('hr')).toBeInTheDocument();

      // Should render heading
      expect(screen.getByText('Reflexão Filosófica')).toBeInTheDocument();

      // Should render 1 block math + 5 inline math elements inside bold tags
      const mathElements = screen.getAllByRole('math');
      expect(mathElements).toHaveLength(6);
    });
  });

  describe('Unescaping Markdown punctuation', () => {
    it('unescapes backslash-escaped numerals in lists such as 1\\., 2\\., etc.', () => {
      const content = '1\\. Nós queremos cantar o amor ao perigo.\n\n2\\. A coragem, a audácia.';
      const { container } = render(<MathRenderer content={content} />);

      expect(container.textContent).toContain('1. Nós queremos cantar o amor ao perigo.');
      expect(container.textContent).toContain('2. A coragem, a audácia.');
      expect(container.textContent).not.toContain('1\\.');
      expect(container.textContent).not.toContain('2\\.');
    });

    it('unescapes escaped punctuation within formatting tags', () => {
      const content = '**Item 1\\.** e *seção 2\\.* com aviso.';
      const { container } = render(<MathRenderer content={content} />);

      expect(screen.getByText('Item 1.')).toBeInTheDocument();
      expect(screen.getByText('seção 2.')).toBeInTheDocument();
      expect(container.textContent).not.toContain('\\.');
    });
  });
});
