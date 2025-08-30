import { Resend } from 'resend';

interface TestEmailOptions {
  to: string;
  template: string;
  data: any;
}

interface TestEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
  testEmailSent?: boolean;
}

/**
 * Send a test email for billing notification scenarios
 * This is used in tests to verify email functionality works end-to-end
 */
export async function sendTestEmail(options: TestEmailOptions): Promise<TestEmailResult> {
  const { to, template, data } = options;

  // In test mode, we'll simulate sending emails
  if (process.env.NODE_ENV === 'test') {
    // Simulate successful email send
    return {
      success: true,
      emailId: `test-email-${Date.now()}`,
      testEmailSent: to === 'doyixo9427@besaies.com'
    };
  }

  try {
    // Only create Resend instance when actually sending emails
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // In development/production, actually send the email
    const response = await resend.emails.send({
      from: 'Wondrous Digital <notifications@wondrousdigital.com>',
      to,
      subject: getEmailSubject(template, data),
      html: await renderEmailTemplate(template, data)
    });

    return {
      success: true,
      emailId: response.data?.id,
      testEmailSent: to === 'doyixo9427@besaies.com'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send test email for specific billing change scenario
 */
export async function sendTestEmailForScenario(
  scenario: '30_days' | '14_days' | '7_days' | '1_day',
  changeType: 'downgrade' | 'billing_switch'
): Promise<TestEmailResult> {
  const testData = getTestDataForScenario(scenario, changeType);
  
  return sendTestEmail({
    to: 'doyixo9427@besaies.com',
    template: 'billing-change-reminder',
    data: testData
  });
}

function getEmailSubject(template: string, data: any): string {
  const subjects: Record<string, string> = {
    'billing-change-reminder': `Billing Change Reminder: ${data.reminderType?.replace('_', ' ')} notice`,
    'billing-notifications-summary': 'Billing Notifications Summary Report'
  };

  return subjects[template] || 'Wondrous Digital Notification';
}

async function renderEmailTemplate(template: string, data: any): Promise<string> {
  // This would normally import and render the actual React email component
  // For testing, we'll return a simple HTML template
  
  if (template === 'billing-change-reminder') {
    return `
      <div>
        <h1>Billing Change Reminder</h1>
        <p>Dear ${data.account?.name || 'Customer'},</p>
        <p>This is a reminder that your billing will change in ${data.reminderType?.replace('_', ' ')}.</p>
        <p>Current Plan: ${data.account?.tier}</p>
        <p>New Plan: ${data.account?.pending_tier_change}</p>
        <p>Change Date: ${data.account?.pending_tier_change_date}</p>
        <a href="https://app.wondrousdigital.com/billing">Review Changes</a>
      </div>
    `;
  }

  if (template === 'billing-notifications-summary') {
    return `
      <div>
        <h1>Billing Notifications Summary</h1>
        <p>Report generated at: ${data.timestamp}</p>
        <p>Accounts processed: ${data.accountsProcessed}</p>
        <ul>
          ${Object.entries(data.notificationsSent || {})
            .map(([type, count]) => `<li>${type}: ${count}</li>`)
            .join('')}
        </ul>
      </div>
    `;
  }

  return '<div>Test email</div>';
}

function getTestDataForScenario(
  scenario: '30_days' | '14_days' | '7_days' | '1_day',
  changeType: 'downgrade' | 'billing_switch'
) {
  const baseAccount = {
    id: 'test-account',
    name: 'Test Company',
    email: 'doyixo9427@besaies.com'
  };

  if (changeType === 'downgrade') {
    return {
      account: {
        ...baseAccount,
        tier: 'MAX',
        pending_tier_change: 'PRO',
        pending_tier_change_date: getChangeDate(scenario)
      },
      reminderType: scenario,
      changeType: 'downgrade'
    };
  }

  return {
    account: {
      ...baseAccount,
      tier: 'MAX',
      pending_tier_change: 'MAX',
      current_billing_period: 'yearly',
      pending_billing_period: 'monthly',
      pending_tier_change_date: getChangeDate(scenario)
    },
    reminderType: scenario,
    changeType: 'billing_switch'
  };
}

function getChangeDate(scenario: '30_days' | '14_days' | '7_days' | '1_day'): string {
  const now = new Date();
  const daysToAdd = {
    '30_days': 30,
    '14_days': 14,
    '7_days': 7,
    '1_day': 1
  };

  now.setDate(now.getDate() + daysToAdd[scenario]);
  return now.toISOString();
}