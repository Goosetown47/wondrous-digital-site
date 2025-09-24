import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HoverZone } from '../HoverZone';

describe('HoverZone', () => {
  it('should render with hidden state by default', () => {
    render(<HoverZone position={0} onAddClick={() => {}} />);
    const zone = screen.getByTestId('hover-zone-0');
    expect(zone).toBeInTheDocument();
    expect(zone).toHaveClass('opacity-0');
  });

  it('should show plus icon on hover', () => {
    render(<HoverZone position={1} onAddClick={() => {}} />);
    const zone = screen.getByTestId('hover-zone-1');

    fireEvent.mouseEnter(zone);
    expect(zone).toHaveClass('opacity-100');

    fireEvent.mouseLeave(zone);
    expect(zone).toHaveClass('opacity-0');
  });

  it('should call onAddClick with position when clicked', () => {
    const onAddClick = vi.fn();
    render(<HoverZone position={2} onAddClick={onAddClick} />);

    const zone = screen.getByTestId('hover-zone-2');
    fireEvent.click(zone);

    expect(onAddClick).toHaveBeenCalledWith(2);
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it('should render centered for empty state', () => {
    render(<HoverZone position={0} onAddClick={() => {}} isEmpty />);
    const zone = screen.getByTestId('hover-zone-empty');
    expect(zone).toBeInTheDocument();
    expect(zone).toHaveClass('min-h-[200px]');
  });

  it('should have accessible button with aria-label', () => {
    render(<HoverZone position={0} onAddClick={() => {}} />);
    const button = screen.getByRole('button', { name: /add section at position 0/i });
    expect(button).toBeInTheDocument();
  });
});