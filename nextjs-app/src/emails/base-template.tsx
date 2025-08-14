import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Font,
} from '@react-email/components';
import * as React from 'react';

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
  logoUrl = 'https://app.wondrousdigital.com/images/branding/logo-full.png',
  logoAlt = 'Wondrous Digital',
  footerText = '© 2025 Wondrous Digital. All rights reserved.',
  unsubscribeUrl,
}) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={["Arial", "Helvetica", "sans-serif"]}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={logoUrl}
              alt={logoAlt}
              width="200"
              height="50"
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            {unsubscribeUrl && (
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Unsubscribe
              </Link>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginTop: '40px',
  marginBottom: '40px',
  padding: '0',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#ffffff',
  padding: '32px 48px',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '48px',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '32px 48px',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  margin: '0',
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
};

const unsubscribeLink = {
  color: '#6b7280',
  fontSize: '14px',
  textDecoration: 'underline',
  marginTop: '8px',
  display: 'inline-block',
};

export default BaseEmailTemplate;