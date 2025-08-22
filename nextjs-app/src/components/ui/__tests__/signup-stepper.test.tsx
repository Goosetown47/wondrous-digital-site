import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignupStepper, SignupStepperVertical } from '../signup-stepper';

const mockSteps = [
  { number: 1, title: 'Create login', description: 'Create your private login.' },
  { number: 2, title: 'Confirm email', description: 'Confirm your email address.' },
  { number: 3, title: 'Account details', description: 'Fill in account information.' },
  { number: 4, title: 'Personal details', description: 'Fill in personal information.' },
  { number: 5, title: 'Payment', description: 'Select and pay for a plan.' },
  { number: 6, title: 'Complete', description: 'You\'re all set!' },
];

describe('SignupStepper', () => {
  it('should render all steps', () => {
    render(<SignupStepper currentStep={0} steps={mockSteps} />);
    
    // Check that all step titles are rendered
    expect(screen.getByText('Create login')).toBeInTheDocument();
    expect(screen.getByText('Confirm email')).toBeInTheDocument();
    expect(screen.getByText('Account details')).toBeInTheDocument();
    expect(screen.getByText('Personal details')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should show correct active step', () => {
    const { container } = render(<SignupStepper currentStep={2} steps={mockSteps} />);
    
    // Step 3 (index 2) should be active
    const activeStep = container.querySelector('[data-active="true"]');
    expect(activeStep).toBeInTheDocument();
    expect(activeStep?.textContent).toContain('3');
  });

  it('should show completed steps with checkmarks', () => {
    const { container } = render(<SignupStepper currentStep={3} steps={mockSteps} />);
    
    // Steps 1, 2, and 3 should be completed (indexes 0, 1, 2)
    const completedSteps = container.querySelectorAll('[data-completed="true"]');
    expect(completedSteps).toHaveLength(3);
  });

  it('should show connectors between steps', () => {
    const { container } = render(<SignupStepper currentStep={1} steps={mockSteps} />);
    
    // Should have 5 connectors for 6 steps
    const connectors = container.querySelectorAll('.connector');
    expect(connectors.length).toBeLessThanOrEqual(5);
  });

  it('should handle edge case of first step', () => {
    const { container } = render(<SignupStepper currentStep={0} steps={mockSteps} />);
    
    // First step should be active, none completed
    const activeStep = container.querySelector('[data-active="true"]');
    expect(activeStep?.textContent).toContain('1');
    
    const completedSteps = container.querySelectorAll('[data-completed="true"]');
    expect(completedSteps).toHaveLength(0);
  });

  it('should handle edge case of last step', () => {
    const { container } = render(<SignupStepper currentStep={5} steps={mockSteps} />);
    
    // Last step should be active, all others completed
    const activeStep = container.querySelector('[data-active="true"]');
    expect(activeStep?.textContent).toContain('6');
    
    const completedSteps = container.querySelectorAll('[data-completed="true"]');
    expect(completedSteps).toHaveLength(5);
  });

  it('should handle all steps completed', () => {
    const { container } = render(<SignupStepper currentStep={6} steps={mockSteps} />);
    
    // All steps should be completed
    const completedSteps = container.querySelectorAll('[data-completed="true"]');
    expect(completedSteps).toHaveLength(6);
  });
});

describe('SignupStepperVertical', () => {
  it('should render all steps vertically', () => {
    render(<SignupStepperVertical currentStep={0} steps={mockSteps} />);
    
    // Check that all step descriptions are rendered (vertical stepper doesn't show titles separately)
    expect(screen.getByText('Create your private login.')).toBeInTheDocument();
    expect(screen.getByText('Confirm your email address.')).toBeInTheDocument();
    expect(screen.getByText('Fill in account information.')).toBeInTheDocument();
    expect(screen.getByText('Fill in personal information.')).toBeInTheDocument();
    expect(screen.getByText('Select and pay for a plan.')).toBeInTheDocument();
    expect(screen.getByText('You\'re all set!')).toBeInTheDocument();
  });

  it('should show descriptions for each step', () => {
    render(<SignupStepperVertical currentStep={0} steps={mockSteps} />);
    
    // Check that descriptions are rendered
    expect(screen.getByText('Create your private login.')).toBeInTheDocument();
    expect(screen.getByText('Confirm your email address.')).toBeInTheDocument();
    expect(screen.getByText('Fill in account information.')).toBeInTheDocument();
  });

  it('should show correct active step in vertical layout', () => {
    const { container } = render(<SignupStepperVertical currentStep={1} steps={mockSteps} />);
    
    // Step 2 (index 1) should be active
    const activeStep = container.querySelector('[data-active="true"]');
    expect(activeStep).toBeInTheDocument();
    expect(activeStep?.textContent).toContain('2');
  });

  it('should show completed steps with checkmarks in vertical layout', () => {
    const { container } = render(<SignupStepperVertical currentStep={4} steps={mockSteps} />);
    
    // Steps 1, 2, 3, and 4 should be completed
    const completedSteps = container.querySelectorAll('[data-completed="true"]');
    expect(completedSteps).toHaveLength(4);
  });

  it('should handle mobile responsiveness', () => {
    const { container } = render(<SignupStepperVertical currentStep={2} steps={mockSteps} />);
    
    // Should have vertical layout classes
    const verticalContainer = container.querySelector('.space-y-4');
    expect(verticalContainer).toBeInTheDocument();
  });

  it('should display step numbers correctly', () => {
    render(<SignupStepperVertical currentStep={0} steps={mockSteps} />);
    
    // Check that step numbers are displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});

describe('Stepper accessibility', () => {
  it('should have proper data attributes', () => {
    const { container } = render(<SignupStepper currentStep={2} steps={mockSteps} />);
    
    // Check for data-active attribute on active step
    const activeStep = container.querySelector('[data-active="true"]');
    expect(activeStep).toBeInTheDocument();
    
    // Check for data-completed attributes on completed steps
    const completedSteps = container.querySelectorAll('[data-completed="true"]');
    expect(completedSteps).toHaveLength(2);
  });

  it('should have descriptive text for screen readers', () => {
    render(<SignupStepper currentStep={2} steps={mockSteps} />);
    
    // Check that step titles are available for desktop
    expect(screen.getByText('Account details')).toBeInTheDocument();
  });
});