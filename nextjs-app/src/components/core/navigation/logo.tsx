'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { EditableLogoImage } from '@/components/shared/content-editor';

interface LogoProps {
  url?: string;
  children: React.ReactNode;
  className?: string;
}

const Logo = ({ url = '#', children, className }: LogoProps) => {
  // If URL is undefined (in editable mode), render a div instead of a link
  if (!url) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {children}
      </div>
    );
  }

  return (
    <a href={url} className={cn('flex items-center gap-2', className)}>
      {children}
    </a>
  );
};

interface LogoImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  editable?: boolean;
  onUpdate?: (imageUrl: string | null) => void;
}

const LogoImage = ({ src, alt, title, className, editable = false, onUpdate }: LogoImageProps) => {
  // Use EditableLogoImage when in editable mode
  if (editable) {
    return (
      <EditableLogoImage
        src={src}
        alt={alt}
        title={title}
        className={cn('h-8', className)}
        fallbackText={title?.charAt(0) || alt.charAt(0) || 'L'}
        onUpdate={onUpdate}
        editable={editable}
        showFallback={true}
      />
    );
  }

  // Standard image for non-editable mode
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={cn('h-8', className)}
    />
  );
};

interface LogoTextProps {
  children: React.ReactNode;
  className?: string;
}

const LogoText = ({ children, className }: LogoTextProps) => {
  return (
    <span className={cn('font-semibold', className)}>
      {children}
    </span>
  );
};

export { Logo, LogoImage, LogoText };