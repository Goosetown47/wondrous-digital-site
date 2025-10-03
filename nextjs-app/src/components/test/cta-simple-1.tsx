'use client';

import { Button } from '@/components/ui/button';
import { EditableText } from '@/components/shared/content-editor/EditableText';
import type { EditableFieldConfig } from '@/lib/component-registry';

interface CtaSimple1Props {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  backgroundColor?: string;
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;
}

export default function CtaSimple1({
  heading = 'Ready to Get Started?',
  description = 'Join thousands of users who are already using our platform to build amazing experiences.',
  buttonText = 'Get Started',
  buttonHref = '#',
  backgroundColor = 'bg-gray-50',
  editable = false,
  onUpdate
}: CtaSimple1Props) {
  return (
    <section className={`py-16 px-4 ${backgroundColor}`}>
      <div className="max-w-3xl mx-auto text-center">
        <EditableText
          value={heading}
          onUpdate={(val) => onUpdate?.('heading', val)}
          editable={editable}
          type="heading"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {heading}
          </h2>
        </EditableText>

        <EditableText
          value={description}
          onUpdate={(val) => onUpdate?.('description', val)}
          editable={editable}
          type="paragraph"
          richText={true}
        >
          <p className="text-lg text-gray-600 mb-8">
            {description}
          </p>
        </EditableText>

        <Button size="lg" asChild>
          <a href={buttonHref}>
            <EditableText
              value={buttonText}
              onUpdate={(val) => onUpdate?.('buttonText', val)}
              editable={editable}
              type="button"
            >
              <span>{buttonText}</span>
            </EditableText>
          </a>
        </Button>
      </div>
    </section>
  );
}

export const ctasimple1Config = {
  editableFields: [
    {
      path: 'heading',
      type: 'text',
      label: 'Heading',
      required: false
    },
    {
      path: 'description',
      type: 'richText',
      label: 'Description',
      required: false
    },
    {
      path: 'buttonText',
      type: 'text',
      label: 'Button Text',
      required: false
    },
    {
      path: 'buttonHref',
      type: 'text',
      label: 'Button Link',
      required: false
    },
    {
      path: 'backgroundColor',
      type: 'text',
      label: 'Background Color (Tailwind class)',
      required: false
    }
  ] as EditableFieldConfig[],
  defaultContent: {
    heading: 'Ready to Get Started?',
    description: 'Join thousands of users who are already using our platform to build amazing experiences.',
    buttonText: 'Get Started',
    buttonHref: '#',
    backgroundColor: 'bg-gray-50'
  }
};
