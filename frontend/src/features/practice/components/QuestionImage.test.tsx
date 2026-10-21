import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionImage } from './QuestionImage';

describe('QuestionImage Component', () => {
  const sampleSrc = 'https://example.com/figure.webp';

  it('should not render anything when src is undefined', () => {
    const { container } = render(<QuestionImage />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render image with alt text and caption', () => {
    render(
      <QuestionImage
        src={sampleSrc}
        alt="Gráfico de cinemática"
        caption="Figura 1: Variação da velocidade no tempo"
      />
    );

    const img = screen.getByRole('img', { name: 'Gráfico de cinemática' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', sampleSrc);

    // Simulate load event
    fireEvent.load(img);

    expect(screen.getByText('Figura 1: Variação da velocidade no tempo')).toBeInTheDocument();
  });

  it('should show error message if image fails to load', () => {
    render(<QuestionImage src={sampleSrc} />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByText(/Não foi possível carregar a figura da questão/i)).toBeInTheDocument();
  });

  it('should open lightbox modal on click and close on Escape key', () => {
    render(<QuestionImage src={sampleSrc} alt="Diagrama de circuitos" />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    // Click to open zoom modal
    fireEvent.click(img);

    const dialog = screen.getByRole('dialog', { name: /Visualização ampliada/i });
    expect(dialog).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close lightbox modal when clicking outside of the image (backdrop click)', () => {
    render(<QuestionImage src={sampleSrc} alt="Diagrama de circuitos" />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    // Click to open zoom modal
    fireEvent.click(img);

    const dialog = screen.getByRole('dialog', { name: /Visualização ampliada/i });
    expect(dialog).toBeInTheDocument();

    // Click outside the image on the backdrop overlay
    fireEvent.click(dialog);

    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should NOT close lightbox modal when clicking directly on the zoomed image', () => {
    render(<QuestionImage src={sampleSrc} alt="Diagrama de circuitos" />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    // Click to open zoom modal
    fireEvent.click(img);

    const dialog = screen.getByRole('dialog', { name: /Visualização ampliada/i });
    expect(dialog).toBeInTheDocument();

    // Get the zoomed image inside the dialog and click it
    const zoomedImg = screen.getAllByRole('img', { name: 'Diagrama de circuitos' })[1]!;
    fireEvent.click(zoomedImg);

    // Modal should remain open
    expect(screen.getByRole('dialog', { name: /Visualização ampliada/i })).toBeInTheDocument();
  });
});
