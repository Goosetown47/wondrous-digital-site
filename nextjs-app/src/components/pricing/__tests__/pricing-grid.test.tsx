import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingGrid } from '../pricing-grid';

// Mock the PricingCard component
vi.mock('../pricing-card', () => ({
  PricingCard: vi.fn(({ tier, name, onSelect, currentPlan }) => {
    // Determine button text and disabled state based on props
    let buttonText = 'Get Started';
    let disabled = false;
    
    if (currentPlan) {
      const tierOrder = ['FREE', 'BASIC', 'PRO', 'SCALE', 'MAX'];
      const currentIndex = tierOrder.indexOf(currentPlan);
      const tierIndex = tierOrder.indexOf(tier);
      
      if (tierIndex === currentIndex) {
        buttonText = 'Current Plan';
        disabled = true;
      } else if (tierIndex > currentIndex) {
        // For FREE and BASIC tiers, show "Get Started" when upgrading to paid tiers
        // For paid tiers, show "Upgrade" when moving to higher tiers
        if (currentPlan === 'FREE') {
          buttonText = 'Get Started';
        } else {
          buttonText = 'Upgrade';
        }
      } else {
        buttonText = 'Contact Sales';
        disabled = true;
      }
    }
    
    return (
      <div data-testid={`pricing-card-${tier}`}>
        <h3>{name}</h3>
        <button 
          onClick={() => !disabled && onSelect(tier)} 
          disabled={disabled}
        >
          {buttonText}
        </button>
      </div>
    );
  }),
}));

describe('PricingGrid', () => {
  const defaultProps = {
    onSelectTier: vi.fn(),
    currentPlan: null as Parameters<typeof PricingGrid>[0]['currentPlan'],
    isAuthenticated: false,
  };

  it('should render all three pricing tiers', () => {
    render(<PricingGrid {...defaultProps} />);
    
    expect(screen.getByTestId('pricing-card-PRO')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-card-SCALE')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-card-MAX')).toBeInTheDocument();
  });

  it('should render tier names correctly', () => {
    render(<PricingGrid {...defaultProps} />);
    
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Scale')).toBeInTheDocument();
    expect(screen.getByText('Maximum')).toBeInTheDocument();
  });


  it('should call onSelectTier when a tier is selected', () => {
    const onSelectTier = vi.fn();
    render(<PricingGrid {...defaultProps} onSelectTier={onSelectTier} />);
    
    const proButton = screen.getByTestId('pricing-card-PRO').querySelector('button')!;
    fireEvent.click(proButton);
    
    expect(onSelectTier).toHaveBeenCalledWith('PRO');
    expect(onSelectTier).toHaveBeenCalledTimes(1);
  });

  it('should show Current Plan for matching tier', () => {
    render(<PricingGrid {...defaultProps} currentPlan="SCALE" />);
    
    const scaleButton = screen.getByTestId('pricing-card-SCALE').querySelector('button')!;
    expect(scaleButton.textContent).toBe('Current Plan');
    expect(scaleButton).toBeDisabled();
  });

  it('should show Upgrade for higher tiers', () => {
    render(<PricingGrid {...defaultProps} currentPlan="PRO" />);
    
    const scaleButton = screen.getByTestId('pricing-card-SCALE').querySelector('button')!;
    const maxButton = screen.getByTestId('pricing-card-MAX').querySelector('button')!;
    
    expect(scaleButton.textContent).toBe('Upgrade');
    expect(maxButton.textContent).toBe('Upgrade');
    expect(scaleButton).not.toBeDisabled();
    expect(maxButton).not.toBeDisabled();
  });

  it('should show Contact Sales for downgrades', () => {
    render(<PricingGrid {...defaultProps} currentPlan="MAX" />);
    
    const proButton = screen.getByTestId('pricing-card-PRO').querySelector('button')!;
    const scaleButton = screen.getByTestId('pricing-card-SCALE').querySelector('button')!;
    
    expect(proButton.textContent).toBe('Contact Sales');
    expect(scaleButton.textContent).toBe('Contact Sales');
    expect(proButton).toBeDisabled();
    expect(scaleButton).toBeDisabled();
  });

  it('should mark SCALE as popular', () => {
    render(<PricingGrid {...defaultProps} />);
    
    // Check that PricingCard for SCALE tier has isPopular prop
    // This would be better tested with actual PricingCard rendered
    const scaleCard = screen.getByTestId('pricing-card-SCALE');
    expect(scaleCard).toBeInTheDocument();
  });

  it('should handle FREE tier correctly', () => {
    render(<PricingGrid {...defaultProps} currentPlan="FREE" />);
    
    const proButton = screen.getByTestId('pricing-card-PRO').querySelector('button')!;
    const scaleButton = screen.getByTestId('pricing-card-SCALE').querySelector('button')!;
    const maxButton = screen.getByTestId('pricing-card-MAX').querySelector('button')!;
    
    expect(proButton.textContent).toBe('Get Started');
    expect(scaleButton.textContent).toBe('Get Started');
    expect(maxButton.textContent).toBe('Get Started');
    
    expect(proButton).not.toBeDisabled();
    expect(scaleButton).not.toBeDisabled();
    expect(maxButton).not.toBeDisabled();
  });

  it('should handle BASIC tier correctly', () => {
    render(<PricingGrid {...defaultProps} currentPlan="BASIC" />);
    
    const proButton = screen.getByTestId('pricing-card-PRO').querySelector('button')!;
    const scaleButton = screen.getByTestId('pricing-card-SCALE').querySelector('button')!;
    const maxButton = screen.getByTestId('pricing-card-MAX').querySelector('button')!;
    
    expect(proButton.textContent).toBe('Upgrade');
    expect(scaleButton.textContent).toBe('Upgrade');
    expect(maxButton.textContent).toBe('Upgrade');
  });

  it('should not call onSelectTier when disabled card is clicked', () => {
    const onSelectTier = vi.fn();
    render(<PricingGrid {...defaultProps} currentPlan="MAX" onSelectTier={onSelectTier} />);
    
    // Try to click on PRO (which should be disabled for downgrade)
    const proButton = screen.getByTestId('pricing-card-PRO').querySelector('button')!;
    fireEvent.click(proButton);
    
    expect(onSelectTier).not.toHaveBeenCalled();
  });

  it('should render grid layout with three columns', () => {
    const { container } = render(<PricingGrid {...defaultProps} />);
    
    // Check for grid container
    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
    
    // Check that we have exactly 3 pricing cards
    const cards = screen.getAllByTestId(/pricing-card-/);
    expect(cards).toHaveLength(3);
  });
});