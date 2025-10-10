import Features1 from '@/components/test/features-1';
import { FeatureItem } from '@/components/features/feature-types';

// Sample features data for testing
const sampleFeatures: FeatureItem[] = [
  {
    id: '1',
    icon: 'zap',
    title: 'Lightning Fast',
    description: 'Experience blazing fast performance with our optimized infrastructure and cutting-edge technology.',
  },
  {
    id: '2',
    icon: 'shield',
    title: 'Secure & Safe',
    description: 'Your data is protected with enterprise-grade security and encryption at every level.',
  },
  {
    id: '3',
    icon: 'users',
    title: 'Team Collaboration',
    description: 'Work together seamlessly with powerful collaboration tools built for modern teams.',
  },
  {
    id: '4',
    icon: 'globe',
    title: 'Global Reach',
    description: 'Deploy worldwide with our global CDN and multi-region infrastructure.',
  },
  {
    id: '5',
    icon: 'trendingUp',
    title: 'Analytics & Insights',
    description: 'Make data-driven decisions with comprehensive analytics and real-time reporting.',
  },
  {
    id: '6',
    icon: 'settings',
    title: 'Customizable',
    description: 'Tailor every aspect to your needs with extensive customization options.',
  },
];

export default function TestComponentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Features1
        heading="Our Features"
        features={sampleFeatures}
        editable={false}
      />
    </div>
  );
}
