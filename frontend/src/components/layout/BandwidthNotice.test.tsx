import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BandwidthNotice } from './BandwidthNotice';

describe('BandwidthNotice component', () => {
  const originalNavigator = window.navigator;

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('should not render when connection is fast or forcedStatus is false', () => {
    const { container } = render(<BandwidthNotice forcedStatus={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render banner when forcedStatus is true', () => {
    render(<BandwidthNotice forcedStatus={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Modo Economia de Dados/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Imagens de diagramas e equações KaTeX otimizadas/i)
    ).toBeInTheDocument();
  });

  it('should automatically detect slow connection via navigator.connection', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        connection: {
          saveData: true,
          effectiveType: '3g',
        },
      },
      configurable: true,
      writable: true,
    });

    render(<BandwidthNotice />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Modo Economia de Dados \(3G\) Ativo/i)).toBeInTheDocument();
  });

  it('should dismiss the banner when the close button is clicked', () => {
    render(<BandwidthNotice forcedStatus={true} />);

    const dismissBtn = screen.getByRole('button', {
      name: /Dispensar aviso de economia de dados/i,
    });
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
