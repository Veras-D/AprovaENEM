import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptionSelector, type OptionItem } from './OptionSelector';

describe('OptionSelector Component', () => {
  const sampleOptions: readonly OptionItem[] = [
    { letter: 'A', text: '$10\\text{ m/s}$' },
    { letter: 'B', text: '$20\\text{ m/s}$' },
    { letter: 'C', text: '$30\\text{ m/s}$' },
    { letter: 'D', text: '$40\\text{ m/s}$' },
    { letter: 'E', text: '$50\\text{ m/s}$' },
  ];

  it('should render options inside a semantic fieldset and radiogroup', () => {
    const { container } = render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="B"
        onSelectOption={vi.fn()}
      />
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeInTheDocument();

    const legend = container.querySelector('legend');
    expect(legend).toBeInTheDocument();
    expect(legend?.textContent).toContain('Alternativas da questão');

    const radiogroup = screen.getByRole('radiogroup', { name: 'Alternativas da questão' });
    expect(radiogroup).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);

    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('should trigger onSelectOption when clicking an option', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    const optionC = screen.getAllByRole('radio')[2];
    expect(optionC).toBeDefined();
    fireEvent.click(optionC!);

    expect(handleSelect).toHaveBeenCalledWith('C');
  });

  it('should not trigger onSelectOption when disabled', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="A"
        onSelectOption={handleSelect}
        disabled={true}
      />
    );

    const optionD = screen.getAllByRole('radio')[3];
    expect(optionD).toBeDefined();
    fireEvent.click(optionD!);

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('should select option via keyboard hotkeys (A-E and 1-5)', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    // Press 'D'
    fireEvent.keyDown(window, { key: 'd' });
    expect(handleSelect).toHaveBeenCalledWith('D');

    // Press '2' (corresponds to B)
    fireEvent.keyDown(window, { key: '2' });
    expect(handleSelect).toHaveBeenCalledWith('B');
  });

  it('navigates options via ArrowDown and ArrowUp keys', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="B"
        onSelectOption={handleSelect}
      />
    );

    // Press ArrowDown: from B should select C
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(handleSelect).toHaveBeenCalledWith('C');

    // Press ArrowUp: from B should select A
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(handleSelect).toHaveBeenCalledWith('A');
  });

  it('triggers onSubmitAnswer when Enter is pressed with an option selected', () => {
    const handleSubmit = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="C"
        onSelectOption={vi.fn()}
        onSubmitAnswer={handleSubmit}
      />
    );

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should display correctness indicators when submitted in review mode', () => {
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption="C"
        correctOption="B"
        isSubmitted={true}
        onSelectOption={vi.fn()}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(5);
  });

  it('does not intercept browser shortcuts when modifier keys are pressed (e.g. Ctrl+C, Cmd+C, Ctrl+A)', () => {
    const handleSelect = vi.fn();
    render(
      <OptionSelector
        options={sampleOptions}
        selectedOption={null}
        onSelectOption={handleSelect}
      />
    );

    // Press Ctrl+C (copy) - should NOT select Option C
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
    expect(handleSelect).not.toHaveBeenCalled();

    // Press Cmd+C (macOS copy) - should NOT select Option C
    fireEvent.keyDown(window, { key: 'c', metaKey: true });
    expect(handleSelect).not.toHaveBeenCalled();

    // Press Ctrl+A (select all) - should NOT select Option A
    fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
