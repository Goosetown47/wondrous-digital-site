import { z } from 'zod';

// Base section schema
export const baseSectionSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'features', 'navigation', 'footer']),
  order: z.number(),
  templateId: z.string().optional(),
});

// Hero section content schema
export const heroContentSchema = z.object({
  headline: z.string().default('Welcome to Our Site'),
  subheadline: z.string().default('Build amazing websites with ease'),
  buttonText: z.string().default('Get Started'),
  buttonLink: z.string().default('#'),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#000000'),
  buttonBackgroundColor: z.string().default('#3b82f6'),
  buttonTextColor: z.string().default('#ffffff'),
  backgroundImage: z.string().optional(),
});

// Complete hero section schema
export const heroSectionSchema = baseSectionSchema.extend({
  type: z.literal('hero'),
  content: heroContentSchema,
});

// Union type for all sections
export const sectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  // Add more section schemas here as we build them
]);

// Types
export type BaseSection = z.infer<typeof baseSectionSchema>;
export type HeroContent = z.infer<typeof heroContentSchema>;
export type HeroSection = z.infer<typeof heroSectionSchema>;
export type Section = z.infer<typeof sectionSchema>;