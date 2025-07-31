import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface ShadcnComponent {
  name: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: string[];
  type: 'component' | 'block';
}

export class ShadcnFetcher {
  private componentsDir: string;
  private registry: Map<string, ShadcnComponent> = new Map();

  constructor() {
    this.componentsDir = path.join(process.cwd(), 'src/components/ui');
    this.loadRegistry();
  }

  /**
   * Load the shadcn component registry
   */
  private loadRegistry() {
    // This is a subset of shadcn components - in production, this would be fetched from the registry
    const components: ShadcnComponent[] = [
      {
        name: "accordion",
        dependencies: ["@radix-ui/react-accordion"],
        files: ["accordion.tsx"],
        type: "component"
      },
      {
        name: "alert",
        dependencies: [],
        files: ["alert.tsx"],
        type: "component"
      },
      {
        name: "alert-dialog",
        dependencies: ["@radix-ui/react-alert-dialog"],
        files: ["alert-dialog.tsx"],
        type: "component"
      },
      {
        name: "aspect-ratio",
        dependencies: ["@radix-ui/react-aspect-ratio"],
        files: ["aspect-ratio.tsx"],
        type: "component"
      },
      {
        name: "avatar",
        dependencies: ["@radix-ui/react-avatar"],
        files: ["avatar.tsx"],
        type: "component"
      },
      {
        name: "badge",
        dependencies: ["class-variance-authority"],
        files: ["badge.tsx"],
        type: "component"
      },
      {
        name: "button",
        dependencies: ["class-variance-authority", "@radix-ui/react-slot"],
        files: ["button.tsx"],
        type: "component"
      },
      {
        name: "calendar",
        dependencies: ["react-day-picker", "date-fns"],
        files: ["calendar.tsx"],
        type: "component"
      },
      {
        name: "card",
        dependencies: [],
        files: ["card.tsx"],
        type: "component"
      },
      {
        name: "checkbox",
        dependencies: ["@radix-ui/react-checkbox"],
        files: ["checkbox.tsx"],
        type: "component"
      },
      {
        name: "collapsible",
        dependencies: ["@radix-ui/react-collapsible"],
        files: ["collapsible.tsx"],
        type: "component"
      },
      {
        name: "command",
        dependencies: ["cmdk"],
        files: ["command.tsx"],
        type: "component"
      },
      {
        name: "context-menu",
        dependencies: ["@radix-ui/react-context-menu"],
        files: ["context-menu.tsx"],
        type: "component"
      },
      {
        name: "dialog",
        dependencies: ["@radix-ui/react-dialog"],
        files: ["dialog.tsx"],
        type: "component"
      },
      {
        name: "dropdown-menu",
        dependencies: ["@radix-ui/react-dropdown-menu"],
        files: ["dropdown-menu.tsx"],
        type: "component"
      },
      {
        name: "form",
        dependencies: ["@radix-ui/react-label", "@radix-ui/react-slot", "react-hook-form", "@hookform/resolvers", "zod"],
        files: ["form.tsx"],
        type: "component"
      },
      {
        name: "hover-card",
        dependencies: ["@radix-ui/react-hover-card"],
        files: ["hover-card.tsx"],
        type: "component"
      },
      {
        name: "input",
        dependencies: [],
        files: ["input.tsx"],
        type: "component"
      },
      {
        name: "label",
        dependencies: ["@radix-ui/react-label"],
        files: ["label.tsx"],
        type: "component"
      },
      {
        name: "menubar",
        dependencies: ["@radix-ui/react-menubar"],
        files: ["menubar.tsx"],
        type: "component"
      },
      {
        name: "navigation-menu",
        dependencies: ["@radix-ui/react-navigation-menu"],
        files: ["navigation-menu.tsx"],
        type: "component"
      },
      {
        name: "popover",
        dependencies: ["@radix-ui/react-popover"],
        files: ["popover.tsx"],
        type: "component"
      },
      {
        name: "progress",
        dependencies: ["@radix-ui/react-progress"],
        files: ["progress.tsx"],
        type: "component"
      },
      {
        name: "radio-group",
        dependencies: ["@radix-ui/react-radio-group"],
        files: ["radio-group.tsx"],
        type: "component"
      },
      {
        name: "scroll-area",
        dependencies: ["@radix-ui/react-scroll-area"],
        files: ["scroll-area.tsx"],
        type: "component"
      },
      {
        name: "select",
        dependencies: ["@radix-ui/react-select"],
        files: ["select.tsx"],
        type: "component"
      },
      {
        name: "separator",
        dependencies: ["@radix-ui/react-separator"],
        files: ["separator.tsx"],
        type: "component"
      },
      {
        name: "sheet",
        dependencies: ["@radix-ui/react-dialog"],
        files: ["sheet.tsx"],
        type: "component"
      },
      {
        name: "skeleton",
        dependencies: [],
        files: ["skeleton.tsx"],
        type: "component"
      },
      {
        name: "slider",
        dependencies: ["@radix-ui/react-slider"],
        files: ["slider.tsx"],
        type: "component"
      },
      {
        name: "switch",
        dependencies: ["@radix-ui/react-switch"],
        files: ["switch.tsx"],
        type: "component"
      },
      {
        name: "table",
        dependencies: [],
        files: ["table.tsx"],
        type: "component"
      },
      {
        name: "tabs",
        dependencies: ["@radix-ui/react-tabs"],
        files: ["tabs.tsx"],
        type: "component"
      },
      {
        name: "textarea",
        dependencies: [],
        files: ["textarea.tsx"],
        type: "component"
      },
      {
        name: "toast",
        dependencies: ["@radix-ui/react-toast"],
        files: ["toast.tsx", "toaster.tsx", "use-toast.ts"],
        type: "component"
      },
      {
        name: "toggle",
        dependencies: ["@radix-ui/react-toggle"],
        files: ["toggle.tsx"],
        type: "component"
      },
      {
        name: "toggle-group",
        dependencies: ["@radix-ui/react-toggle-group"],
        files: ["toggle-group.tsx"],
        type: "component"
      },
      {
        name: "tooltip",
        dependencies: ["@radix-ui/react-tooltip"],
        files: ["tooltip.tsx"],
        type: "component"
      },
    ];

    components.forEach(comp => {
      this.registry.set(comp.name, comp);
    });
  }

  /**
   * Get all available shadcn components
   */
  getAllComponents(): ShadcnComponent[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get a specific component by name
   */
  getComponent(name: string): ShadcnComponent | undefined {
    return this.registry.get(name);
  }

  /**
   * Check if a component exists in the UI directory
   */
  componentExists(name: string): boolean {
    const component = this.registry.get(name);
    if (!component) return false;

    return component.files.every(file => {
      const filePath = path.join(this.componentsDir, file);
      return fs.existsSync(filePath);
    });
  }

  /**
   * Get the file path for a component
   */
  getComponentPath(name: string): string | null {
    const component = this.registry.get(name);
    if (!component || component.files.length === 0) return null;

    const filePath = path.join(this.componentsDir, component.files[0]);
    return fs.existsSync(filePath) ? filePath : null;
  }

  /**
   * Install a component using shadcn CLI
   */
  installComponent(name: string): boolean {
    try {
      console.log(`Installing ${name} from shadcn/ui...`);
      execSync(`npx shadcn@latest add ${name} --yes`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      return true;
    } catch (error) {
      console.error(`Failed to install ${name}:`, error);
      return false;
    }
  }

  /**
   * Get components that are not yet installed
   */
  getMissingComponents(): string[] {
    return Array.from(this.registry.keys()).filter(name => !this.componentExists(name));
  }

  /**
   * Get installed components
   */
  getInstalledComponents(): string[] {
    return Array.from(this.registry.keys()).filter(name => this.componentExists(name));
  }
}