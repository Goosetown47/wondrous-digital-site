import React from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditableText from '../editable/EditableText';
import EditableImage from '../editable/EditableImage';
import EditableButton from '../editable/EditableButton';
import '../../styles/section-typography.css';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface HeroSplitLayoutProps {
  content: {
    headline?: {
      text?: string;
      color?: string;
      lineHeight?: string;
    };
    description?: {
      text?: string;
      color?: string;
      lineHeight?: string;
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
      imageScaling?: string;
      containerMode?: 'section-height' | 'fixed-shape';
      containerAspectRatio?: string;
      containerSize?: 'small' | 'medium' | 'large';
    };
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    backgroundBlur?: number;
    backgroundType?: 'color' | 'image' | 'gradient';
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

  // Define CSS variables and background styling based on props and default values
  const sectionStyle: React.CSSProperties = {
    '--hero-headline-color': content.headline?.color || '#000000',
    '--hero-description-color': content.description?.color || '#6B7280',
    '--hero-background-color': content.backgroundColor || '#FFFFFF',
    '--section-bg-image': content.backgroundImage ? `url(${content.backgroundImage})` : 'none',
    '--section-bg-blur': content.backgroundBlur ? `${content.backgroundBlur}px` : '0px',
    '--section-bg-type': content.backgroundType || 'color'
  };
  

  // Determine if we need the blurred background class (move this up first)
  const hasBlurredBg = content.backgroundType === 'image' && content.backgroundImage && content.backgroundBlur && content.backgroundBlur > 0;

  // Apply background properties as inline styles (following the color/lineHeight pattern)
  const backgroundType = content.backgroundType || 'color';
  
  switch (backgroundType) {
    case 'color':
      sectionStyle.backgroundColor = content.backgroundColor || '#FFFFFF';
      break;
    case 'gradient':
      if (content.backgroundGradient) {
        sectionStyle.background = content.backgroundGradient;
      } else {
        sectionStyle.backgroundColor = content.backgroundColor || '#FFFFFF';
      }
      break;
    case 'image':
      if (content.backgroundImage) {
        sectionStyle.backgroundImage = `url(${content.backgroundImage})`;
        sectionStyle.backgroundSize = 'cover';
        sectionStyle.backgroundPosition = 'center';
        sectionStyle.backgroundRepeat = 'no-repeat';
        // Blur is handled by the pseudo-element, not the main element
      } else {
        sectionStyle.backgroundColor = content.backgroundColor || '#FFFFFF';
      }
      break;
    default:
      sectionStyle.backgroundColor = content.backgroundColor || '#FFFFFF';
  }
  const sectionClasses = `w-full website-section ${hasBlurredBg ? 'section-with-blurred-bg' : ''}`;

  return (
    <section className={sectionClasses} style={sectionStyle}>
      <div className="section-content-container">
        <div className={`${isMobilePreview ? 'flex flex-col' : 'flex flex-wrap'}`}>
          {/* Content Column */}
          <div className={`w-full ${isMobilePreview ? 'w-full' : 'lg:w-1/2'} section-content-cell flex flex-col justify-center order-1`}>
            <EditableText 
              fieldName="headline"
              defaultValue={content.headline?.text || "Medium length hero headline goes here"}
              as="h1"
              className="font-bold mb-6"
              color={content.headline?.color}
              lineHeight={content.headline?.lineHeight}
            />
            <EditableText 
              fieldName="description"
              defaultValue={content.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."}
              as="p"
              className="mb-8"
              color={content.description?.color}
              lineHeight={content.description?.lineHeight}
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
          <div className={`w-full ${isMobilePreview ? 'w-full' : 'lg:w-1/2'} section-image-cell min-h-[400px] order-2 flex items-center justify-center`}>
            <EditableImage
              fieldName="heroImage"
              src={content.heroImage?.src || ''}
              alt={content.heroImage?.alt || content.headline?.text || 'Hero image'}
              imageScaling={content.heroImage?.imageScaling}
              containerMode={content.heroImage?.containerMode || 'section-height'}
              containerAspectRatio={content.heroImage?.containerAspectRatio}
              containerSize={content.heroImage?.containerSize}
              className="min-h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplitLayout;