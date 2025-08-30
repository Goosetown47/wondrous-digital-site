import {
  Heading,
  Hr,
  Link,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './base-template';
import { EmailButton } from './components/email-button';
import { EmailChecklist } from './components/email-checklist';
import { styles } from './components/email-styles';

export interface PasswordResetEmailProps {
  userName?: string;
  resetLink: string;
  expiresIn?: string;
  logoUrl?: string;
  requestIp?: string;
  requestTime?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetLink,
  expiresIn = '1 hour',
  logoUrl,
}) => {
  const preview = 'Reset your Wondrous Digital password';

  const securityItems = [
    { text: `This link will expire in ${expiresIn}` },
    { text: "You'll be asked to create a new password" },
    { text: "If you didn't request this, please ignore this email" },
  ];

  return (
    <BaseEmailTemplate
      preview={preview}
      logoUrl={logoUrl}
    >
      <Heading style={styles.title}>Password Reset Request</Heading>
      
      <Text style={styles.paragraph}>
        Hi{userName ? ` ${userName}` : ''},
      </Text>

      <Text style={styles.paragraph}>
        We received a request to reset the password for your Wondrous Digital account. 
        If you didn't make this request, you can safely ignore this email.
      </Text>

      <Text style={styles.paragraph}>
        To reset your password, click the button below:
      </Text>

      <EmailButton href={resetLink}>
        Reset Password
      </EmailButton>

      <Text style={styles.paragraph}>
        Or copy and paste this URL into your browser:
      </Text>
      
      <Link href={resetLink} style={styles.link}>
        {resetLink}
      </Link>

      <Hr style={styles.divider} />

      <Text style={styles.subtitle}>
        <strong>Security Information:</strong>
      </Text>

      <EmailChecklist items={securityItems} />

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        For security reasons, this password reset link will expire in {expiresIn}. 
        If the link has expired, you can request a new password reset from the login page.
      </Text>

      <Text style={styles.paragraph}>
        <strong>Security Notice:</strong> We will never ask you for your password 
        via email. Always ensure you're on the official Wondrous Digital website 
        before entering your credentials.
      </Text>
    </BaseEmailTemplate>
  );
};

export default PasswordResetEmail;