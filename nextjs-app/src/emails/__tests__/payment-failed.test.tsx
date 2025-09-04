import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PaymentFailedDay0 from '../payment-failed-day-0';
import PaymentFailedDay7 from '../payment-failed-day-7';
import PaymentFailedDay13 from '../payment-failed-day-13';
import AccountDowngraded from '../account-downgraded';

describe('Payment Failed Email Templates', () => {
  describe('PaymentFailedDay0', () => {
    it('should render initial payment failure email', () => {
      const props = {
        userName: 'John Doe',
        accountName: 'Test Company',
        currentTier: 'PRO',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 14,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay0 {...props} />);
      const html = container.innerHTML;

      // Check for key content
      expect(html).toContain('John Doe');
      expect(html).toContain('Test Company');
      expect(html).toContain('14 days');
      expect(html).toContain('Payment Failed');
      expect(html).toContain('Update Payment Method');
      expect(html).toContain('September 16, 2025');
    });

    it('should display correct tier information', () => {
      const props = {
        userName: 'Jane Smith',
        accountName: 'Big Corp',
        currentTier: 'MAX',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 14,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay0 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('MAX');
    });

    it('should include clear call-to-action button', () => {
      const props = {
        userName: 'User',
        accountName: 'Company',
        currentTier: 'SCALE',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 14,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay0 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('href="https://app.wondrousdigital.com/billing"');
      expect(html).toContain('Update Payment Method');
    });

    it('should show consequences of not updating payment', () => {
      const props = {
        userName: 'Admin',
        accountName: 'Startup Inc',
        currentTier: 'PRO',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 14,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay0 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('downgraded to FREE');
      expect(html).toContain('lose access');
    });
  });

  describe('PaymentFailedDay7', () => {
    it('should render 7-day reminder email', () => {
      const props = {
        userName: 'John Doe',
        accountName: 'Test Company',
        currentTier: 'PRO',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 7,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay7 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('7 days');
      expect(html).toContain('Reminder');
      expect(html).toContain('update your payment');
    });

    it('should show increased urgency', () => {
      const props = {
        userName: 'User',
        accountName: 'Company',
        currentTier: 'MAX',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 7,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay7 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('one week');
      expect(html).toContain('act now');
    });
  });

  describe('PaymentFailedDay13', () => {
    it('should render urgent 1-day warning email', () => {
      const props = {
        userName: 'John Doe',
        accountName: 'Test Company',
        currentTier: 'SCALE',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 1,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay13 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('1 day');
      expect(html).toContain('tomorrow');
      expect(html).toContain('downgraded to FREE');
      expect(html).toContain('Update Payment Method');
    });

    it('should emphasize immediate action needed', () => {
      const props = {
        userName: 'Admin',
        accountName: 'Corp',
        currentTier: 'MAX',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 1,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay13 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('Update Payment Method');
      expect(html).toContain('1 day left');
    });

    it('should list specific features that will be lost', () => {
      const props = {
        userName: 'User',
        accountName: 'Business',
        currentTier: 'PRO',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 1,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay13 {...props} />);
      const html = container.innerHTML;

      // Should list PRO features that will be lost
      expect(html).toContain('Smart Marketing Platform');
      expect(html).toContain('5 projects');
      expect(html).toContain('3 user accounts');
    });
  });

  describe('AccountDowngraded', () => {
    it('should render downgrade confirmation email', () => {
      const props = {
        userName: 'John Doe',
        accountName: 'Test Company',
        oldTier: 'PRO',
        newTier: 'FREE',
        reactivateUrl: 'https://app.wondrousdigital.com/billing/plans'
      };

      const { container } = render(<AccountDowngraded {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('downgraded');
      expect(html).toContain('PRO');
      expect(html).toContain('FREE');
      expect(html).toContain('grace period has expired');
    });

    it('should explain what happened', () => {
      const props = {
        userName: 'User',
        accountName: 'Company',
        oldTier: 'MAX',
        newTier: 'FREE',
        reactivateUrl: 'https://app.wondrousdigital.com/billing/plans'
      };

      const { container } = render(<AccountDowngraded {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('unable to process payment');
      expect(html).toContain('14 days');
    });

    it('should list features that are now restricted', () => {
      const props = {
        userName: 'Admin',
        accountName: 'Business',
        oldTier: 'SCALE',
        newTier: 'FREE',
        reactivateUrl: 'https://app.wondrousdigital.com/billing/plans'
      };

      const { container } = render(<AccountDowngraded {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('1 project maximum');
      expect(html).toContain('No Smart Marketing Platform');
    });

    it('should provide path to reactivate', () => {
      const props = {
        userName: 'Owner',
        accountName: 'Startup',
        oldTier: 'PRO',
        newTier: 'FREE',
        reactivateUrl: 'https://app.wondrousdigital.com/billing/plans'
      };

      const { container } = render(<AccountDowngraded {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('Reactivate');
      expect(html).toContain('upgrade back');
      expect(html).toContain('href="https://app.wondrousdigital.com/billing/plans"');
    });
  });

  describe('Email Template Consistency', () => {
    it('should use consistent branding across all templates', () => {
      const templates = [
        <PaymentFailedDay0 
          userName="Test"
          accountName="Test Co"
          currentTier="PRO"
          gracePeriodEndsAt="2025-09-16T10:00:00Z"
          daysRemaining={14}
          updatePaymentUrl="https://test.com"
        />,
        <PaymentFailedDay7 
          userName="Test"
          accountName="Test Co"
          currentTier="PRO"
          gracePeriodEndsAt="2025-09-16T10:00:00Z"
          daysRemaining={7}
          updatePaymentUrl="https://test.com"
        />,
        <PaymentFailedDay13 
          userName="Test"
          accountName="Test Co"
          currentTier="PRO"
          gracePeriodEndsAt="2025-09-16T10:00:00Z"
          daysRemaining={1}
          updatePaymentUrl="https://test.com"
        />,
        <AccountDowngraded 
          userName="Test"
          accountName="Test Co"
          oldTier="PRO"
          newTier="FREE"
          reactivateUrl="https://test.com"
        />
      ];

      templates.forEach(template => {
        const { container } = render(template);
        const html = container.innerHTML;

        // Check for consistent branding elements
        expect(html).toContain('Wondrous Digital');
        expect(html).toContain('hello@wondrousdigital.com');
        expect(html).toContain('wondrous-logo.png');
      });
    });

    it('should use consistent styling and layout', () => {
      const templates = [
        PaymentFailedDay0,
        PaymentFailedDay7,
        PaymentFailedDay13,
        AccountDowngraded
      ];

      templates.forEach(Template => {
        // Each template should use the shared email components
        expect(Template.toString()).toContain('EmailContainer');
        expect(Template.toString()).toContain('EmailHeader');
        expect(Template.toString()).toContain('EmailButton');
        expect(Template.toString()).toContain('EmailFooter');
      });
    });
  });

  describe('Accessibility', () => {
    it('should include alt text for images', () => {
      const props = {
        userName: 'User',
        accountName: 'Company',
        currentTier: 'PRO',
        gracePeriodEndsAt: '2025-09-16T10:00:00Z',
        daysRemaining: 14,
        updatePaymentUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<PaymentFailedDay0 {...props} />);
      const html = container.innerHTML;

      expect(html).toContain('alt="Wondrous Digital"');
    });

    it('should use semantic HTML', () => {
      const props = {
        userName: 'User',
        accountName: 'Company',
        oldTier: 'PRO',
        newTier: 'FREE',
        reactivateUrl: 'https://app.wondrousdigital.com/billing'
      };

      const { container } = render(<AccountDowngraded {...props} />);
      const html = container.innerHTML;

      // Should have structured content
      expect(html).toContain('style=');
      // Should use paragraphs for text content
      expect(html).toContain('<p');
    });
  });
});