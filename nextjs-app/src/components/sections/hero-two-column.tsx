'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import Image from 'next/image';

interface HeroTwoColumnProps {
  heading?: string;
  subtext?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  onHeadingChange?: (value: string) => void;
  onSubtextChange?: (value: string) => void;
  onButtonTextChange?: (value: string) => void;
  onButtonLinkChange?: (value: string) => void;
  onImageChange?: (file: File) => void;
  editable?: boolean;
}

export function HeroTwoColumn({
  heading = "Blocks Built With Shadcn & Tailwind",
  subtext = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  buttonText = "Discover all components",
  buttonLink = "#",
  imageUrl,
  imageAlt = "Hero image",
  onHeadingChange,
  onSubtextChange,
  onButtonTextChange,
  onButtonLinkChange,
  onImageChange,
  editable = false,
}: HeroTwoColumnProps) {
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [isEditingSubtext, setIsEditingSubtext] = useState(false);
  const [isEditingButton, setIsEditingButton] = useState(false);
  const [tempHeading, setTempHeading] = useState(heading);
  const [tempSubtext, setTempSubtext] = useState(subtext);
  const [tempButtonText, setTempButtonText] = useState(buttonText);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const handleHeadingSave = () => {
    if (onHeadingChange) {
      onHeadingChange(tempHeading);
    }
    setIsEditingHeading(false);
  };

  const handleSubtextSave = () => {
    if (onSubtextChange) {
      onSubtextChange(tempSubtext);
    }
    setIsEditingSubtext(false);
  };

  const handleButtonSave = () => {
    if (onButtonTextChange) {
      onButtonTextChange(tempButtonText);
    }
    setIsEditingButton(false);
  };

  return (
    <section className="w-full bg-background">
      <div className="w-full py-12 @[768px]:py-24 @[1024px]:py-32 px-12 @[1000px]:px-4 @[1024px]:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-8 @[1000px]:grid-cols-2 @[1000px]:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col justify-center space-y-6 order-1 @[1000px]:order-1 text-center @[1000px]:text-left">
            <div className="space-y-4">
              {isEditingHeading && editable ? (
                <input
                  type="text"
                  value={tempHeading}
                  onChange={(e) => setTempHeading(e.target.value)}
                  onBlur={handleHeadingSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleHeadingSave()}
                  className="text-3xl font-bold tracking-tight @[640px]:text-4xl @[768px]:text-5xl @[1280px]:text-6xl bg-transparent border-b-2 border-primary focus:outline-none w-full text-center @[1000px]:text-left"
                  autoFocus
                />
              ) : (
                <h1
                  className={`text-3xl font-bold tracking-tight @[640px]:text-4xl @[768px]:text-5xl @[1280px]:text-6xl ${
                    editable ? 'cursor-pointer hover:opacity-80' : ''
                  }`}
                  onClick={() => editable && setIsEditingHeading(true)}
                >
                  {heading}
                </h1>
              )}
              
              {isEditingSubtext && editable ? (
                <textarea
                  value={tempSubtext}
                  onChange={(e) => setTempSubtext(e.target.value)}
                  onBlur={handleSubtextSave}
                  className="text-base @[640px]:text-lg text-muted-foreground bg-transparent border-b-2 border-primary focus:outline-none w-full resize-none text-center @[1000px]:text-left"
                  rows={3}
                  autoFocus
                />
              ) : (
                <p
                  className={`text-base @[640px]:text-lg text-muted-foreground ${
                    editable ? 'cursor-pointer hover:opacity-80' : ''
                  }`}
                  onClick={() => editable && setIsEditingSubtext(true)}
                >
                  {subtext}
                </p>
              )}
            </div>
            
            <div className="flex flex-col @[640px]:flex-row gap-4 justify-center @[1000px]:justify-start">
              {isEditingButton && editable ? (
                <input
                  type="text"
                  value={tempButtonText}
                  onChange={(e) => setTempButtonText(e.target.value)}
                  onBlur={handleButtonSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleButtonSave()}
                  className="px-4 py-2 bg-transparent border-b-2 border-primary focus:outline-none"
                  autoFocus
                />
              ) : (
                <Button
                  size="lg"
                  onClick={() => editable ? setIsEditingButton(true) : null}
                  className={editable ? 'cursor-pointer' : ''}
                >
                  {buttonText}
                </Button>
              )}
              
              <Button size="lg" variant="outline">
                View on GitHub
              </Button>
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="flex items-center justify-center order-2 @[1000px]:order-2">
            <div className="relative w-full aspect-[4/3] @[640px]:aspect-square @[1024px]:aspect-[4/3] max-w-md @[1024px]:max-w-none bg-muted rounded-lg overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {/* Geometric shape placeholder similar to ShadcnBlocks */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-32 h-32 @[640px]:w-40 @[640px]:h-40 @[1024px]:w-48 @[1024px]:h-48"
                    fill="currentColor"
                  >
                    <path d="M100 30 L170 70 L170 130 L100 170 L30 130 L30 70 Z" />
                  </svg>
                </div>
              )}
              
              {editable && onImageChange && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="text-white text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <span>Click to upload image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}