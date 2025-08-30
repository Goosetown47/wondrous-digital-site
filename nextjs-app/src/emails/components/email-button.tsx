import * as React from 'react';
import { Section, Link } from '@react-email/components';
import { styles } from './email-styles';

export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

/**
 * Purple gradient button matching the billing-change-reminder style
 */
export const EmailButton: React.FC<EmailButtonProps> = ({
  href,
  children,
  align = 'center',
}) => {
  const wrapperStyle = {
    ...styles.buttonWrapper,
    textAlign: align as 'left' | 'center' | 'right',
  };

  return (
    <Section style={wrapperStyle}>
      <Link href={href} style={styles.button}>
        {children}
      </Link>
    </Section>
  );
};

export default EmailButton;