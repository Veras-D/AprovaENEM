import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, type SelectOption } from './Select';

const sampleOptions: SelectOption[] = [
  { value: 'PUBLIC_SCHOOL', label: 'Escola Pública' },
  { value: 'PRIVATE_SCHOLARSHIP', label: 'Bolsista em Particular' },
  { value: 'PRIVATE_REGULAR', label: 'Escola Particular', disabled: true },
];

describe('Select Component', () => {
  it('renders label and current selected option label', () => {
    const handleChange = vi.fn();
    render(
      <Select
        id="test-select"
        label="Tipo de Escola"
        value="PUBLIC_SCHOOL"
        onChange={handleChange}
        options={sampleOptions}
      />
    );

    expect(screen.getByText('Tipo de Escola')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('Escola Pública');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders placeholder when value does not match any option', () => {
    render(
      <Select
        label="Selecione algo"
        value=""
        onChange={vi.fn()}
        options={sampleOptions}
        placeholder="Escolha uma opção"
      />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Escolha uma opção');
  });

  it('opens popup listbox when clicking trigger button and closes on option click', () => {
    const handleChange = vi.fn();
    render(
      <Select
        id="test-select"
        label="Tipo de Escola"
        value="PUBLIC_SCHOOL"
        onChange={handleChange}
        options={sampleOptions}
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click trigger to open
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const option2 = screen.getByRole('option', { name: /Bolsista em Particular/i });
    fireEvent.click(option2);

    expect(handleChange).toHaveBeenCalledWith('PRIVATE_SCHOLARSHIP');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not select disabled options', () => {
    const handleChange = vi.fn();
    render(
      <Select
        label="Tipo de Escola"
        value="PUBLIC_SCHOOL"
        onChange={handleChange}
        options={sampleOptions}
      />
    );

    fireEvent.click(screen.getByRole('combobox'));
    const disabledOption = screen.getByRole('option', { name: /Escola Particular/i });
    fireEvent.click(disabledOption);

    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('navigates options via keyboard ArrowDown, ArrowUp, and selects via Enter', () => {
    const handleChange = vi.fn();
    render(
      <Select
        label="Tipo de Escola"
        value="PUBLIC_SCHOOL"
        onChange={handleChange}
        options={sampleOptions}
      />
    );

    const trigger = screen.getByRole('combobox');

    // Press ArrowDown on closed trigger to open
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Arrow down to Bolsista em Particular
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    // Press Enter to select
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith('PRIVATE_SCHOLARSHIP');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes popup on Escape key', () => {
    render(
      <Select
        label="Tipo de Escola"
        value="PUBLIC_SCHOOL"
        onChange={vi.fn()}
        options={sampleOptions}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes popup when clicking outside', () => {
    render(
      <div>
        <span data-testid="outside">Fora</span>
        <Select
          label="Tipo de Escola"
          value="PUBLIC_SCHOOL"
          onChange={vi.fn()}
          options={sampleOptions}
        />
      </div>
    );

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports fireEvent.change on the synchronized hidden select for form test compatibility', () => {
    const handleChange = vi.fn();
    render(
      <Select
        id="reg-school-type"
        label="Tipo de Escola"
        value="PUBLIC_SCHOOL"
        onChange={handleChange}
        options={sampleOptions}
      />
    );

    const select = screen.getByLabelText('Tipo de Escola');
    fireEvent.change(select, { target: { value: 'PRIVATE_SCHOLARSHIP' } });

    expect(handleChange).toHaveBeenCalledWith('PRIVATE_SCHOLARSHIP');
  });
});
