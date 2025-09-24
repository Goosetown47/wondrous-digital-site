import type { ReactElement } from 'react';
import type { EditableFieldType } from '@/types/builder';

// Helper type for test assertions
export type TestReactElement = ReactElement & {
  type: {
    name?: string;
    [key: string]: unknown;
  };
  props: {
    [key: string]: unknown;
  };
};

export type TestEditableFieldConfig = {
  path: string;
  type: EditableFieldType;
  label: string;
  required?: boolean;
};