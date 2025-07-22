'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeroContent } from '@/schemas/section';

interface HeroSectionProps {
  content: HeroContent;
  isEditing?: boolean;
  onContentChange?: (updates: Partial<HeroContent>) => void;
}

export function HeroSection({ 
  content, 
  isEditing = false,
  onContentChange 
}: HeroSectionProps) {
  const handleTextChange = (field: keyof HeroContent, value: string) => {
    if (isEditing && onContentChange) {
      onContentChange({ [field]: value });
    }
  };

  return (
    <section 
      className="relative min-h-[500px] flex items-center justify-center px-4 py-16"
      style={{ 
        backgroundColor: content.backgroundColor,
        color: content.textColor,
        backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
            isEditing && "cursor-text hover:outline hover:outline-2 hover:outline-blue-500 rounded"
          )}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleTextChange('headline', e.currentTarget.textContent || '')}
        >
          {content.headline}
        </h1>
        
        <p 
          className={cn(
            "text-lg md:text-xl mb-8 opacity-90",
            isEditing && "cursor-text hover:outline hover:outline-2 hover:outline-blue-500 rounded"
          )}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleTextChange('subheadline', e.currentTarget.textContent || '')}
        >
          {content.subheadline}
        </p>
        
        <Button
          size="lg"
          className={cn(
            "font-semibold",
            isEditing && "pointer-events-none"
          )}
          style={{
            backgroundColor: content.buttonBackgroundColor,
            color: content.buttonTextColor,
          }}
        >
          <span
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange('buttonText', e.currentTarget.textContent || '')}
            className={cn(
              isEditing && "pointer-events-auto cursor-text"
            )}
          >
            {content.buttonText}
          </span>
        </Button>
      </div>
    </section>
  );
}