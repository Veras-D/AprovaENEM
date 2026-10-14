import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VLibras } from './VLibras';
import { useAccessibilityStore } from '@/stores/useAccessibilityStore';

describe('VLibras component', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({ vlibrasEnabled: false });
    const existingScript = document.getElementById('vlibras-script');
    if (existingScript) {
      existingScript.remove();
    }
  });

  afterEach(() => {
    delete (window as unknown as { VLibras?: unknown }).VLibras;
  });

  it('should not render anything when vlibrasEnabled is false', () => {
    const { container } = render(<VLibras />);
    expect(container).toBeEmptyDOMElement();
    expect(document.getElementById('vlibras-script')).toBeNull();
  });

  it('should render VLibras markup and inject external script when vlibrasEnabled is true', () => {
    useAccessibilityStore.setState({ vlibrasEnabled: true });
    render(<VLibras />);

    expect(screen.getByLabelText('Tradutor de Libras VLibras')).toBeInTheDocument();
    const script = document.getElementById('vlibras-script') as HTMLScriptElement;
    expect(script).toBeInTheDocument();
    expect(script.src).toBe('https://vlibras.gov.br/app/vlibras-plugin.js');
  });

  it('should instantiate VLibras.Widget when window.VLibras is available', () => {
    const mockWidget = vi.fn();
    (window as unknown as { VLibras: { Widget: unknown } }).VLibras = {
      Widget: mockWidget,
    };

    useAccessibilityStore.setState({ vlibrasEnabled: true });
    render(<VLibras />);

    // Trigger script onload manually
    const script = document.getElementById('vlibras-script') as HTMLScriptElement;
    script.onload?.(new Event('load'));

    expect(mockWidget).toHaveBeenCalledWith('https://vlibras.gov.br/app');
  });
});
