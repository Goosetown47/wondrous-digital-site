import * as React from 'react';
import { Text, Link } from '@react-email/components';
import { styles, urls } from './email-styles';

export interface EmailFooterProps {
  includeSupport?: boolean;
  supportEmail?: string;
  supportText?: string;
  additionalText?: React.ReactNode;
  copyright?: string;
}

/**
 * Consistent email footer with support information
 */
export const EmailFooter: React.FC<EmailFooterProps> = ({
  includeSupport = true,
  supportEmail = urls.supportEmail,
  supportText = 'If you have any questions, please contact our support',
  additionalText,
  copyright = `© ${new Date().getFullYear()} Wondrous Digital. All rights reserved.`,
}) => {
  return (
    <>
      {includeSupport && (
        <Text style={styles.footer}>
          {supportText}
          <br />
          team at <Link href={`mailto:${supportEmail}`} style={styles.footerLink}>
            {supportEmail}
          </Link>
        </Text>
      )}
      
      {additionalText && (
        <Text style={styles.footer}>
          {additionalText}
        </Text>
      )}
      
      {copyright && (
        <Text style={styles.footerWithPadding}>
          {copyright}
        </Text>
      )}
    </>
  );
};

export default EmailFooter;