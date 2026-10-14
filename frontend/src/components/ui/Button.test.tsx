import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button component', () => {
  it('should render children text properly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should invoke onClick callback when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled and not trigger onClick when disabled prop is true', async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading spinner and be disabled when isLoading is true', () => {
    render(<Button isLoading>Processing</Button>);

    const button = screen.getByRole('button', { name: /processing/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('should apply primary variant class tokens by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button.className).toContain('bg-brand-primary');
  });
});
