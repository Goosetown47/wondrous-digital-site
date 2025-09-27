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
  // Get dimensions without bracket notation
  let dimensions: number;
  switch (size) {
    case 'sm':
      dimensions = sizeMap.sm.mark;
      break;
    case 'lg':
      dimensions = sizeMap.lg.mark;
      break;
    case 'xl':
      dimensions = sizeMap.xl.mark;
      break;
    case 'md':
    default:
      dimensions = sizeMap.md.mark;
      break;
  }
  
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
  // Get dimensions without bracket notation
  let width: number;
  switch (size) {
    case 'sm':
      width = sizeMap.sm.full;
      break;
    case 'md':
      width = sizeMap.md.full;
      break;
    case 'xl':
      width = sizeMap.xl.full;
      break;
    case 'lg':
    default:
      width = sizeMap.lg.full;
      break;
  }
  const height = width / 3; // Approximate aspect ratio
  
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