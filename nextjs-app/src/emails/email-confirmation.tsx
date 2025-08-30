import {
  Heading,
  Hr,
  Link,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './base-template';
import { EmailButton } from './components/email-button';
import { styles } from './components/email-styles';

export interface EmailConfirmationProps {
  userName?: string;
  confirmationLink: string;
  expiresIn?: string;
  logoUrl?: string;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  userName,
  confirmationLink,
  expiresIn = '24 hours',
  logoUrl,
}) => {
  const preview = 'Please confirm your email address';

  return (
    <BaseEmailTemplate
      preview={preview}
      logoUrl={logoUrl}
    >
      <Heading style={styles.title}>
        Confirm Your Email Address
      </Heading>
      
      <Text style={styles.paragraph}>
        Hi{userName ? ` ${userName}` : ''},
      </Text>

      <Text style={styles.paragraph}>
        Thanks for signing up for Wondrous Digital! We're excited to have you on board.
      </Text>

      <Text style={styles.paragraph}>
        Please confirm your email address by clicking the button below. This helps us ensure 
        that we have the right email address for you and keeps your account secure.
      </Text>

      <EmailButton href={confirmationLink}>
        Confirm Email Address
      </EmailButton>

      <Text style={styles.paragraph}>
        Or copy and paste this URL into your browser:
      </Text>
      
      <Link href={confirmationLink} style={styles.link}>
        {confirmationLink}
      </Link>

      <Hr style={styles.divider} />

      <Text style={styles.subtitle}>
        <strong>Why confirm your email?</strong>
      </Text>

      <Text style={styles.paragraph}>
        Email confirmation helps us:
      </Text>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          Ensure you receive important account notifications
        </li>
        <li style={styles.listItem}>
          Keep your account secure
        </li>
        <li style={styles.listItem}>
          Enable password recovery options
        </li>
        <li style={styles.listItem}>
          Send you updates about your projects and billing
        </li>
      </ul>

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        This confirmation link will expire in {expiresIn}. If the link has expired, 
        you can request a new confirmation email from your account settings.
      </Text>

      <Text style={styles.paragraph}>
        <strong>Security Notice:</strong> This email was sent to verify your email address. 
        If you didn't sign up for Wondrous Digital, someone may have entered your email 
        by mistake. No action is needed if you didn't sign up.
      </Text>
    </BaseEmailTemplate>
  );
};

export default EmailConfirmation;