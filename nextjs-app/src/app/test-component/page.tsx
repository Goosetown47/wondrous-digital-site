import ServicesAccordion from '@/components/test/services-accordion';
import { ServiceItem } from '@/components/services/service-types';

// Sample data to demonstrate the accordion
const sampleServices: ServiceItem[] = [
  {
    id: '1',
    icon: 'settings',
    title: 'Product Strategy',
    subtitle: 'Strategic planning and market positioning',
    description:
      'From market research to user personas, we help you build products that matter. Our strategic approach ensures your product meets real user needs.',
    servicesInclude: [
      'Market Research',
      'User Personas',
      'Competitive Analysis',
      'Product Roadmaps',
    ],
    servicesIncludeLabel: 'Services Include:',
    deliverables: [
      'Strategy Document',
      'User Persona Profiles',
      'Market Analysis Report',
    ],
    deliverablesLabel: 'Deliverables:',
  },
  {
    id: '2',
    icon: 'palette',
    title: 'Design',
    subtitle: 'User-centered design solutions',
    description:
      'Beautiful, intuitive designs that users love. We create interfaces that are both aesthetically pleasing and highly functional.',
    servicesInclude: [
      'UI/UX Design',
      'Prototyping',
      'Design Systems',
      'User Testing',
    ],
    servicesIncludeLabel: 'Services Include:',
    deliverables: [
      'Design Mockups',
      'Interactive Prototypes',
      'Style Guide',
    ],
    deliverablesLabel: 'Deliverables:',
  },
  {
    id: '3',
    icon: 'code',
    title: 'Web Development',
    subtitle: 'Modern, scalable applications',
    description:
      'Build fast, secure, and scalable web applications using cutting-edge technologies and best practices.',
    servicesInclude: [
      'Frontend Development',
      'Backend Development',
      'API Integration',
      'Performance Optimization',
    ],
    servicesIncludeLabel: 'Services Include:',
    deliverables: [
      'Production-Ready Code',
      'Technical Documentation',
      'Deployment Setup',
    ],
    deliverablesLabel: 'Deliverables:',
  },
  {
    id: '4',
    icon: 'target',
    title: 'Marketing',
    subtitle: 'Growth and optimization strategies',
    description:
      'Data-driven marketing strategies to grow your business and reach your target audience effectively.',
    servicesInclude: [
      'SEO Optimization',
      'Content Strategy',
      'Social Media Marketing',
      'Analytics & Reporting',
    ],
    servicesIncludeLabel: 'Services Include:',
    deliverables: [
      'Marketing Plan',
      'Content Calendar',
      'Performance Reports',
    ],
    deliverablesLabel: 'Deliverables:',
  },
];

export default function TestComponentPage() {
  return (
    <div className="min-h-screen bg-background">
      <ServicesAccordion
        heading="Services"
        subtitle="Click to learn more about each service we offer."
        services={sampleServices}
        editable={false}
      />
    </div>
  );
}
