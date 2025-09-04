import {
  Heading,
  Text,
  Section,
  Hr,
  Container,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './base-template';
import { styles } from './components/email-styles';

export interface CancellationNotificationProps {
  // Account Information
  accountName: string;
  accountId: string;
  accountTier: string;
  
  // User Information
  userEmail: string;
  userName?: string;
  userRole: string;
  
  // Cancellation Details
  cancellationReason?: string;
  additionalFeedback?: string;
  cancelledAt: string;
  subscriptionEndsAt: string;
  
  // Stripe Information
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  
  logoUrl?: string;
}

const reasonLabels: Record<string, string> = {
  too_expensive: '💰 Too expensive',
  not_using: '📉 Not using it enough',
  missing_features: '🔧 Missing features I need',
  found_alternative: '🔄 Found an alternative',
  technical_issues: '⚠️ Technical issues',
  other: '💭 Other reason',
};

export const CancellationNotificationEmail: React.FC<CancellationNotificationProps> = ({
  accountName,
  accountId,
  accountTier,
  userEmail,
  userName,
  userRole,
  cancellationReason,
  additionalFeedback,
  cancelledAt,
  subscriptionEndsAt,
  stripeCustomerId,
  stripeSubscriptionId,
  logoUrl,
}) => {
  const preview = `[Cancellation] ${accountName} - ${accountTier} Plan`;

  return (
    <BaseEmailTemplate
      preview={preview}
      logoUrl={logoUrl}
    >
      <Heading style={styles.title}>
        Subscription Cancellation Notice
      </Heading>
      
      <Text style={styles.paragraph}>
        A customer has cancelled their subscription. Details below:
      </Text>

      <Hr style={styles.divider} />

      <Section>
        <Heading as="h2" style={{ ...styles.subtitle, color: '#dc2626' }}>
          Account Information
        </Heading>
        <Container style={{ ...styles.box, marginBottom: 20 }}>
          <Text style={styles.paragraph}>
            <strong>Account Name:</strong> {accountName}<br />
            <strong>Account ID:</strong> {accountId}<br />
            <strong>Current Tier:</strong> {accountTier}
          </Text>
        </Container>
      </Section>

      <Section>
        <Heading as="h2" style={{ ...styles.subtitle, color: '#2563eb' }}>
          User Information
        </Heading>
        <Container style={{ ...styles.box, marginBottom: 20 }}>
          <Text style={styles.paragraph}>
            <strong>Email:</strong> {userEmail}<br />
            {userName && (<><strong>Name:</strong> {userName}<br /></>)}
            <strong>Role:</strong> {userRole}
          </Text>
        </Container>
      </Section>

      <Section>
        <Heading as="h2" style={{ ...styles.subtitle, color: '#7c3aed' }}>
          Cancellation Details
        </Heading>
        <Container style={{ ...styles.box, marginBottom: 20 }}>
          <Text style={styles.paragraph}>
            <strong>Reason Selected:</strong> {cancellationReason ? reasonLabels[cancellationReason] || cancellationReason : 'Not specified'}<br />
            <strong>Cancelled At:</strong> {cancelledAt}<br />
            <strong>Access Ends:</strong> {subscriptionEndsAt}
          </Text>
          
          {additionalFeedback && (
            <>
              <Text style={{ ...styles.paragraph, marginTop: 12 }}>
                <strong>Additional Feedback:</strong>
              </Text>
              <Container style={{ 
                ...styles.box, 
                backgroundColor: '#f9fafb',
                padding: 12,
                borderLeft: '3px solid #6b7280'
              }}>
                <Text style={{ ...styles.paragraph, margin: 0, fontStyle: 'italic' }}>
                  "{additionalFeedback}"
                </Text>
              </Container>
            </>
          )}
        </Container>
      </Section>

      {(stripeCustomerId || stripeSubscriptionId) && (
        <Section>
          <Heading as="h2" style={{ ...styles.subtitle, color: '#64748b' }}>
            Stripe Information
          </Heading>
          <Container style={{ ...styles.box, marginBottom: 20 }}>
            <Text style={styles.paragraph}>
              {stripeCustomerId && (<><strong>Customer ID:</strong> {stripeCustomerId}<br /></>)}
              {stripeSubscriptionId && (<><strong>Subscription ID:</strong> {stripeSubscriptionId}</>)}
            </Text>
          </Container>
        </Section>
      )}

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontSize: 12, color: '#6b7280', textAlign: 'center' as const }}>
        This is an automated notification from the Wondrous Digital billing system.
        Consider reaching out to the customer to understand their needs better and potentially win them back.
      </Text>
    </BaseEmailTemplate>
  );
};

export default CancellationNotificationEmail;