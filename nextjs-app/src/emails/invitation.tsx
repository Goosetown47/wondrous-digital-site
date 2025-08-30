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

export interface InvitationEmailProps {
  inviteeName?: string;
  inviterName: string;
  inviterEmail: string;
  accountName: string;
  role: 'account_owner' | 'user';
  invitationLink: string;
  expiresIn?: string;
  logoUrl?: string;
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
}) => {
  const preview = `${inviterName} invited you to join ${accountName}`;
  const roleDisplay = role === 'account_owner' ? 'Account Owner' : 'Team Member';

  return (
    <BaseEmailTemplate
      preview={preview}
      logoUrl={logoUrl}
    >
      <Heading style={styles.title}>You're invited to join {accountName}</Heading>
      
      <Text style={styles.paragraph}>
        Hi{inviteeName ? ` ${inviteeName}` : ''},
      </Text>

      <Text style={styles.paragraph}>
        <strong>{inviterName}</strong> ({inviterEmail}) has invited you to join{' '}
        <strong>{accountName}</strong> on Wondrous Digital as a{' '}
        <strong>{roleDisplay}</strong>.
      </Text>

      <Text style={styles.paragraph}>
        With Wondrous Digital, you can collaborate on building beautiful websites
        using our drag-and-drop builder, manage projects, and deploy sites with
        custom domains.
      </Text>

      <EmailButton href={invitationLink}>
        Accept Invitation
      </EmailButton>

      <Text style={styles.paragraph}>
        Or copy and paste this URL into your browser:
      </Text>
      
      <Link href={invitationLink} style={styles.link}>
        {invitationLink}
      </Link>

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        This invitation will expire in {expiresIn}. If you don't want to accept
        this invitation, you can safely ignore this email.
      </Text>

      <Text style={styles.paragraph}>
        If you have any questions, feel free to reply to this email or contact our
        support team.
      </Text>
    </BaseEmailTemplate>
  );
};

export default InvitationEmail;