import React from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditableText from '../editable/EditableText';
import EditableImage from '../editable/EditableImage';
import EditableButton from '../editable/EditableButton';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface HeroSplitLayoutProps {
  content: {
    headline?: {
      text?: string;
      color?: string;
    };
    description?: {
      text?: string;
      color?: string;
    };
    primaryButton?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
    secondaryButton?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
    heroImage?: {
      src?: string;
      alt?: string;
    };
    backgroundColor?: string;
  };
}

const HeroSplitLayout: React.FC<HeroSplitLayoutProps> = ({
  content = {
    headline: {
      text: "Medium length hero headline goes here",
      color: "#000000"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary"
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "tertiary"
    },
    heroImage: {
      src: "",
      alt: "Hero image"
    },
    backgroundColor: "#FFFFFF"
  }
}) => {
  // Use the EditModeProvider if we're in edit mode
  const { editMode, activeEditField, setActiveEditField, onContentUpdate, isMobilePreview } = useEditMode();

  // Define CSS variables for styling based on props and default values
  const sectionStyle: React.CSSProperties = {
    '--hero-headline-color': content.headline?.color || '#000000',
    '--hero-description-color': content.description?.color || '#6B7280',
    '--hero-background-color': content.backgroundColor || '#FFFFFF',
    backgroundColor: content.backgroundColor || '#FFFFFF'
  };

  return (
    <section className="w-full" style={sectionStyle}>
      <div className="w-full" style={{ backgroundColor: 'var(--hero-background-color)' }}>
      <div className="max-w-7xl mx-auto">
        <div className={`${isMobilePreview ? 'flex flex-col' : 'flex flex-wrap'}`}>
          {/* Content Column */}
          <div className={`w-full ${isMobilePreview ? 'w-full' : 'lg:w-1/2'} p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center order-1`}>
            <EditableText 
              fieldName="headline"
              defaultValue={content.headline?.text || "Medium length hero headline goes here"}
              as="h1"
              className="text-4xl font-bold mb-6"
              color={'var(--hero-headline-color)'}
            />
            <EditableText 
              fieldName="description"
              defaultValue={content.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."}
              as="p"
              className="mb-8"
              color={'var(--hero-description-color)'}
            />
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <EditableButton
                fieldName="primaryButton"
                text={content.primaryButton?.text || "Primary Button"}
                href={content.primaryButton?.href || "#"}
                variant={content.primaryButton?.variant || "primary"}
                icon={content.primaryButton?.icon}
                className="w-full sm:w-auto"
              />
              <EditableButton
                fieldName="secondaryButton"
                text={content.secondaryButton?.text || "Secondary Button"}
                href={content.secondaryButton?.href || "#"}
                variant={content.secondaryButton?.variant || "tertiary"}
                icon={content.secondaryButton?.icon}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
          
          {/* Image Column */}
          <div className={`w-full ${isMobilePreview ? 'w-full' : 'lg:w-1/2'} bg-gray-200 min-h-[400px] order-2`}>
            <EditableImage
              fieldName="heroImage"
              src={content.heroImage?.src || ''}
              alt={content.heroImage?.alt || content.headline?.text || 'Hero image'}
              className="w-full h-full object-cover min-h-[400px]"
            />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default HeroSplitLayout;