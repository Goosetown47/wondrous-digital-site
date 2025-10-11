'use client';

import { EditableText } from '@/components/shared/content-editor/EditableText';
import { EditableArray } from '@/components/shared/structural-editor';
import type { EditableFieldConfig } from '@/lib/component-registry';
import { FeatureItem } from '@/components/features/feature-types';
import { FeatureItemEditor, FeatureItemDisplay } from '@/components/features/editors';

interface Features1Props {
  heading?: string;
  features?: FeatureItem[];
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;
  projectId?: string;
}

export default function Features1({
  heading = 'Our Features',
  features = [],
  editable = false,
  onUpdate,
  projectId,
}: Features1Props) {
  return (
    <section
      className="py-12 px-4 md:py-16 lg:py-20 bg-background"
      aria-labelledby="features-heading"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <EditableText
            value={heading}
            onUpdate={(val) => onUpdate?.('heading', val)}
            editable={editable}
            type="heading"
          >
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
            >
              {heading}
            </h2>
          </EditableText>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {editable ? (
            <EditableArray
              items={features}
              onUpdate={(items) => onUpdate?.('features', items)}
              itemEditor={FeatureItemEditor}
              itemDisplay={FeatureItemDisplay}
              editable={editable}
              addButtonText="Add Feature"
              emptyMessage="No features yet. Click 'Add Feature' to get started."
              projectId={projectId}
            />
          ) : (
            <>
              {features.map((feature) => (
                <FeatureItemDisplay key={feature.id} item={feature} />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export const features1Config = {
  editableFields: [
    { path: 'heading', type: 'text', label: 'Section Heading', required: false },
    { path: 'features', type: 'array', label: 'Features', required: false },
  ] as EditableFieldConfig[],
  defaultContent: {
    heading: 'Our Features',
    features: [
      {
        id: 'feature-1',
        icon: 'zap',
        title: 'Lightning Fast',
        description: 'Experience blazing fast performance with our optimized infrastructure and cutting-edge technology.',
      },
      {
        id: 'feature-2',
        icon: 'shield',
        title: 'Secure & Safe',
        description: 'Your data is protected with enterprise-grade security and encryption at every level.',
      },
      {
        id: 'feature-3',
        icon: 'users',
        title: 'Team Collaboration',
        description: 'Work together seamlessly with powerful collaboration tools built for modern teams.',
      },
      {
        id: 'feature-4',
        icon: 'globe',
        title: 'Global Reach',
        description: 'Deploy worldwide with our global CDN and multi-region infrastructure.',
      },
      {
        id: 'feature-5',
        icon: 'trendingUp',
        title: 'Analytics & Insights',
        description: 'Make data-driven decisions with comprehensive analytics and real-time reporting.',
      },
      {
        id: 'feature-6',
        icon: 'settings',
        title: 'Customizable',
        description: 'Tailor every aspect to your needs with extensive customization options.',
      },
    ],
  },
};
