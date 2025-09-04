import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailContainer } from './components/email-container';
import { EmailHeader } from './components/email-header';
import { EmailButton } from './components/email-button';
import { EmailFooter } from './components/email-footer';
import { styles } from './components/email-styles';
import { format } from 'date-fns';

interface PaymentFailedDay13Props {
  userName: string;
  accountName: string;
  currentTier: string;
  gracePeriodEndsAt: string;
  daysRemaining: number;
  updatePaymentUrl: string;
}

const getTierFeatures = (tier: string) => {
  switch (tier) {
    case 'MAX':
      return {
        projects: '25 projects',
        users: '10 user accounts',
        features: ['Smart Marketing Platform', 'Priority Support', 'Custom Domains', 'Advanced Analytics']
      };
    case 'SCALE':
      return {
        projects: '10 projects',
        users: '5 user accounts',
        features: ['Smart Marketing Platform', 'Priority Support', 'Custom Domains']
      };
    case 'PRO':
      return {
        projects: '5 projects',
        users: '3 user accounts',
        features: ['Smart Marketing Platform', 'Premium Support']
      };
    default:
      return {
        projects: '5 projects',
        users: '3 user accounts',
        features: ['Premium features']
      };
  }
};

export const PaymentFailedDay13: React.FC<PaymentFailedDay13Props> = ({
  userName,
  accountName,
  currentTier,
  gracePeriodEndsAt,
  updatePaymentUrl,
}) => {
  const gracePeriodEndDate = format(new Date(gracePeriodEndsAt), 'MMMM d, yyyy');
  const tierFeatures = getTierFeatures(currentTier);
  
  return (
    <EmailContainer preview="Urgent: 1 day left until your account is downgraded">
      <EmailHeader />
          
          <Section style={styles.contentSection}>
            <Text style={styles.title}>
              1 day left until your account is downgraded to FREE
            </Text>
            
            <Text style={styles.paragraph}>
              Hi {userName},
            </Text>
            
            <Text style={styles.paragraph}>
              This is a reminder that your {accountName} account will be downgraded tomorrow 
              if your payment method isn't updated.
            </Text>
            
            <Section style={{ 
              ...styles.highlightSection, 
              backgroundColor: '#fee2e2', 
              borderColor: '#dc2626',
              borderWidth: '2px'
            }}>
              <Text style={{ ...styles.paragraph, margin: 0 }}>
                Your account will be downgraded tomorrow
              </Text>
              <Text style={{ ...styles.paragraph, margin: '8px 0 0 0' }}>
                The downgrade to FREE will happen on {gracePeriodEndDate}
              </Text>
            </Section>
            
            <Text style={styles.sectionHeader}>
              You're about to lose:
            </Text>
            
            <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>{tierFeatures.projects}</li>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>{tierFeatures.users}</li>
              {tierFeatures.features.map((feature, index) => (
                <li key={index} style={{ ...styles.paragraph, marginBottom: '8px' }}>{feature}</li>
              ))}
            </ul>
            
            <Text style={styles.sectionHeader}>
              After downgrade:
            </Text>
            
            <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>Only 1 project</li>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>No Smart Marketing Platform</li>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>Basic support only</li>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>Limited features</li>
            </ul>
            
            <EmailButton href={updatePaymentUrl}>
              Update Payment Method
            </EmailButton>
            
            <Text style={{ ...styles.paragraph, fontSize: '14px', color: '#6b7280' }}>
              Need some help? Reach out to us at hello@wondrousdigital.com
            </Text>
          </Section>
          
          <EmailFooter includeSupport={false} />
        </EmailContainer>
  );
};

export default PaymentFailedDay13;