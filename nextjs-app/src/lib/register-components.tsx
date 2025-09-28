/**
 * Central registration of all CORE components
 * This file maps component names to their implementations
 */

import { ComponentRegistry } from './component-registry';
import { registerGeneratedComponents } from './register-components-generated';

// Component imports will be added here as components are created

// Default content structures and adapters will be defined here
// as components are created through the pipeline

/**
 * Register all available components
 * When you add a new component from shadcn or elsewhere:
 * 1. Import it above
 * 2. Register it here with appropriate type and default content
 */
export function registerAllComponents() {
  // Clear any existing registrations
  ComponentRegistry.clear();

  // Register all auto-generated components from the pipeline
  registerGeneratedComponents();

  // Navigation Components
  // (Will be populated as components are created)



  // Section Components
  // (Additional manual components can be registered here)

  // Add more components as you import them from shadcn
  // Example:
  // ComponentRegistry.register('Testimonials3', {
  //   component: Testimonials3,
  //   type: 'section',
  //   defaultContent: defaultTestimonialsContent,
  //   description: 'Three column testimonials grid',
  //   source: 'shadcn'
  // });

  

  

  

  

  

  
}

// Initialize components on module load
registerAllComponents();

// Export for use in other parts of the app
export { ComponentRegistry };