import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: { mark: 32, full: 120 },
  md: { mark: 40, full: 160 },
  lg: { mark: 48, full: 200 },
  xl: { mark: 64, full: 240 },
};

export function LogoMark({ className, size = 'md' }: LogoProps) {
  const dimensions = sizeMap[size].mark;
  
  return (
    <Image
      src="/images/branding/logo-mark.png"
      alt="Wondrous Digital"
      width={dimensions}
      height={dimensions}
      className={cn('object-contain', className)}
      priority
    />
  );
}

export function LogoFull({ className, size = 'lg' }: LogoProps) {
  const height = sizeMap[size].full / 3; // Approximate aspect ratio
  const width = sizeMap[size].full;
  
  return (
    <Image
      src="/images/branding/logo-full.png"
      alt="Wondrous Digital"
      width={width}
      height={height}
      className={cn('object-contain', className)}
      priority
    />
  );
}

// Convenience component that automatically chooses between mark and full
export function Logo({ 
  variant = 'full',
  ...props 
}: LogoProps & { variant?: 'mark' | 'full' }) {
  if (variant === 'mark') {
    return <LogoMark {...props} />;
  }
  return <LogoFull {...props} />;
}