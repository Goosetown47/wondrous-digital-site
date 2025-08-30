import * as React from 'react';
import { Section, Img } from '@react-email/components';
import { styles, logoConfig } from './email-styles';

export interface EmailHeaderProps {
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: string;
  logoHeight?: string;
}

/**
 * Consistent email header with logo
 * Uses production URL by default
 */
export const EmailHeader: React.FC<EmailHeaderProps> = ({
  logoUrl = logoConfig.url,
  logoAlt = logoConfig.alt,
  logoWidth = logoConfig.width,
  logoHeight = logoConfig.height,
}) => {
  return (
    <Section style={styles.logoSection}>
      <Img
        src={logoUrl}
        width={logoWidth}
        height={logoHeight}
        alt={logoAlt}
        style={{ margin: '0 auto' }}
      />
    </Section>
  );
};

export default EmailHeader;