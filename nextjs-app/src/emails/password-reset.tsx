import {
  Button,
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './base-template';

export interface PasswordResetEmailProps {
  userName?: string;
  resetLink: string;
  expiresIn?: string;
  logoUrl?: string;
  brandColor?: string;
  requestIp?: string;
  requestTime?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetLink,
  expiresIn = '1 hour',
  logoUrl,
  brandColor = '#4F46E5',
}) => {
  const preview = 'Reset your Wondrous Digital password';

  return (
    <BaseEmailTemplate
      preview={preview}
      logoUrl={logoUrl}
    >
      <Heading style={h1}>Password Reset Request</Heading>
      
      <Text style={text}>
        Hi{userName ? ` ${userName}` : ''},
      </Text>

      <Text style={text}>
        We received a request to reset the password for your Wondrous Digital account. 
        If you didn't make this request, you can safely ignore this email.
      </Text>

      <Text style={text}>
        To reset your password, click the button below:
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={{
            ...button,
            backgroundColor: brandColor,
          }}
          href={resetLink}
        >
          Reset Password
        </Button>
      </Section>

      <Text style={text}>
        Or copy and paste this URL into your browser:
      </Text>
      
      <Link href={resetLink} style={link}>
        {resetLink}
      </Link>

      <Hr style={hr} />

      <Text style={securityText}>
        <strong>Security Information:</strong>
      </Text>

      <Text style={securityText}>
        • This link will expire in {expiresIn}
      </Text>
      <Text style={securityText}>
        • You'll be asked to create a new password
      </Text>
      <Text style={securityText}>
        • If you didn't request this, please ignore this email
      </Text>

      <Hr style={hr} />

      <Text style={footerText}>
        For security reasons, this password reset link will expire in {expiresIn}. 
        If the link has expired, you can request a new password reset from the login page.
      </Text>

      <Text style={footerText}>
        If you have any questions or concerns, please contact our support team at{' '}
        <Link href="mailto:support@wondrousdigital.com" style={supportLink}>
          support@wondrousdigital.com
        </Link>
      </Text>

      <Text style={warningText}>
        <strong>Security Notice:</strong> We will never ask you for your password 
        via email. Always ensure you're on the official Wondrous Digital website 
        before entering your credentials.
      </Text>
    </BaseEmailTemplate>
  );
};

// Styles
const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  padding: '12px 24px',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

const link = {
  color: '#4F46E5',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const securityText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px',
};

const supportLink = {
  color: '#4F46E5',
  textDecoration: 'underline',
};

const warningText = {
  color: '#991b1b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '16px 0 0',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '6px',
};

export default PasswordResetEmail;