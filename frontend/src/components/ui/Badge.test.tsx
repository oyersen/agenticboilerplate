import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders badge children text correctly', () => {
    render(<Badge variant="success">Aktif</Badge>);
    expect(screen.getByText('Aktif')).toBeDefined();
  });

  it('applies danger variant classes', () => {
    const { container } = render(<Badge variant="danger">Hata</Badge>);
    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-rose-100');
  });
});
