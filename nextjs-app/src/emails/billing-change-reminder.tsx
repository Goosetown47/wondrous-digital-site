import React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface BillingChangeReminderEmailProps {
  accountName: string;
  contactEmail: string;
  currentPlan: {
    tier: string;
    billingPeriod: string;
    amount: number;
    features: {
      projects: number;
      users: number;
      customDomains: boolean;
      smartMarketing: boolean;
      performAddon: boolean;
    };
  };
  targetPlan: {
    tier: string;
    billingPeriod: string;
    amount: number;
    features: {
      projects: number;
      users: number;
      customDomains: boolean;
      smartMarketing: boolean;
      performAddon: boolean;
    };
  };
  changeDate: Date;
  requestDate: Date;
  daysUntilChange: number;
  reminderType: '30_days' | '14_days' | '7_days' | '1_day';
}

// Feature definitions matching the billing page
const TIER_FEATURES = {
  FREE: {
    userAccounts: 1,
    projects: 1,
    emails: 0,
    smsCalls: 0,
    aiWords: 0,
    premiumAutomations: 0,
    workflowAI: 0,
  },
  BASIC: {
    userAccounts: 1,
    projects: 3,
    emails: 1000,
    smsCalls: 50,
    aiWords: 100,
    premiumAutomations: 10,
    workflowAI: 5,
  },
  PRO: {
    userAccounts: 3,
    projects: 5,
    emails: 10000,
    smsCalls: 250,
    aiWords: 1000,
    premiumAutomations: 100,
    workflowAI: 25,
  },
  SCALE: {
    userAccounts: 5,
    projects: 10,
    emails: 20000,
    smsCalls: 750,
    aiWords: 5000,
    premiumAutomations: 500,
    workflowAI: 150,
  },
  MAX: {
    userAccounts: 10,
    projects: 25,
    emails: 45000,
    smsCalls: 1500,
    aiWords: 10000,
    premiumAutomations: 1000,
    workflowAI: 300,
  },
};

export default function BillingChangeReminderEmail({
  accountName,
  currentPlan,
  targetPlan,
  changeDate,
  requestDate,
  daysUntilChange,
  reminderType,
}: BillingChangeReminderEmailProps) {
  // Get the title based on reminder type
  const getTitle = () => {
    switch (reminderType) {
      case '1_day':
        return 'Tomorrow your billing changes.';
      case '7_days':
        return 'One week until your billing changes.';
      case '14_days':
        return 'Two weeks until your billing changes.';
      case '30_days':
        return 'Your billing change is scheduled.';
      default:
        return 'Your billing will change soon.';
    }
  };

  // Get the reminder text
  const getReminderText = () => {
    if (daysUntilChange === 1) {
      return 'This is a reminder that your billing will change tomorrow.';
    }
    return `This is a reminder that your billing will change in ${daysUntilChange} days.`;
  };

  // Format date consistently
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate remaining time
  const getRemainingTime = () => {
    const days = daysUntilChange;
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  // Get tier features for comparison
  const currentFeatures = TIER_FEATURES[currentPlan.tier as keyof typeof TIER_FEATURES] || TIER_FEATURES.PRO;
  const targetFeatures = TIER_FEATURES[targetPlan.tier as keyof typeof TIER_FEATURES] || TIER_FEATURES.PRO;

  // Format feature comparison
  const formatFeatureComparison = (current: number, target: number, label: string) => {
    if (current === target) return `${target.toLocaleString()} ${label}`;
    return `${target.toLocaleString()} ${label} (${target > current ? 'up' : 'down'} from ${current.toLocaleString()})`;
  };

  // Get billing period text
  const getBillingPeriodText = (tier: string, period: string) => {
    return `${tier} ${period === 'yearly' ? 'Yearly' : 'Monthly'}`;
  };

  // Styles
  const containerStyle = {
    backgroundColor: '#f3f4f6',
    padding: '40px 20px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
    overflow: 'hidden',
  };

  const logoSectionStyle = {
    textAlign: 'center' as const,
    padding: '32px 0',
  };

  const contentStyle = {
    padding: '0 48px 48px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 32px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const textStyle = {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#374151',
    margin: '0 0 16px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const sectionHeaderStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#9ca3af',
    margin: '32px 0 16px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const checkItemStyle = {
    display: 'flex',
    marginBottom: '12px',
  };

  const checkmarkStyle = {
    color: '#10b981',
    fontSize: '18px',
    marginRight: '12px',
    flexShrink: 0,
  };

  const checkTextStyle = {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#374151',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
  };

  const bulletListStyle = {
    marginLeft: '32px',
    marginTop: '16px',
  };

  const bulletItemStyle = {
    fontSize: '16px',
    lineHeight: '1.75',
    color: '#374151',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    margin: '32px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const footerStyle = {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '32px 0 0 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.wondrousdigital.com';
  // Always use production URL for images in emails (localhost URLs don't work in email clients)
  const imageUrl = 'https://app.wondrousdigital.com/images/wondrous-logo.png';

  return (
    <Html>
      <Head />
      <Preview>{getTitle()}</Preview>
      <Body style={containerStyle}>
        <Container style={cardStyle}>
          {/* Logo Section */}
          <Section style={logoSectionStyle}>
            <Img
              src={imageUrl}
              width="80"
              height="80"
              alt="Wondrous"
              style={{ margin: '0 auto' }}
            />
          </Section>

          {/* Content Section */}
          <Section style={contentStyle}>
            {/* Title */}
            <Text style={titleStyle}>
              {getTitle()}
            </Text>

            {/* Greeting */}
            <Text style={textStyle}>
              Dear {accountName},
            </Text>

            {/* Reminder Text */}
            <Text style={{ ...textStyle, marginBottom: '32px' }}>
              {getReminderText()}
            </Text>

            {/* Upcoming Billing Changes Section */}
            <Text style={sectionHeaderStyle}>
              Upcoming Billing Changes
            </Text>

            {/* Change scheduled */}
            <div style={checkItemStyle}>
              <span style={checkmarkStyle}>✓</span>
              <Text style={checkTextStyle}>
                You scheduled a change to your subscription on <strong>{formatDate(requestDate)}</strong> to{' '}
                <strong>{getBillingPeriodText(targetPlan.tier, targetPlan.billingPeriod)}</strong>
              </Text>
            </div>

            {/* Remaining time */}
            <div style={checkItemStyle}>
              <span style={checkmarkStyle}>✓</span>
              <Text style={checkTextStyle}>
                Your account has <strong>{getRemainingTime()}</strong> remaining of{' '}
                <strong>
                  {getBillingPeriodText(currentPlan.tier, currentPlan.billingPeriod)}
                  {currentPlan.billingPeriod === 'yearly' && ' at a 10% discount'}
                </strong>
              </Text>
            </div>

            {/* Change date */}
            <div style={checkItemStyle}>
              <span style={checkmarkStyle}>✓</span>
              <Text style={checkTextStyle}>
                The change to <strong>{getBillingPeriodText(targetPlan.tier, targetPlan.billingPeriod)}</strong>{' '}
                will occur on <strong>{formatDate(changeDate)}</strong>
              </Text>
            </div>

            {/* New rate */}
            <div style={checkItemStyle}>
              <span style={checkmarkStyle}>✓</span>
              <Text style={checkTextStyle}>
                We will charge you at the new rate of{' '}
                <strong>
                  {formatCurrency(targetPlan.amount)}
                  {targetPlan.billingPeriod === 'yearly' ? '/year' : '/month'}
                </strong>
              </Text>
            </div>

            {/* Account Changes Section */}
            <Text style={sectionHeaderStyle}>
              Account Changes
            </Text>

            {/* Keep same settings */}
            <div style={checkItemStyle}>
              <span style={checkmarkStyle}>✓</span>
              <Text style={checkTextStyle}>
                You keep all the same account settings
              </Text>
            </div>

            {/* Feature list */}
            <div style={bulletListStyle}>
              <Text style={bulletItemStyle}>
                • {formatFeatureComparison(currentFeatures.userAccounts, targetFeatures.userAccounts, 'user accounts')}
              </Text>
              <Text style={bulletItemStyle}>
                • {formatFeatureComparison(currentFeatures.projects, targetFeatures.projects, 'projects')}
              </Text>
              <Text style={bulletItemStyle}>
                • {formatFeatureComparison(currentFeatures.emails, targetFeatures.emails, 'emails per month')}
              </Text>
              <Text style={bulletItemStyle}>
                • {formatFeatureComparison(currentFeatures.smsCalls, targetFeatures.smsCalls, 'SMS/calls')}
              </Text>
              <Text style={bulletItemStyle}>
                • {formatFeatureComparison(currentFeatures.aiWords, targetFeatures.aiWords, 'AI words')}
              </Text>
              <Text style={bulletItemStyle}>
                • {formatFeatureComparison(currentFeatures.premiumAutomations, targetFeatures.premiumAutomations, 'premium automations')}
              </Text>
              <Text style={bulletItemStyle}>
                • {formatFeatureComparison(currentFeatures.workflowAI, targetFeatures.workflowAI, 'workflow AI executions')}
              </Text>
            </div>

            {/* CTA Button */}
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Link href={`${baseUrl}/billing`} style={buttonStyle}>
                Review Changes in Billing
              </Link>
            </Section>

            {/* Footer */}
            <Text style={footerStyle}>
              If you have any questions, please contact our support<br />
              team at <Link href="mailto:hello@wondrousdigital.com" style={{ color: '#9333ea' }}>hello@wondrousdigital.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}