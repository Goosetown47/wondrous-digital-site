/**
 * Section Default Content Definitions
 * 
 * This file contains the complete default content for each section type.
 * These defaults will be stored in the database and used when sections are added to pages.
 */

export interface SectionDefaultContent {
  [key: string]: any;
}

export const sectionDefaults: Record<string, SectionDefaultContent> = {
  // Hero Sections
  hero: {
    headline: {
      text: "Medium length hero headline goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary",
      icon: ""
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "tertiary",
      icon: ""
    },
    heroImage: {
      src: "",
      alt: "Hero image",
      imageScaling: "fill-height",
      containerMode: "section-height",
      containerAspectRatio: "16:9",
      containerSize: "large"
    },
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  },

  // Features Sections
  features: {
    tagline: {
      text: "Tagline",
      color: "#000000",
      lineHeight: "1.5"
    },
    mainHeading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature1Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature1Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature1Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature2Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature2Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature2Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature3Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature3Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature3Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature4Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature4Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature4Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary",
      icon: ""
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "secondary",
      icon: ""
    },
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  },

  // CTA Sections
  cta: {
    heading: {
      text: "Ready to get started?",
      color: "#000000",
      lineHeight: "1.2"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    primaryButton: {
      text: "Get Started",
      href: "#",
      variant: "primary",
      icon: ""
    },
    secondaryButton: {
      text: "Learn More",
      href: "#",
      variant: "secondary",
      icon: ""
    },
    backgroundColor: "#F3F4F6",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  },

  // Team Sections
  team: {
    mainHeading: {
      text: "Meet Our Team",
      color: "#000000",
      lineHeight: "1.2"
    },
    tagline: {
      text: "The people behind our success",
      color: "#6B7280",
      lineHeight: "1.5"
    },
    member1Name: {
      text: "Full Name",
      color: "#000000",
      lineHeight: "1.2"
    },
    member1Role: {
      text: "Job Title",
      color: "#6B7280",
      lineHeight: "1.5"
    },
    member1Bio: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#4B5563",
      lineHeight: "1.6"
    },
    member1Image: {
      src: "",
      alt: "Team member 1",
      imageScaling: "center-crop",
      containerMode: "fixed-shape",
      containerAspectRatio: "1:1",
      containerSize: "medium"
    },
    member2Name: {
      text: "Full Name",
      color: "#000000",
      lineHeight: "1.2"
    },
    member2Role: {
      text: "Job Title",
      color: "#6B7280",
      lineHeight: "1.5"
    },
    member2Bio: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#4B5563",
      lineHeight: "1.6"
    },
    member2Image: {
      src: "",
      alt: "Team member 2",
      imageScaling: "center-crop",
      containerMode: "fixed-shape",
      containerAspectRatio: "1:1",
      containerSize: "medium"
    },
    member3Name: {
      text: "Full Name",
      color: "#000000",
      lineHeight: "1.2"
    },
    member3Role: {
      text: "Job Title",
      color: "#6B7280",
      lineHeight: "1.5"
    },
    member3Bio: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#4B5563",
      lineHeight: "1.6"
    },
    member3Image: {
      src: "",
      alt: "Team member 3",
      imageScaling: "center-crop",
      containerMode: "fixed-shape",
      containerAspectRatio: "1:1",
      containerSize: "medium"
    },
    member4Name: {
      text: "Full Name",
      color: "#000000",
      lineHeight: "1.2"
    },
    member4Role: {
      text: "Job Title",
      color: "#6B7280",
      lineHeight: "1.5"
    },
    member4Bio: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#4B5563",
      lineHeight: "1.6"
    },
    member4Image: {
      src: "",
      alt: "Team member 4",
      imageScaling: "center-crop",
      containerMode: "fixed-shape",
      containerAspectRatio: "1:1",
      containerSize: "medium"
    },
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  },

  // Services Grid
  "services-grid": {
    mainHeading: {
      text: "Our Services",
      color: "#000000",
      lineHeight: "1.2"
    },
    tagline: {
      text: "What we offer",
      color: "#6B7280",
      lineHeight: "1.5"
    },
    service1Icon: {
      icon: "Briefcase",
      size: 40,
      color: "#000000"
    },
    service1Title: {
      text: "Service Title",
      color: "#000000",
      lineHeight: "1.2"
    },
    service1Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    service2Icon: {
      icon: "Briefcase",
      size: 40,
      color: "#000000"
    },
    service2Title: {
      text: "Service Title",
      color: "#000000",
      lineHeight: "1.2"
    },
    service2Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    service3Icon: {
      icon: "Briefcase",
      size: 40,
      color: "#000000"
    },
    service3Title: {
      text: "Service Title",
      color: "#000000",
      lineHeight: "1.2"
    },
    service3Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    service4Icon: {
      icon: "Briefcase",
      size: 40,
      color: "#000000"
    },
    service4Title: {
      text: "Service Title",
      color: "#000000",
      lineHeight: "1.2"
    },
    service4Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    service5Icon: {
      icon: "Briefcase",
      size: 40,
      color: "#000000"
    },
    service5Title: {
      text: "Service Title",
      color: "#000000",
      lineHeight: "1.2"
    },
    service5Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    service6Icon: {
      icon: "Briefcase",
      size: 40,
      color: "#000000"
    },
    service6Title: {
      text: "Service Title",
      color: "#000000",
      lineHeight: "1.2"
    },
    service6Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  },

  // Navigation Sections
  "navigation-desktop": {
    logo: {
      type: "text",
      text: "Logo",
      href: "/",
      src: "",
      alt: "Logo"
    },
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    ctaButton1: {
      text: "",
      href: "#",
      variant: "primary",
      icon: ""
    },
    ctaButton2: {
      text: "",
      href: "#",
      variant: "secondary",
      icon: ""
    }
  },

  // Footer Sections
  footer: {
    logo: {
      type: "text",
      text: "Company Name",
      href: "/",
      src: "",
      alt: "Logo"
    },
    companyDescription: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    copyrightText: {
      text: "© 2024 Company Name. All rights reserved.",
      color: "#9CA3AF",
      lineHeight: "1.5"
    },
    backgroundColor: "#1F2937",
    textColor: "#FFFFFF"
  },

  // Text Sections
  text: {
    heading: {
      text: "Section Heading",
      color: "#000000",
      lineHeight: "1.2"
    },
    subheading: {
      text: "Section Subheading",
      color: "#4B5563",
      lineHeight: "1.4"
    },
    bodyText: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    alignment: "left",
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  },

  // Image Sections
  image: {
    image: {
      src: "",
      alt: "Section image",
      imageScaling: "fit-image",
      containerMode: "fixed-shape",
      containerAspectRatio: "16:9",
      containerSize: "large"
    },
    caption: {
      text: "",
      color: "#6B7280",
      lineHeight: "1.5"
    },
    alignment: "center",
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  }
};

/**
 * Get default content for a specific section type
 * @param sectionType The type of section
 * @returns The default content object
 */
export function getDefaultContent(sectionType: string): SectionDefaultContent {
  return sectionDefaults[sectionType] || {};
}

/**
 * Get all section types that have defaults defined
 * @returns Array of section type strings
 */
export function getAllSectionTypes(): string[] {
  return Object.keys(sectionDefaults);
}

/**
 * Merge default content with existing content
 * Existing content takes precedence
 * @param sectionType The type of section
 * @param existingContent The existing content to merge with defaults
 * @returns Merged content object
 */
export function mergeWithDefaults(
  sectionType: string, 
  existingContent: SectionDefaultContent = {}
): SectionDefaultContent {
  const defaults = getDefaultContent(sectionType);
  
  // Deep merge - existing content overrides defaults
  const merged = { ...defaults };
  
  Object.keys(existingContent).forEach(key => {
    if (typeof existingContent[key] === 'object' && existingContent[key] !== null && !Array.isArray(existingContent[key])) {
      merged[key] = { ...defaults[key], ...existingContent[key] };
    } else {
      merged[key] = existingContent[key];
    }
  });
  
  return merged;
}