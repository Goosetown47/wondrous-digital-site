import fs from 'fs';
import path from 'path';
import { ComponentRegistry } from './component-registry';

export interface DiscoveredComponent {
  name: string;
  filepath: string;
  type: 'section' | 'navigation' | 'component' | 'unknown';
  isRegistered: boolean;
  folder: string;
}

/**
 * Scans the components/core directory to discover all available components
 * and checks their registration status
 */
export class ComponentScanner {
  private componentsPath: string;

  constructor(basePath?: string) {
    // Allow custom path for testing, default to actual components directory
    this.componentsPath = basePath || path.join(process.cwd(), 'src', 'components', 'core');
  }

  /**
   * Scan all components in the core directory
   */
  async scanComponents(): Promise<DiscoveredComponent[]> {
    const discovered: DiscoveredComponent[] = [];

    try {
      // Check if directory exists
      if (!fs.existsSync(this.componentsPath)) {
        console.warn(`Components directory not found: ${this.componentsPath}`);
        return discovered;
      }

      // Scan subdirectories
      const folders = fs.readdirSync(this.componentsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const folder of folders) {
        const folderPath = path.join(this.componentsPath, folder);
        const files = fs.readdirSync(folderPath)
          .filter(file => file.endsWith('.tsx') && !file.includes('.test.'));

        for (const file of files) {
          const componentName = this.extractComponentName(file);
          const type = this.detectComponentType(folder);
          const isRegistered = ComponentRegistry.has(componentName);

          discovered.push({
            name: componentName,
            filepath: path.join(folder, file),
            type,
            isRegistered,
            folder
          });
        }
      }

      // Also check root level components
      const rootFiles = fs.readdirSync(this.componentsPath)
        .filter(file => file.endsWith('.tsx') && !file.includes('.test.'));

      for (const file of rootFiles) {
        const componentName = this.extractComponentName(file);
        const isRegistered = ComponentRegistry.has(componentName);

        discovered.push({
          name: componentName,
          filepath: file,
          type: 'component',
          isRegistered,
          folder: ''
        });
      }

    } catch (error) {
      console.error('Error scanning components:', error);
    }

    return discovered;
  }

  /**
   * Get only unregistered components
   */
  async getUnregisteredComponents(): Promise<DiscoveredComponent[]> {
    const allComponents = await this.scanComponents();
    return allComponents.filter(comp => !comp.isRegistered);
  }

  /**
   * Get only registered components
   */
  async getRegisteredComponents(): Promise<DiscoveredComponent[]> {
    const allComponents = await this.scanComponents();
    return allComponents.filter(comp => comp.isRegistered);
  }

  /**
   * Extract component name from filename
   */
  private extractComponentName(filename: string): string {
    // Remove .tsx extension
    const baseName = filename.replace('.tsx', '');

    // Convert kebab-case to PascalCase
    return baseName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Detect component type based on folder structure
   */
  private detectComponentType(folder: string): 'section' | 'navigation' | 'component' | 'unknown' {
    const folderLower = folder.toLowerCase();

    if (folderLower.includes('nav') || folderLower.includes('header') || folderLower.includes('footer')) {
      return 'navigation';
    }

    if (folderLower.includes('section') || folderLower.includes('hero') || folderLower.includes('feature')) {
      return 'section';
    }

    if (folderLower.includes('ui') || folderLower.includes('component')) {
      return 'component';
    }

    // Default to section for most cases
    return 'section';
  }

  /**
   * Generate default content based on component type
   */
  generateDefaultContent(type: string): Record<string, unknown> {
    switch (type) {
      case 'navigation':
        return {
          logo: {
            url: "/",
            src: "",
            alt: "Logo",
            title: "Your Site"
          },
          menu: [
            { title: "Home", url: "/" },
            { title: "About", url: "/about" },
            { title: "Contact", url: "/contact" }
          ],
          auth: {
            login: { title: "Sign In", url: "/login" },
            signup: { title: "Get Started", url: "/signup" }
          }
        };

      case 'section':
        return {
          heading: "Section Title",
          subtext: "Section description goes here",
          buttonText: "Learn More",
          buttonLink: "#"
        };

      default:
        return {
          title: "Component",
          content: "Default content"
        };
    }
  }
}

// Export singleton instance for use in client components
let scannerInstance: ComponentScanner | null = null;

export function getComponentScanner(): ComponentScanner {
  if (!scannerInstance) {
    scannerInstance = new ComponentScanner();
  }
  return scannerInstance;
}