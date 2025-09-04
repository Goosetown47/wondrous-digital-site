import * as React from 'react';
import { Html, Head, Body, Section, Text, Hr } from '@react-email/components';
import { EmailContainer } from './components/email-container';
import { EmailHeader } from './components/email-header';
import { EmailButton } from './components/email-button';
import { EmailFooter } from './components/email-footer';
import { styles } from './components/email-styles';
import { format } from 'date-fns';

interface PaymentFailedDay7Props {
  userName: string;
  accountName: string;
  currentTier: string;
  gracePeriodEndsAt: string;
  daysRemaining: number;
  updatePaymentUrl: string;
}

export const PaymentFailedDay7: React.FC<PaymentFailedDay7Props> = ({
  userName,
  accountName,
  currentTier,
  gracePeriodEndsAt,
  daysRemaining,
  updatePaymentUrl,
}) => {
  const gracePeriodEndDate = format(new Date(gracePeriodEndsAt), 'MMMM d, yyyy');
  
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <EmailContainer preview="Payment reminder - 7 days left to update your payment method">
          <EmailHeader />
          
          <Section style={styles.contentSection}>
            <Text style={{ ...styles.title, lineHeight: '1.4' }}>
              Reminder: {daysRemaining} Days Left to Update Payment
            </Text>
            
            <Text style={styles.paragraph}>
              Hi {userName},
            </Text>
            
            <Text style={styles.paragraph}>
              This is a friendly reminder that your payment for {accountName}'s {currentTier} subscription 
              failed last week. You have <strong>one week left</strong> to update your payment method.
            </Text>
            
            <Section style={{ ...styles.highlightSection, backgroundColor: '#fed7aa', borderColor: '#ea580c' }}>
              <Text style={{ ...styles.paragraph, margin: 0, fontWeight: 600, fontSize: '18px' }}>
                ⏰ Only {daysRemaining} days remaining
              </Text>
              <Text style={{ ...styles.paragraph, margin: '8px 0 0 0' }}>
                Your account will be downgraded on {gracePeriodEndDate}
              </Text>
            </Section>
            
            <Text style={styles.sectionHeader}>
              Why act now?
            </Text>
            
            <Text style={styles.paragraph}>
              By updating your payment today, you'll:
            </Text>
            
            <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>Keep all your {currentTier} features without interruption</li>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>Maintain access for your team members</li>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>Continue using the Smart Marketing Platform</li>
              <li style={{ ...styles.paragraph, marginBottom: '8px' }}>Avoid the hassle of re-upgrading later</li>
            </ul>
            
            <Text style={styles.paragraph}>
              Don't wait until the last minute. Update your payment now and you won't have to worry about it again.
            </Text>
            
            <EmailButton href={updatePaymentUrl}>
              Update Payment Method
            </EmailButton>
            
            <Hr style={styles.divider} />
            
            <Text style={{ ...styles.paragraph, fontSize: '14px', color: '#6b7280' }}>
              If you've already updated your payment, you can ignore this email. 
              If you need assistance, reply to this email or contact hello@wondrousdigital.com.
            </Text>
          </Section>
          
          <EmailFooter includeSupport={false} />
        </EmailContainer>
      </Body>
    </Html>
  );
};

export default PaymentFailedDay7;