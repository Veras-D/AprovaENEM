import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarRenderer } from './AvatarRenderer';
import { DEFAULT_AVATAR_CONFIG } from '@/types';

describe('AvatarRenderer Component', () => {
  it('renders default avatar svg correctly', () => {
    render(<AvatarRenderer config={DEFAULT_AVATAR_CONFIG} />);
    const avatar = screen.getByRole('img', { name: /avatar do estudante/i });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('renders custom dimensions and custom aria label', () => {
    render(
      <AvatarRenderer
        config={DEFAULT_AVATAR_CONFIG}
        size={120}
        ariaLabel="Avatar personalizado de João"
      />
    );
    const avatar = screen.getByRole('img', { name: /avatar personalizado de joão/i });
    expect(avatar).toHaveAttribute('width', '120');
    expect(avatar).toHaveAttribute('height', '120');
  });

  it('renders correctly across different hair styles and accessories', () => {
    const { rerender } = render(
      <AvatarRenderer
        config={{
          ...DEFAULT_AVATAR_CONFIG,
          hairStyle: 'curly',
          accessory: 'graduationCap',
          clothingStyle: 'vest',
        }}
      />
    );
    expect(screen.getByText('ENEM')).toBeInTheDocument();

    rerender(
      <AvatarRenderer
        config={{
          ...DEFAULT_AVATAR_CONFIG,
          hairStyle: 'wavy',
          accessory: 'pencil',
          clothingStyle: 'hoodie',
          eyeExpression: 'glasses',
        }}
      />
    );
    expect(screen.getByRole('img')).toBeInTheDocument();

    rerender(
      <AvatarRenderer
        config={{
          ...DEFAULT_AVATAR_CONFIG,
          hairStyle: 'bald',
          accessory: 'none',
          clothingStyle: 'academic',
          eyeExpression: 'sunglasses',
        }}
      />
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
