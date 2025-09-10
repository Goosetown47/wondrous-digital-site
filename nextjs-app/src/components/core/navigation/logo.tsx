import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  url?: string;
  children: React.ReactNode;
  className?: string;
}

const Logo = ({ url = '#', children, className }: LogoProps) => {
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
}

const LogoImage = ({ src, alt, title, className }: LogoImageProps) => {
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