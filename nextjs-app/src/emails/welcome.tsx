import {
  Heading,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './base-template';
import { EmailButton } from './components/email-button';
import { styles } from './components/email-styles';

export interface WelcomeEmailProps {
  userName?: string;
  userEmail: string;
  accountName?: string;
  tierName?: string;
  dashboardLink?: string;
  logoUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  userEmail,
  accountName,
  tierName = 'Free',
  dashboardLink = 'https://app.wondrousdigital.com/dashboard',
  logoUrl,
}) => {
  const preview = 'Welcome to Wondrous Digital - Let\'s get started!';

  return (
    <BaseEmailTemplate
      preview={preview}
      logoUrl={logoUrl}
    >
      <Heading style={styles.title}>
        Welcome to Wondrous Digital! 🎉
      </Heading>
      
      <Text style={styles.paragraph}>
        Hi{userName ? ` ${userName}` : ''},
      </Text>

      <Text style={styles.paragraph}>
        Thank you for joining Wondrous Digital! We're excited to have you on board. 
        Your account has been successfully created with the email <strong>{userEmail}</strong>.
      </Text>

      {accountName && (
        <Text style={styles.paragraph}>
          Account: <strong>{accountName}</strong>
          <br />
          Plan: <strong>{tierName}</strong>
        </Text>
      )}

      <EmailButton href={dashboardLink}>
        Go to Dashboard
      </EmailButton>
    </BaseEmailTemplate>
  );
};

export default WelcomeEmail;