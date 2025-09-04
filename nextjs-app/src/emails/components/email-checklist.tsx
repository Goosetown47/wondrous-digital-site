import * as React from 'react';
import { Text } from '@react-email/components';
import { styles } from './email-styles';

export interface ChecklistItem {
  text: React.ReactNode;
  checked?: boolean;
}

export interface EmailChecklistProps {
  items: (ChecklistItem | string)[];
  checkmark?: string;
  iconColor?: string;
}

/**
 * Checkmark list component for displaying features or steps
 */
export const EmailChecklist: React.FC<EmailChecklistProps> = ({
  items,
  checkmark = '✓',
  iconColor,
}) => {
  return (
    <>
      {items.map((item, index) => {
        const isString = typeof item === 'string';
        const text = isString ? item : item.text;
        const checked = isString ? true : item.checked !== false;
        
        return (
          <div key={index} style={styles.checkItem}>
            <span style={{
              ...styles.checkmark,
              ...(iconColor ? { color: iconColor } : {})
            }}>
              {checked ? checkmark : '○'}
            </span>
            <Text style={styles.checkText}>
              {text}
            </Text>
          </div>
        );
      })}
    </>
  );
};

export default EmailChecklist;