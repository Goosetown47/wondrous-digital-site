/**
 * Central registration of all CORE components
 * This file maps component names to their implementations
 */

import { ComponentRegistry } from './component-registry';
import { generateEditableFields } from './editable-field-detector';
import { Navbar2 } from '@/components/core/navigation/navbar2';
import { Footer2 } from '@/components/core/navigation/footer2';
import { HeroTwoColumn } from '@/components/sections/hero-two-column';
import { Navbar6 as NavBar3 } from '@/components/core/sections/nav-bar-3';

// Default content structures for each component type
const defaultNavigationContent = {
  logo: {
    url: "/",
    src: null, // Start with null to show placeholder
    alt: "Logo",
    title: "Your Site"
  },
  menu: [
    { title: "Home", url: "/" },
    { title: "About", url: "/about" },
    { title: "Services", url: "/services", items: [] },
    { title: "Contact", url: "/contact" }
  ],
  auth: {
    login: { title: "Sign In", url: "/login" },
    signup: { title: "Get Started", url: "/signup" }
  }
};

const defaultHeroContent = {
  heading: "Welcome to Your Site",
  subtext: "Build something amazing with our platform",
  buttonText: "Get Started",
  buttonLink: "#",
  secondaryButtonText: "View on GitHub",
  secondaryButtonLink: "#",
  imageUrl: ""
};

/**
 * Register all available components
 * When you add a new component from shadcn or elsewhere:
 * 1. Import it above
 * 2. Register it here with appropriate type and default content
 */
export function registerAllComponents() {
  // Clear any existing registrations
  ComponentRegistry.clear();

  // Navigation Components
  ComponentRegistry.register('Navbar2', {
    component: Navbar2,
    type: 'navigation',
    category: undefined, // Will be set from database type_id when selected
    defaultContent: defaultNavigationContent,
    description: 'Modern navigation bar with dropdown support',
    source: 'shadcn',
    // Navigation uses specialized editor, only non-menu fields are editable here
    editableFields: [
      {
        path: 'logo.src',
        type: 'image',
        label: 'Logo Image',
        description: 'Your brand logo',
        allowedFormats: ['png', 'jpg', 'svg', 'webp'],
      },
      {
        path: 'logo.alt',
        type: 'text',
        label: 'Logo Alt Text',
        description: 'Alternative text for accessibility',
        maxLength: 100,
      },
      {
        path: 'logo.title',
        type: 'text',
        label: 'Brand Name',
        description: 'Your company or brand name',
        maxLength: 50,
      },
      {
        path: 'auth.login.title',
        type: 'text',
        label: 'Login Button Text',
        maxLength: 30,
      },
      {
        path: 'auth.signup.title',
        type: 'text',
        label: 'Sign Up Button Text',
        maxLength: 30,
      },
      // Menu structure handled by specialized navigation editor
    ]
  });

  ComponentRegistry.register('Footer2', {
    component: Footer2,
    type: 'navigation',
    category: undefined, // Will be set from database type_id when selected
    defaultContent: defaultNavigationContent,
    description: 'Footer with multiple column layout',
    source: 'shadcn'
  });

  // Section Components
  ComponentRegistry.register('HeroTwoColumn', {
    component: HeroTwoColumn,
    type: 'section',
    category: undefined, // Will be set from database type_id when selected
    defaultContent: defaultHeroContent,
    description: 'Hero section with two column layout',
    source: 'custom',
    // Use automatic field detection with some overrides
    editableFields: generateEditableFields(defaultHeroContent, [
      {
        path: 'heading',
        type: 'text',
        label: 'Main Heading',
        maxLength: 100,
        required: true,
      },
      {
        path: 'subtext',
        type: 'richText',
        label: 'Description',
        maxLength: 500,
        description: 'Supporting text with rich formatting',
      },
      {
        path: 'buttonText',
        type: 'text', // Not 'button' since we're just editing the text
        label: 'Button Label',
        maxLength: 30,
      },
      {
        path: 'secondaryButtonText',
        type: 'text',
        label: 'Secondary Button Label',
        maxLength: 30,
      },
      {
        path: 'imageUrl',
        type: 'image',
        label: 'Hero Image',
        description: 'Featured image for the hero section',
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      },
    ])
  });

  // Add more components as you import them from shadcn
  // Example:
  // ComponentRegistry.register('Testimonials3', {
  //   component: Testimonials3,
  //   type: 'section',
  //   defaultContent: defaultTestimonialsContent,
  //   description: 'Three column testimonials grid',
  //   source: 'shadcn'
  // });

  ComponentRegistry.register('NavBar3', {
    component: NavBar3,
    type: 'section',
    category: undefined,
    defaultContent: defaultHeroContent,
    description: 'Nav Bar 3',
    source: 'expansions'
  });
}

// Initialize components on module load
registerAllComponents();

// Export for use in other parts of the app
export { ComponentRegistry };