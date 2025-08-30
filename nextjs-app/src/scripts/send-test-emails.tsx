#!/usr/bin/env tsx
/**
 * Script to send test emails for all templates
 * Usage: npx tsx src/scripts/send-test-emails.ts
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import InvitationEmail from '../emails/invitation';
import PasswordResetEmail from '../emails/password-reset';
import BillingChangeReminderEmail from '../emails/billing-change-reminder';
import WelcomeEmail from '../emails/welcome';
import EmailConfirmation from '../emails/email-confirmation';

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);
const TEST_EMAIL = 'tyler.lahaie@hey.com';
const FROM_EMAIL = 'Wondrous Digital <notifications@wondrousdigital.com>';

interface EmailTemplate {
  name: string;
  subject: string;
  render: () => Promise<string>;
}

async function sendTestEmails() {
  console.log('🚀 Starting test email send to:', TEST_EMAIL);
  console.log('-------------------------------------------\n');

  const templates: EmailTemplate[] = [
    {
      name: '1. Invitation Email',
      subject: 'Test: You\'re invited to join Wondrous Digital',
      render: async () => await render(<InvitationEmail
        inviteeName="Tyler"
        inviterName="John Smith"
        inviterEmail="john@example.com"
        accountName="Acme Corporation"
        role="user"
        invitationLink="https://app.wondrousdigital.com/invite/test-abc123"
        expiresIn="7 days"
      />),
    },
    {
      name: '2. Password Reset Email',
      subject: 'Test: Reset your Wondrous Digital password',
      render: async () => await render(<PasswordResetEmail
        userName="Tyler"
        resetLink="https://app.wondrousdigital.com/reset/test-xyz789"
        expiresIn="1 hour"
      />),
    },
    {
      name: '3. Welcome Email',
      subject: 'Test: Welcome to Wondrous Digital! 🎉',
      render: async () => await render(<WelcomeEmail
        userName="Tyler"
        userEmail={TEST_EMAIL}
        accountName="Acme Corporation"
        tierName="PRO"
        dashboardLink="https://app.wondrousdigital.com/dashboard"
      />),
    },
    {
      name: '4. Email Confirmation',
      subject: 'Test: Please confirm your email address',
      render: async () => await render(<EmailConfirmation
        userName="Tyler"
        confirmationLink="https://app.wondrousdigital.com/confirm/test-confirm123"
        expiresIn="24 hours"
      />),
    },
    {
      name: '5. Billing Change Reminder (30 days)',
      subject: 'Test: Billing change reminder - 30 days notice',
      render: async () => await render(BillingChangeReminderEmail({
        accountName: 'Acme Corporation',
        contactEmail: TEST_EMAIL,
        currentPlan: {
          tier: 'MAX',
          billingPeriod: 'monthly',
          amount: 997,
          features: {
            projects: 25,
            users: 10,
            customDomains: true,
            smartMarketing: true,
            performAddon: false,
          },
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
            performAddon: false,
          },
        },
        changeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        requestDate: new Date(),
        daysUntilChange: 30,
        reminderType: '30_days',
      })),
    },
    {
      name: '6. Billing Change Reminder (7 days)',
      subject: 'Test: Billing change reminder - 7 days notice',
      render: async () => await render(BillingChangeReminderEmail({
        accountName: 'Acme Corporation',
        contactEmail: TEST_EMAIL,
        currentPlan: {
          tier: 'SCALE',
          billingPeriod: 'yearly',
          amount: 697 * 12,
          features: {
            projects: 10,
            users: 5,
            customDomains: true,
            smartMarketing: true,
            performAddon: true,
          },
        },
        targetPlan: {
          tier: 'SCALE',
          billingPeriod: 'monthly',
          amount: 697,
          features: {
            projects: 10,
            users: 5,
            customDomains: true,
            smartMarketing: true,
            performAddon: true,
          },
        },
        changeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requestDate: new Date(),
        daysUntilChange: 7,
        reminderType: '7_days',
      })),
    },
  ];

  const results = [];
  
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    
    // Add delay after first email to respect rate limit (2 per second)
    if (i > 0) {
      console.log('⏳ Waiting 1 second to respect rate limit...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`📧 Sending: ${template.name}`);
    
    try {
      const html = await template.render();
      
      if (!process.env.RESEND_API_KEY) {
        console.log(`⚠️  No RESEND_API_KEY found - Skipping actual send`);
        console.log(`   Would send to: ${TEST_EMAIL}`);
        console.log(`   Subject: ${template.subject}`);
        console.log(`   HTML length: ${html.length} characters\n`);
        results.push({ template: template.name, status: 'skipped' });
        continue;
      }

      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: TEST_EMAIL,
        subject: template.subject,
        html,
      });

      if (response.data) {
        console.log(`✅ Sent successfully! Email ID: ${response.data.id}\n`);
        results.push({ template: template.name, status: 'sent', id: response.data.id });
      } else if (response.error) {
        console.log(`❌ Failed to send: ${response.error.message}\n`);
        results.push({ template: template.name, status: 'failed', error: response.error.message });
      }
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}\n`);
      results.push({ template: template.name, status: 'error', error: error.message });
    }
  }

  console.log('\n-------------------------------------------');
  console.log('📊 SUMMARY');
  console.log('-------------------------------------------');
  
  const sent = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log(`✅ Sent: ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`📧 Total: ${results.length}`);
  
  console.log('\n-------------------------------------------');
  console.log('📝 DETAILS');
  console.log('-------------------------------------------');
  
  results.forEach(r => {
    const icon = r.status === 'sent' ? '✅' : r.status === 'skipped' ? '⚠️' : '❌';
    console.log(`${icon} ${r.template}: ${r.status}${r.id ? ` (${r.id})` : ''}${r.error ? ` - ${r.error}` : ''}`);
  });

  console.log('\n✨ Test email sending complete!');
  console.log(`Check ${TEST_EMAIL} inbox for the test emails.`);
}

// Run the script
sendTestEmails().catch(console.error);