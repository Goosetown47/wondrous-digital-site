import React from 'react';
import { ArrowRight } from 'lucide-react';
import EditableText from '../editable/EditableText';
import EditableIcon from '../editable/EditableIcon';
import EditableButton from '../editable/EditableButton';

interface FourFeaturesGridProps {
  content: {
    tagline?: {
      text?: string;
      color?: string;
    };
    mainHeading?: {
      text?: string;
      color?: string;
    };
    description?: {
      text?: string;
      color?: string;
    };
    feature1Icon?: {
      icon?: string;
      size?: number;
      color?: string;
    };
    feature1Heading?: {
      text?: string;
      color?: string;
    };
    feature1Description?: {
      text?: string;
      color?: string;
    };
    feature2Icon?: {
      icon?: string;
      size?: number;
      color?: string;
    };
    feature2Heading?: {
      text?: string;
      color?: string;
    };
    feature2Description?: {
      text?: string;
      color?: string;
    };
    feature3Icon?: {
      icon?: string;
      size?: number;
      color?: string;
    };
    feature3Heading?: {
      text?: string;
      color?: string;
    };
    feature3Description?: {
      text?: string;
      color?: string;
    };
    feature4Icon?: {
      icon?: string;
      size?: number;
      color?: string;
    };
    feature4Heading?: {
      text?: string;
      color?: string;
    };
    feature4Description?: {
      text?: string;
      color?: string;
    };
    primaryButton?: {
      text?: string;
      href?: string;
      variant?: 'primary' | 'secondary' | 'tertiary';
      icon?: string;
    };
    secondaryButton?: {
      text?: string;
      href?: string;
      variant?: 'primary' | 'secondary' | 'tertiary';
      icon?: string;
    };
    backgroundColor?: string;
  };
  isMobilePreview?: boolean;
}

const FourFeaturesGrid: React.FC<FourFeaturesGridProps> = ({
  content = {
    tagline: {
      text: "Tagline",
      color: "#000000"
    },
    mainHeading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280"
    },
    feature1Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature1Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature1Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280"
    },
    feature2Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature2Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature2Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280"
    },
    feature3Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature3Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature3Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280"
    },
    feature4Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature4Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature4Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
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
      variant: "secondary"
    },
    backgroundColor: "#FFFFFF"
  },
  isMobilePreview = false
}) => {
  // Define CSS variables for styling based on props and default values
  const sectionStyle: React.CSSProperties = {
    backgroundColor: content.backgroundColor || '#FFFFFF'
  };

  return (
    <section className="w-full" style={sectionStyle}>
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Header Content */}
        <div className="text-left max-w-3xl mb-16">
          <EditableText
            fieldName="tagline"
            defaultValue={content.tagline?.text || "Tagline"}
            as="p"
            className="text-base font-medium mb-3"
            color={content.tagline?.color}
          />
          <EditableText
            fieldName="mainHeading"
            defaultValue={content.mainHeading?.text || "Medium length section heading goes here"}
            as="h2"
            className="text-3xl md:text-4xl font-bold mb-6"
            color={content.mainHeading?.color}
          />
          <EditableText
            fieldName="description"
            defaultValue={content.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat."}
            as="p"
            className="text-base md:text-lg"
            color={content.description?.color}
          />
        </div>

        {/* Features Grid */}
        <div className={`grid ${isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-8 mb-12`}>
          {/* Feature 1 */}
          <div className="flex flex-col">
            <div className="mb-4">
              <EditableIcon
                fieldName="feature1Icon"
                icon={typeof content.feature1Icon?.icon === 'string' ? 
                      content.feature1Icon : { icon: "Box", size: 40 }}
                size={content.feature1Icon?.size || 40}
                color={content.feature1Icon?.color}
              />
            </div>
            <EditableText
              fieldName="feature1Heading"
              defaultValue={content.feature1Heading?.text || "Medium length section heading goes here"}
              as="h3"
              className="text-xl font-bold mb-3"
              color={content.feature1Heading?.color}
            />
            <EditableText
              fieldName="feature1Description"
              defaultValue={content.feature1Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
              as="p"
              className="text-base"
              color={content.feature1Description?.color}
            />
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col">
            <div className="mb-4">
              <EditableIcon
                fieldName="feature2Icon"
                icon={typeof content.feature2Icon?.icon === 'string' ? 
                      content.feature2Icon : { icon: "Box", size: 40 }}
                size={content.feature2Icon?.size || 40}
                color={content.feature2Icon?.color}
              />
            </div>
            <EditableText
              fieldName="feature2Heading"
              defaultValue={content.feature2Heading?.text || "Medium length section heading goes here"}
              as="h3"
              className="text-xl font-bold mb-3"
              color={content.feature2Heading?.color}
            />
            <EditableText
              fieldName="feature2Description"
              defaultValue={content.feature2Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
              as="p"
              className="text-base"
              color={content.feature2Description?.color}
            />
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col">
            <div className="mb-4">
              <EditableIcon
                fieldName="feature3Icon"
                icon={typeof content.feature3Icon?.icon === 'string' ? 
                      content.feature3Icon : { icon: "Box", size: 40 }}
                size={content.feature3Icon?.size || 40}
                color={content.feature3Icon?.color}
              />
            </div>
            <EditableText
              fieldName="feature3Heading"
              defaultValue={content.feature3Heading?.text || "Medium length section heading goes here"}
              as="h3"
              className="text-xl font-bold mb-3"
              color={content.feature3Heading?.color}
            />
            <EditableText
              fieldName="feature3Description"
              defaultValue={content.feature3Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
              as="p"
              className="text-base"
              color={content.feature3Description?.color}
            />
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col">
            <div className="mb-4">
              <EditableIcon
                fieldName="feature4Icon"
                icon={typeof content.feature4Icon?.icon === 'string' ? 
                      content.feature4Icon : { icon: "Box", size: 40 }}
                size={content.feature4Icon?.size || 40}
                color={content.feature4Icon?.color}
              />
            </div>
            <EditableText
              fieldName="feature4Heading"
              defaultValue={content.feature4Heading?.text || "Medium length section heading goes here"}
              as="h3"
              className="text-xl font-bold mb-3"
              color={content.feature4Heading?.color}
            />
            <EditableText
              fieldName="feature4Description"
              defaultValue={content.feature4Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
              as="p"
              className="text-base"
              color={content.feature4Description?.color}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <EditableButton
            fieldName="primaryButton"
            text={content.primaryButton?.text || "Button"}
            href={content.primaryButton?.href || "#"}
            variant={content.primaryButton?.variant || "primary"}
            icon={content.primaryButton?.icon}
            className="text-center"
          />
          <EditableButton
            fieldName="secondaryButton"
            text={content.secondaryButton?.text || "Button"}
            href={content.secondaryButton?.href || "#"}
            variant={content.secondaryButton?.variant || "secondary"}
            icon={content.secondaryButton?.icon}
            className="text-center"
          >
            {content.secondaryButton?.text || "Button"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </EditableButton>
        </div>
      </div>
    </section>
  );
};

export default FourFeaturesGrid;