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

export interface InvitationEmailProps {
  inviteeName?: string;
  inviterName: string;
  inviterEmail: string;
  accountName: string;
  role: 'account_owner' | 'user';
  invitationLink: string;
  expiresIn?: string;
  logoUrl?: string;
  brandColor?: string;
}

export const InvitationEmail: React.FC<InvitationEmailProps> = ({
  inviteeName,
  inviterName,
  inviterEmail,
  accountName,
  role,
  invitationLink,
  expiresIn = '7 days',
  logoUrl,
  brandColor = '#4F46E5',
}) => {
  const preview = `${inviterName} invited you to join ${accountName}`;
  const roleDisplay = role === 'account_owner' ? 'Account Owner' : 'Team Member';

  return (
    <BaseEmailTemplate
      preview={preview}
      logoUrl={logoUrl}
    >
      <Heading style={h1}>You're invited to join {accountName}</Heading>
      
      <Text style={text}>
        Hi{inviteeName ? ` ${inviteeName}` : ''},
      </Text>

      <Text style={text}>
        <strong>{inviterName}</strong> ({inviterEmail}) has invited you to join{' '}
        <strong>{accountName}</strong> on Wondrous Digital as a{' '}
        <strong>{roleDisplay}</strong>.
      </Text>

      <Text style={text}>
        With Wondrous Digital, you can collaborate on building beautiful websites
        using our drag-and-drop builder, manage projects, and deploy sites with
        custom domains.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={{
            ...button,
            backgroundColor: brandColor,
          }}
          href={invitationLink}
        >
          Accept Invitation
        </Button>
      </Section>

      <Text style={text}>
        Or copy and paste this URL into your browser:
      </Text>
      
      <Link href={invitationLink} style={link}>
        {invitationLink}
      </Link>

      <Hr style={hr} />

      <Text style={footerText}>
        This invitation will expire in {expiresIn}. If you don't want to accept
        this invitation, you can safely ignore this email.
      </Text>

      <Text style={footerText}>
        If you have any questions, feel free to reply to this email or contact our
        support team.
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

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px',
};

export default InvitationEmail;