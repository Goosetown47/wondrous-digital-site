import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Link,
} from '@react-email/components';
import * as React from 'react';
import { EmailHeader } from './components/email-header';
import { EmailFooter } from './components/email-footer';
import { styles, logoConfig } from './components/email-styles';

export interface BaseEmailTemplateProps {
  preview: string;
  children: React.ReactNode;
  logoUrl?: string;
  logoAlt?: string;
  footerText?: string;
  unsubscribeUrl?: string;
}

export const BaseEmailTemplate: React.FC<BaseEmailTemplateProps> = ({
  preview,
  children,
  logoUrl = logoConfig.url,
  logoAlt = logoConfig.alt,
  footerText,
  unsubscribeUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.container}>
        <Container style={styles.card}>
          {/* Header with logo */}
          <EmailHeader 
            logoUrl={logoUrl}
            logoAlt={logoAlt}
          />

          {/* Content */}
          <Section style={styles.content}>
            {children}
          </Section>

          {/* Footer */}
          <EmailFooter 
            additionalText={unsubscribeUrl && (
              <>
                <Link href={unsubscribeUrl} style={styles.footerLink}>
                  Unsubscribe
                </Link>
              </>
            )}
            copyright={footerText}
          />
        </Container>
      </Body>
    </Html>
  );
};

export default BaseEmailTemplate;