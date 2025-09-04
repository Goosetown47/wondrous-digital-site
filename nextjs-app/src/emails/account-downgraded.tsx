import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailContainer } from './components/email-container';
import { EmailHeader } from './components/email-header';
import { EmailButton } from './components/email-button';
import { EmailFooter } from './components/email-footer';
import { EmailChecklist } from './components/email-checklist';
import { styles } from './components/email-styles';

interface AccountDowngradedProps {
  userName: string;
  accountName: string;
  oldTier: string;
  newTier: string;
  reactivateUrl: string;
}

export const AccountDowngraded: React.FC<AccountDowngradedProps> = ({
  userName,
  accountName,
  oldTier,
  newTier,
  reactivateUrl,
}) => {
  return (
    <EmailContainer preview="Your account has been downgraded due to payment failure">
      <EmailHeader />
          
          <Section style={styles.contentSection}>
            <Text style={styles.title}>
              Your Account Has Been Downgraded
            </Text>
            
            <Text style={styles.paragraph}>
              Hi {userName},
            </Text>
            
            <Text style={styles.paragraph}>
              We were unable to process payment for your {accountName} account after the 14-day grace period. 
              As a result, your account has been downgraded from <strong>{oldTier}</strong> to <strong>{newTier}</strong>.
            </Text>
            
            <Section style={{ ...styles.highlightSection, backgroundColor: '#f3f4f6', borderColor: '#9ca3af' }}>
              <Text style={{ ...styles.paragraph, margin: 0, fontWeight: 600 }}>
                What happened?
              </Text>
              <Text style={{ ...styles.paragraph, margin: '8px 0 0 0' }}>
                • Your payment failed 14 days ago<br />
                • We sent multiple reminders to update your payment method<br />
                • The grace period has expired without payment update<br />
                • Your account is now on the {newTier} plan
              </Text>
            </Section>
            
            <Text style={styles.paragraph}>
              We understand that circumstances change. If you need assistance with your account or 
              have questions about our plans, please don't hesitate to reach out.
            </Text>
            
            <Text style={styles.sectionHeader}>
              Current Account Limitations
            </Text>
            
            <Text style={styles.paragraph}>
              Your {newTier} account is now limited to:
            </Text>
            
            <EmailChecklist
              items={[
                '1 project maximum',
                'No Smart Marketing Platform access',
                'Basic support only',
                'Limited customization options',
                'No custom domains'
              ]}
              iconColor="#6b7280"
            />
            
            <Text style={styles.paragraph}>
              Any projects, users, or features beyond the {newTier} limits have been temporarily disabled. 
              They will be restored when you upgrade your plan.
            </Text>
            
            <Text style={styles.sectionHeader}>
              Ready to Reactivate?
            </Text>
            
            <Text style={styles.paragraph}>
              You can upgrade back to {oldTier} or any other plan at any time. 
              All your data and settings have been preserved and will be restored when you upgrade.
            </Text>
            
            <EmailButton href={reactivateUrl}>
              Reactivate {oldTier} Plan
            </EmailButton>
            
            <Text style={{ ...styles.paragraph, fontSize: '14px', color: '#6b7280' }}>
              Need some help? Reach out to us at hello@wondrousdigital.com
            </Text>
          </Section>
          
          <EmailFooter includeSupport={false} />
        </EmailContainer>
  );
};

export default AccountDowngraded;