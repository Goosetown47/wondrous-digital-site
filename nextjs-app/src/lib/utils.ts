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
    // Use forEach to avoid bracket notation
    let isEqual = true;
    a.forEach((item, index) => {
      if (isEqual && index < b.length) {
        // Get the value at index without bracket notation
        const bValue = b.at(index);
        if (!deepEqual(item, bValue)) {
          isEqual = false;
        }
      }
    });
    return isEqual;
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
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    // Use Object.entries to safely access values
    const aEntry = Object.entries(a as object).find(([k]) => k === key);
    const bEntry = Object.entries(b as object).find(([k]) => k === key);
    if (!aEntry || !bEntry) return false;
    return deepEqual(aEntry[1], bEntry[1]);
  });
}