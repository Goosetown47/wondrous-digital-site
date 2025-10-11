/**
 * LinkTypeToggle Component
 *
 * Toggle between page link and external URL
 */

'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface LinkTypeToggleProps {
  /** Current link type */
  type: 'page' | 'external';
  /** Change handler */
  onChange: (type: 'page' | 'external') => void;
  /** Optional label text */
  label?: string;
  /** Optional className for styling */
  className?: string;
}

export function LinkTypeToggle({
  type,
  onChange,
  label = 'Link Type',
  className,
}: LinkTypeToggleProps) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium text-foreground mb-2 block">{label}</Label>
      <RadioGroup value={type} onValueChange={onChange as (value: string) => void}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="page" id="link-type-page" />
          <Label htmlFor="link-type-page" className="font-normal cursor-pointer">
            Page (from project)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="external" id="link-type-external" />
          <Label htmlFor="link-type-external" className="font-normal cursor-pointer">
            External URL
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
