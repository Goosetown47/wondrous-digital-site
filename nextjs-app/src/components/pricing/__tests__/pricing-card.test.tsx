import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCard } from '../pricing-card';

describe('PricingCard', () => {
  const defaultProps = {
    tier: 'PRO' as const,
    name: 'Pro',
    description: 'Perfect for growing businesses',
    monthlyPrice: 39700, // $397 in cents
    setupFee: 150000, // $1,500 in cents
    features: [
      '5 Projects',
      'Custom domains',
      'Priority support',
    ],
    onSelect: vi.fn(),
    isPopular: false,
    disabled: false,
    isAuthenticated: false,
  };

  it('should render pricing card with all props', () => {
    render(<PricingCard {...defaultProps} />);

    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Perfect for growing businesses')).toBeInTheDocument();
    expect(screen.getByText('$397')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
    expect(screen.getByText('5 Projects')).toBeInTheDocument();
    expect(screen.getByText('Custom domains')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('should show popular badge when isPopular is true', () => {
    render(<PricingCard {...defaultProps} isPopular={true} />);
    
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('should not show popular badge when isPopular is false', () => {
    render(<PricingCard {...defaultProps} isPopular={false} />);
    
    expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();
  });

  it('should call onSelect when button is clicked', () => {
    const onSelect = vi.fn();
    render(<PricingCard {...defaultProps} onSelect={onSelect} />);
    
    const button = screen.getByRole('button', { name: 'Get Started' });
    fireEvent.click(button);
    
    expect(onSelect).toHaveBeenCalledWith('PRO');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should disable button when disabled prop is true', () => {
    render(<PricingCard {...defaultProps} disabled={true} />);
    
    const button = screen.getByRole('button', { name: 'Get Started' });
    expect(button).toBeDisabled();
  });

  it('should not call onSelect when disabled button is clicked', () => {
    const onSelect = vi.fn();
    render(<PricingCard {...defaultProps} disabled={true} onSelect={onSelect} />);
    
    const button = screen.getByRole('button', { name: 'Get Started' });
    fireEvent.click(button);
    
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should render correct button text based on authentication', () => {
    render(<PricingCard {...defaultProps} />);
    
    // When not authenticated, it should show "Get Started"
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
  });

  it('should format monthly price correctly', () => {
    render(<PricingCard {...defaultProps} />);
    
    // The price should be formatted from cents to dollars
    expect(screen.getByText('$397')).toBeInTheDocument();
  });

  it('should apply special styling for popular cards', () => {
    const { container } = render(<PricingCard {...defaultProps} isPopular={true} />);
    
    // Check if the popular card has special border or styling
    const card = container.querySelector('[class*="border-primary"]') || 
                 container.querySelector('[class*="ring"]');
    expect(card).toBeInTheDocument();
  });

  it('should render all features with check icons', () => {
    render(<PricingCard {...defaultProps} />);
    
    defaultProps.features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
    
    // Check for check icons (assuming they're rendered as SVGs or icons)
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(defaultProps.features.length);
  });

  it('should handle empty features array', () => {
    render(<PricingCard {...defaultProps} features={[]} />);
    
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('should handle long feature descriptions', () => {
    const longFeatures = [
      'This is a very long feature description that should wrap properly in the card',
      'Another extremely detailed feature that explains everything about the tier',
    ];
    
    render(<PricingCard {...defaultProps} features={longFeatures} />);
    
    longFeatures.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });
});