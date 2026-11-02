import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseSelector } from './CourseSelector';

describe('CourseSelector Component', () => {
  it('renders input with placeholder and label', () => {
    const handleChange = vi.fn();
    render(
      <CourseSelector
        value=""
        onChange={handleChange}
        label="Curso dos Sonhos"
        placeholder="Escolha seu curso..."
      />
    );

    expect(screen.getByLabelText(/Curso dos Sonhos/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escolha seu curso.../i)).toBeInTheDocument();
  });

  it('opens options listbox on focus and filters by text', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<CourseSelector value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByText('Direito')).toBeInTheDocument();

    await user.type(input, 'computação');
    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument();
  });

  it('selects course on click and fires onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<CourseSelector value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    const medicineOption = screen.getByText('Medicina');
    await user.click(medicineOption);

    expect(handleChange).toHaveBeenCalledWith('Medicina');
  });

  it('displays SISU benchmark card when matching course is selected', () => {
    render(<CourseSelector value="Medicina" onChange={vi.fn()} />);

    expect(screen.getByTestId('sisu-benchmark-card')).toBeInTheDocument();
    expect(screen.getByText(/Meta SISU: Medicina/i)).toBeInTheDocument();
    expect(screen.getByText(/Corte Médio: ~805 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/85% de proficiência TRI/i)).toBeInTheDocument();
  });

  it('clears selected course when clear button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<CourseSelector value="Direito" onChange={handleChange} />);

    const clearBtn = screen.getByLabelText(/Limpar curso selecionado/i);
    await user.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('supports keyboard navigation via ArrowDown and Enter', () => {
    const handleChange = vi.fn();
    render(<CourseSelector value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalled();
  });

  it('highlights option on mouse enter with active hover styling', () => {
    const handleChange = vi.fn();
    render(<CourseSelector value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);

    fireEvent.mouseEnter(options[0]!);
    expect(options[0]).toHaveClass('bg-slate-100');
  });
});
