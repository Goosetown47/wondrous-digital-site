import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deep equality check for objects and arrays
 * Handles undefined vs null, missing properties, and property ordering
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (a === null || b === null) return a === b;
  if (a === undefined || b === undefined) return a === b;
  
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  // One is array, other is not
  if (Array.isArray(a) || Array.isArray(b)) return false;
  
  // Handle objects
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  
  // Check if both have same number of keys
  if (aKeys.length !== bKeys.length) return false;
  
  // Check if all keys exist in both and values are equal
  return aKeys.every(key => {
    if (!(key in (b as object))) return false;
    return deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]);
  });
}