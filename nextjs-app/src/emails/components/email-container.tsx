import * as React from 'react';
import {
  Body,
  Container,
  Html,
  Head,
  Preview,
} from '@react-email/components';
import { styles } from './email-styles';

export interface EmailContainerProps {
  preview: string;
  children: React.ReactNode;
}

/**
 * Consistent email container with gray background and white card
 * Matches the billing-change-reminder template structure
 */
export const EmailContainer: React.FC<EmailContainerProps> = ({
  preview,
  children,
}) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.container}>
        <Container style={styles.card}>
          {children}
        </Container>
      </Body>
    </Html>
  );
};

export default EmailContainer;