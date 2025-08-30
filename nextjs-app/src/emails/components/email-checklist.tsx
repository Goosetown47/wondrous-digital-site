import * as React from 'react';
import { Text } from '@react-email/components';
import { styles } from './email-styles';

export interface ChecklistItem {
  text: React.ReactNode;
  checked?: boolean;
}

export interface EmailChecklistProps {
  items: ChecklistItem[];
  checkmark?: string;
}

/**
 * Checkmark list component for displaying features or steps
 */
export const EmailChecklist: React.FC<EmailChecklistProps> = ({
  items,
  checkmark = '✓',
}) => {
  return (
    <>
      {items.map((item, index) => (
        <div key={index} style={styles.checkItem}>
          <span style={styles.checkmark}>
            {item.checked !== false ? checkmark : '○'}
          </span>
          <Text style={styles.checkText}>
            {item.text}
          </Text>
        </div>
      ))}
    </>
  );
};

export default EmailChecklist;