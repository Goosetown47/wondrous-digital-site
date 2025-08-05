import { describe, it, expect } from 'vitest';
import { deepEqual } from '../utils';

describe('deepEqual', () => {
  it('should return true for identical primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('test', 'test')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('test', 'Test')).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('should handle arrays correctly', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEqual([], [])).toBe(true);
  });

  it('should handle objects with same properties in different order', () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = { c: 3, a: 1, b: 2 };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  it('should handle nested objects', () => {
    const obj1 = { 
      id: 'test',
      content: { 
        heading: 'Hello',
        subtext: 'World'
      },
      order: 1
    };
    const obj2 = { 
      id: 'test',
      content: { 
        heading: 'Hello',
        subtext: 'World'
      },
      order: 1
    };
    expect(deepEqual(obj1, obj2)).toBe(true);
    
    obj2.content.heading = 'Hi';
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it('should handle arrays of objects (like sections)', () => {
    const sections1 = [
      { id: '1', type: 'hero', content: { heading: 'Test' }, order: 0 },
      { id: '2', type: 'features', content: { title: 'Features' }, order: 1 }
    ];
    const sections2 = [
      { id: '1', type: 'hero', content: { heading: 'Test' }, order: 0 },
      { id: '2', type: 'features', content: { title: 'Features' }, order: 1 }
    ];
    expect(deepEqual(sections1, sections2)).toBe(true);
    
    sections2[0].content.heading = 'Changed';
    expect(deepEqual(sections1, sections2)).toBe(false);
  });

  it('should handle undefined vs missing properties', () => {
    const obj1 = { a: 1, b: undefined };
    const obj2 = { a: 1 };
    expect(deepEqual(obj1, obj2)).toBe(false);
    
    const obj3 = { a: 1, b: undefined };
    const obj4 = { a: 1, b: undefined };
    expect(deepEqual(obj3, obj4)).toBe(true);
  });

  it('should handle null values in objects', () => {
    const obj1 = { a: 1, b: null };
    const obj2 = { a: 1, b: null };
    expect(deepEqual(obj1, obj2)).toBe(true);
    
    const obj3 = { a: 1, b: null };
    const obj4 = { a: 1, b: undefined };
    expect(deepEqual(obj3, obj4)).toBe(false);
  });

  it('should handle empty objects and arrays', () => {
    expect(deepEqual({}, {})).toBe(true);
    expect(deepEqual([], [])).toBe(true);
    expect(deepEqual({}, [])).toBe(false);
  });

  // Note: deepEqual does not handle circular references
  // This is acceptable for our use case (comparing sections data)
});