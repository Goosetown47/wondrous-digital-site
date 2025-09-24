import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCard } from '../TemplateCard';

describe('TemplateCard', () => {
  const defaultProps = {
    id: 'template-1',
    name: 'Hero Section',
    type: 'section' as const,
    category: 'hero',
    previewImage: null,
    onClick: vi.fn(),
  };

  it('should render with placeholder image when no preview is provided', () => {
    render(<TemplateCard {...defaultProps} />);

    const placeholder = screen.getByTestId('placeholder-image');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('bg-gray-100');
  });

  it('should render preview image when provided', () => {
    render(
      <TemplateCard
        {...defaultProps}
        previewImage="/images/hero-preview.png"
      />
    );

    const image = screen.getByAltText('Hero Section preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/hero-preview.png');
  });

  it('should display name and type badge', () => {
    render(<TemplateCard {...defaultProps} />);

    expect(screen.getByText('Hero Section')).toBeInTheDocument();
    expect(screen.getByText('section')).toBeInTheDocument();
  });

  it('should show hover overlay with plus button', () => {
    render(<TemplateCard {...defaultProps} />);

    const card = screen.getByTestId('template-card-template-1');

    // Hover overlay should be initially hidden
    const overlay = screen.getByTestId('hover-overlay');
    expect(overlay).toHaveClass('opacity-0');

    // Hover over card
    fireEvent.mouseEnter(card);
    expect(overlay).toHaveClass('opacity-100');

    // Plus button should be visible
    const plusButton = screen.getByTestId('plus-button');
    expect(plusButton).toBeInTheDocument();

    // Mouse leave
    fireEvent.mouseLeave(card);
    expect(overlay).toHaveClass('opacity-0');
  });

  it('should call onClick with template data when clicked', () => {
    const onClick = vi.fn();
    render(<TemplateCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByTestId('template-card-template-1');
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledWith({
      id: 'template-1',
      name: 'Hero Section',
      type: 'section',
      category: 'hero',
    });
  });

  it('should have appropriate cursor and hover states', () => {
    render(<TemplateCard {...defaultProps} />);

    const card = screen.getByTestId('template-card-template-1');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-lg');
  });

  it('should display different badge colors for different types', () => {
    const { rerender } = render(<TemplateCard {...defaultProps} type="section" />);

    let badge = screen.getByText('section');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');

    rerender(<TemplateCard {...defaultProps} type="page" />);

    badge = screen.getByText('page');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');

    rerender(<TemplateCard {...defaultProps} type="site" />);

    badge = screen.getByText('site');
    expect(badge).toHaveClass('bg-purple-100');
    expect(badge).toHaveClass('text-purple-800');
  });

  it('should display category label', () => {
    render(<TemplateCard {...defaultProps} category="hero" />);

    expect(screen.getByText('hero')).toBeInTheDocument();
  });

  it('should handle long names with ellipsis', () => {
    render(
      <TemplateCard
        {...defaultProps}
        name="This is a very long template name that should be truncated with ellipsis"
      />
    );

    const nameElement = screen.getByText(/This is a very long template name/);
    expect(nameElement).toHaveClass('truncate');
  });

  it('should be keyboard accessible', () => {
    const onClick = vi.fn();
    render(<TemplateCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByTestId('template-card-template-1');

    // Should be focusable
    expect(card).toHaveAttribute('tabIndex', '0');

    // Should handle Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();

    // Should handle Space key
    onClick.mockClear();
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalled();
  });

  it('should have proper aria labels', () => {
    render(<TemplateCard {...defaultProps} />);

    const card = screen.getByTestId('template-card-template-1');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-label', 'Add Hero Section section');
  });
});