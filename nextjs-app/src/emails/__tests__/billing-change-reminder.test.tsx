import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@react-email/render';
import * as React from 'react';
import BillingChangeReminderEmail from '../billing-change-reminder';
import { sendTestEmail } from '../../lib/services/__tests__/test-email-sender';

describe('BillingChangeReminderEmail', () => {
  const mockAccountData = {
    accountName: 'Acme Corp',
    contactEmail: 'billing@acmecorp.com',
    currentPlan: {
      tier: 'MAX',
      billingPeriod: 'yearly',
      amount: 997,
      features: {
        projects: 25,
        users: 10,
        customDomains: true,
        smartMarketing: true,
        performAddon: false
      }
    },
    targetPlan: {
      tier: 'PRO',
      billingPeriod: 'monthly',
      amount: 397,
      features: {
        projects: 5,
        users: 3,
        customDomains: true,
        smartMarketing: true,
        performAddon: false
      }
    },
    changeDate: new Date('2025-09-30'),
    requestDate: new Date('2025-08-30'),
    daysUntilChange: 30
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Reminder Content', () => {
    it('should render 30-day reminder with correct content', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          daysUntilChange={30}
          reminderType="30_days"
        />
      );

      expect(html).toContain('This is a reminder that your billing will change in 30 days');
      expect(html).toContain('MAX Yearly');
      expect(html).toContain('PRO Monthly');
      expect(html).toContain('$397.00');
      expect(html).toContain('down from');
    });

    it('should render 14-day reminder with correct content', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          daysUntilChange={14}
          reminderType="14_days"
        />
      );

      expect(html).toContain('This is a reminder that your billing will change in 14 days');
      expect(html).toContain('Two weeks until your billing changes');
    });

    it('should render 7-day reminder with correct content', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          daysUntilChange={7}
          reminderType="7_days"
        />
      );

      expect(html).toContain('This is a reminder that your billing will change in 7 days');
      expect(html).toContain('One week until your billing changes');
    });

    it('should render 1-day reminder with correct content', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          daysUntilChange={1}
          reminderType="1_day"
        />
      );

      expect(html).toContain('This is a reminder that your billing will change tomorrow');
      expect(html).toContain('Tomorrow your billing changes');
    });
  });

  describe('Plan Details Display', () => {
    it('should display current plan details correctly', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          reminderType="30_days"
        />
      );

      expect(html).toContain('Account Changes');
      expect(html).toContain('MAX Yearly');
      expect(html).toContain('down from 25');
      expect(html).toContain('down from 10');
    });

    it('should display target plan details correctly', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          reminderType="30_days"
        />
      );

      expect(html).toContain('PRO Monthly');
      expect(html).toContain('5 projects');
      expect(html).toContain('3 user accounts');
    });
  });

  describe('Feature Comparison', () => {
    it('should show feature comparison for tier changes', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          reminderType="30_days"
        />
      );

      expect(html).toContain('Account Changes');
      expect(html).toContain('down from 25');
      expect(html).toContain('down from 10');
    });

    it('should show billing period switch information', async () => {
      const billingSwitch = {
        ...mockAccountData,
        currentPlan: { ...mockAccountData.currentPlan, tier: 'MAX', billingPeriod: 'yearly' },
        targetPlan: { ...mockAccountData.targetPlan, tier: 'MAX', billingPeriod: 'monthly' }
      };

      const html = await render(
        <BillingChangeReminderEmail
          {...billingSwitch}
          reminderType="7_days"
        />
      );

      expect(html).toContain('MAX Monthly');
      expect(html).toContain('Your account has');
    });
  });

  describe('Action Buttons', () => {
    it('should include action buttons with correct links', async () => {
      const html = await render(
        <BillingChangeReminderEmail
          {...mockAccountData}
          reminderType="30_days"
        />
      );

      expect(html).toContain('Review Changes in Billing');
      expect(html).toContain('href="https://app.wondrousdigital.com/billing"');
    });
  });

  describe('Test Email Integration', () => {
    it('should send test email to doyixo9427@besaies.com successfully', async () => {
      const result = await sendTestEmail({
        to: 'doyixo9427@besaies.com',
        template: 'billing-change-reminder',
        data: {
          ...mockAccountData,
          reminderType: '30_days'
        }
      });

      expect(result.success).toBe(true);
      expect(result.emailId).toBeDefined();
    });
  });
});