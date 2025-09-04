import * as React from 'react';
import { Html, Head, Body, Section, Text, Hr } from '@react-email/components';
import { EmailContainer } from './components/email-container';
import { EmailHeader } from './components/email-header';
import { EmailButton } from './components/email-button';
import { EmailFooter } from './components/email-footer';
import { EmailChecklist } from './components/email-checklist';
import { styles } from './components/email-styles';
import { format } from 'date-fns';

interface PaymentFailedDay0Props {
  userName: string;
  accountName: string;
  currentTier: string;
  gracePeriodEndsAt: string;
  daysRemaining: number;
  updatePaymentUrl: string;
}

export const PaymentFailedDay0: React.FC<PaymentFailedDay0Props> = ({
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
        <EmailContainer preview="Payment failed - You have 14 days to update your payment method">
          <EmailHeader />
          
          <Section style={styles.contentSection}>
            <Text style={styles.title}>
              Payment Failed - Action Required
            </Text>
            
            <Text style={styles.paragraph}>
              Hi {userName},
            </Text>
            
            <Text style={styles.paragraph}>
              We were unable to process your payment for {accountName}'s {currentTier} subscription. 
              Don't worry - you have <strong>{daysRemaining} days</strong> to update your payment method 
              and keep your account active.
            </Text>
            
            <Section style={{ ...styles.highlightSection, backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
              <Text style={{ ...styles.paragraph, margin: 0, fontWeight: 600 }}>
                ⚠️ Important: Your account will be downgraded to FREE on {gracePeriodEndDate} if payment is not updated.
              </Text>
            </Section>
            
            <EmailButton href={updatePaymentUrl}>
              Update Payment Method
            </EmailButton>
            
            <Hr style={styles.divider} />
            
            <Text style={styles.sectionHeader}>
              What happens if you don't update your payment?
            </Text>
            
            <EmailChecklist
              items={[
                `On ${gracePeriodEndDate}, your account will be downgraded to FREE`,
                `You'll lose access to ${currentTier} features`,
                'Your projects may be limited or paused',
                'Smart Marketing Platform access will be removed',
                'Team members may lose access'
              ]}
              iconColor="#ef4444"
            />
            
            <Text style={styles.paragraph}>
              We understand that payment issues happen. That's why we're giving you plenty of time to resolve this. 
              Simply click the button above to update your payment method and continue enjoying all {currentTier} features.
            </Text>
            
            <Hr style={styles.divider} />
            
            <Text style={styles.sectionHeader}>
              Need help?
            </Text>
            
            <Text style={styles.paragraph}>
              If you're having trouble updating your payment or have questions about your subscription, 
              we're here to help. Just reply to this email or contact us at hello@wondrousdigital.com.
            </Text>
          </Section>
          
          <EmailFooter includeSupport={false} />
        </EmailContainer>
      </Body>
    </Html>
  );
};

export default PaymentFailedDay0;