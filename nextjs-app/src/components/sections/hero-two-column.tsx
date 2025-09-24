'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EditableImage, EditableText } from '@/components/shared/content-editor';
import { SmartText } from '@/components/shared';

interface HeroTwoColumnProps {
  heading?: string;
  subtext?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  imageUrl?: string;
  imageAlt?: string;
  onHeadingChange?: (value: string) => void;
  onSubtextChange?: (value: string) => void;
  onButtonTextChange?: (value: string) => void;
  onSecondaryButtonTextChange?: (value: string) => void;
  onImageChange?: (file: File) => void;
  editable?: boolean;
}

export function HeroTwoColumn({
  heading = "Blocks Built With Shadcn & Tailwind",
  subtext = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  buttonText = "Discover all components",
  secondaryButtonText = "View on GitHub",
  imageUrl,
  imageAlt = "Hero image",
  onHeadingChange,
  onSubtextChange,
  onButtonTextChange,
  onSecondaryButtonTextChange,
  onImageChange,
  editable = false,
}: HeroTwoColumnProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl || null);

  // Sync image URL with props when it changes
  useEffect(() => {
    setCurrentImageUrl(imageUrl || null);
  }, [imageUrl]);

  const handleImageUpdate = (newImageUrl: string | null) => {
    setCurrentImageUrl(newImageUrl);
    // In a real implementation, this would save to the database
    // For now, we'll just update local state
    if (onImageChange && newImageUrl) {
      // Convert URL back to file if needed
      // This is a placeholder - actual implementation would handle URLs directly
      // onImageChange(newImageUrl);
    }
  };

  const handleHeadingChange = (value: string) => {
    if (onHeadingChange) {
      onHeadingChange(value);
    }
  };

  const handleSubtextChange = (value: string) => {
    if (onSubtextChange) {
      onSubtextChange(value);
    }
  };

  const handleButtonTextChange = (value: string) => {
    if (onButtonTextChange) {
      onButtonTextChange(value);
    }
  };

  const handleSecondaryButtonTextChange = (value: string) => {
    if (onSecondaryButtonTextChange) {
      onSecondaryButtonTextChange(value);
    }
  };

  return (
    <section className="w-full bg-background">
      <div className="w-full py-4 md:py-6 lg:py-8 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col justify-center space-y-6 order-1 lg:order-1 text-center lg:text-left">
            <div className="space-y-4">
              <EditableText
                value={heading}
                type="heading"
                onUpdate={handleHeadingChange}
                editable={editable}
                placeholder="Enter heading..."
                maxLength={100}
              >
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl xl:text-6xl">
                  {heading}
                </h1>
              </EditableText>
              
              <EditableText
                value={subtext}
                type="paragraph"
                onUpdate={handleSubtextChange}
                editable={editable}
                placeholder="Enter description..."
                maxLength={500}
                richText={true}
              >
                <SmartText
                  content={subtext}
                  as="p"
                  className="text-base sm:text-lg text-muted-foreground"
                />
              </EditableText>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <EditableText
                value={buttonText}
                type="button"
                onUpdate={handleButtonTextChange}
                editable={editable}
                placeholder="Button text..."
                maxLength={50}
              >
                <Button size="lg">
                  {buttonText}
                </Button>
              </EditableText>

              <EditableText
                value={secondaryButtonText}
                type="button"
                onUpdate={handleSecondaryButtonTextChange}
                editable={editable}
                placeholder="Secondary button text..."
                maxLength={50}
              >
                <Button size="lg" variant="outline" className="text-foreground">
                  {secondaryButtonText}
                </Button>
              </EditableText>
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="flex items-center justify-center order-2 lg:order-2">
            <EditableImage
              src={currentImageUrl}
              alt={imageAlt}
              aspectRatio="4:3"
              className="w-full max-w-md lg:max-w-none rounded-lg overflow-hidden"
              onUpdate={handleImageUpdate}
              editable={editable}
            />
          </div>
        </div>
      </div>
    </section>
  );
}