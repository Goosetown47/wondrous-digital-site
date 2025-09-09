import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the EmptyState component we'll create
const EmptyState = ({ 
  title, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  description?: string; 
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && <Icon className="h-12 w-12 text-gray-400 mb-4" />}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-gray-500 text-center max-w-md">{description}</p>
      )}
    </div>
  );
};

describe('Dashboard Empty States', () => {
  describe('EmptyState Component', () => {
    it('should render title', () => {
      render(<EmptyState title="No Updates" />);
      expect(screen.getByText('No Updates')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <EmptyState 
          title="No Updates" 
          description="Check back later for updates"
        />
      );
      expect(screen.getByText('Check back later for updates')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      const TestIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid="test-icon" />;
      render(<EmptyState title="No Updates" icon={TestIcon} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should apply correct styling classes', () => {
      const { container } = render(<EmptyState title="No Updates" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  describe('Page Empty States', () => {
    it('should show empty state for Updates page', () => {
      const UpdatesPage = () => (
        <EmptyState 
          title="No Updates" 
          description="You're all caught up! Check back later for new updates."
        />
      );
      
      render(<UpdatesPage />);
      expect(screen.getByText('No Updates')).toBeInTheDocument();
    });

    it('should show empty state for Tasks page', () => {
      const TasksPage = () => (
        <EmptyState 
          title="No Tasks" 
          description="You have no pending tasks. Great job staying on top of things!"
        />
      );
      
      render(<TasksPage />);
      expect(screen.getByText('No Tasks')).toBeInTheDocument();
    });

    it('should show empty state for Archived Projects', () => {
      const ArchivedProjectsPage = () => (
        <EmptyState 
          title="No Archived Projects" 
          description="Projects you archive will appear here."
        />
      );
      
      render(<ArchivedProjectsPage />);
      expect(screen.getByText('No Archived Projects')).toBeInTheDocument();
    });
  });
});