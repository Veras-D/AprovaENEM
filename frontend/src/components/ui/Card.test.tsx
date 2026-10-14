import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

describe('Card component', () => {
  it('should render Card and its subcomponents properly', () => {
    render(
      <Card>
        <CardHeader>Header Content</CardHeader>
        <CardBody>Body Content</CardBody>
        <CardFooter>Footer Content</CardFooter>
      </Card>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should apply variant styles when requested', () => {
    const { container } = render(<Card variant="bordered">Bordered Card</Card>);
    expect(container.firstChild).toHaveClass('border-2');
  });
});
