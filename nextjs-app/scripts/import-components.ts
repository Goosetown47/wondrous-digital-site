#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { ComponentParser } from './lib/component-parser';
import { ShadcnFetcher } from './lib/shadcn-fetcher';
import { coreComponentService } from '../src/lib/supabase/core-components';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface ImportOptions {
  source: 'shadcn' | 'custom';
  all?: boolean;
  list?: string;
  file?: string;
  dir?: string;
  dryRun?: boolean;
  update?: boolean;
}

class ComponentImporter {
  private parser: ComponentParser;
  private shadcnFetcher: ShadcnFetcher;
  private importLog: string[] = [];

  constructor() {
    this.parser = new ComponentParser();
    this.shadcnFetcher = new ShadcnFetcher();
  }

  async importComponents(options: ImportOptions) {
    console.log('🚀 Starting component import...\n');

    if (options.source === 'shadcn') {
      await this.importShadcnComponents(options);
    } else if (options.source === 'custom') {
      await this.importCustomComponents(options);
    }

    this.printSummary();
  }

  private async importShadcnComponents(options: ImportOptions) {
    let componentsToImport: string[] = [];

    if (options.all) {
      // Get all installed shadcn components
      componentsToImport = this.shadcnFetcher.getInstalledComponents();
      console.log(`Found ${componentsToImport.length} installed shadcn components\n`);
    } else if (options.list) {
      // Import specific components
      componentsToImport = options.list.split(',').map(name => name.trim());
    }

    for (const componentName of componentsToImport) {
      await this.importShadcnComponent(componentName, options);
    }
  }

  private async importShadcnComponent(name: string, options: ImportOptions) {
    console.log(`📦 Processing ${name}...`);

    // Check if component exists locally
    const componentPath = this.shadcnFetcher.getComponentPath(name);
    if (!componentPath) {
      this.log(`❌ Component ${name} not found locally`, 'error');
      return;
    }

    // Check if already in Core
    if (!options.update) {
      const exists = await this.componentExistsInCore(name, 'shadcn');
      if (exists) {
        this.log(`⏭️  Component ${name} already exists in Core`, 'skip');
        return;
      }
    }

    if (options.dryRun) {
      this.log(`🔍 Would import ${name} from ${componentPath}`, 'dry-run');
      return;
    }

    try {
      // Parse the component
      const parsed = this.parser.parseComponentFile(componentPath);
      
      // Get component info from registry
      const componentInfo = this.shadcnFetcher.getComponent(name);
      
      // Add to Core
      await coreComponentService.createComponent({
        name: parsed.name,
        type: parsed.type,
        source: 'shadcn',
        code: parsed.code,
        dependencies: componentInfo?.dependencies || parsed.dependencies,
        imports: parsed.imports,
        metadata: {
          ...parsed.metadata,
          originalName: name,
          importDate: new Date().toISOString(),
          autoImported: true,
        },
      });

      this.log(`✅ Successfully imported ${name}`, 'success');
    } catch (error) {
      this.log(`❌ Failed to import ${name}: ${error}`, 'error');
    }
  }

  private async importCustomComponents(options: ImportOptions) {
    let filePaths: string[] = [];

    if (options.file) {
      filePaths = [path.resolve(options.file)];
    } else if (options.dir) {
      const dir = path.resolve(options.dir);
      filePaths = fs.readdirSync(dir)
        .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
        .map(file => path.join(dir, file));
    }

    for (const filePath of filePaths) {
      await this.importCustomComponent(filePath, options);
    }
  }

  private async importCustomComponent(filePath: string, options: ImportOptions) {
    const fileName = path.basename(filePath);
    console.log(`📦 Processing ${fileName}...`);

    if (options.dryRun) {
      this.log(`🔍 Would import ${fileName} from ${filePath}`, 'dry-run');
      return;
    }

    try {
      const parsed = this.parser.parseComponentFile(filePath);
      
      // Check if already exists
      const exists = await this.componentExistsInCore(parsed.name, 'custom');
      if (exists && !options.update) {
        this.log(`⏭️  Component ${parsed.name} already exists in Core`, 'skip');
        return;
      }

      await coreComponentService.createComponent({
        name: parsed.name,
        type: parsed.type,
        source: 'custom',
        code: parsed.code,
        dependencies: parsed.dependencies,
        imports: parsed.imports,
        metadata: {
          ...parsed.metadata,
          originalPath: filePath,
          importDate: new Date().toISOString(),
          autoImported: true,
        },
      });

      this.log(`✅ Successfully imported ${parsed.name}`, 'success');
    } catch (error) {
      this.log(`❌ Failed to import ${fileName}: ${error}`, 'error');
    }
  }

  private async componentExistsInCore(name: string, source: string): Promise<boolean> {
    try {
      const components = await coreComponentService.getAllComponents();
      return components.some(c => c.name === name && c.source === source);
    } catch (error) {
      return false;
    }
  }

  private log(message: string, type: 'success' | 'error' | 'skip' | 'dry-run' = 'success') {
    this.importLog.push(`[${type.toUpperCase()}] ${message}`);
    console.log(message);
  }

  private printSummary() {
    console.log('\n📊 Import Summary:');
    console.log('================\n');

    const successCount = this.importLog.filter(log => log.includes('[SUCCESS]')).length;
    const errorCount = this.importLog.filter(log => log.includes('[ERROR]')).length;
    const skipCount = this.importLog.filter(log => log.includes('[SKIP]')).length;

    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n❌ Errors:');
      this.importLog
        .filter(log => log.includes('[ERROR]'))
        .forEach(log => console.log(log));
    }
  }
}

// CLI setup
const program = new Command();

program
  .name('import-components')
  .description('Import components into Core')
  .version('1.0.0');

program
  .command('import')
  .description('Import components from various sources')
  .requiredOption('-s, --source <source>', 'Component source (shadcn|custom)')
  .option('-a, --all', 'Import all components from source')
  .option('-l, --list <components>', 'Comma-separated list of components to import')
  .option('-f, --file <path>', 'Import a single component file')
  .option('-d, --dir <path>', 'Import all components from a directory')
  .option('--dry-run', 'Show what would be imported without actually importing')
  .option('--update', 'Update existing components')
  .action(async (options: ImportOptions) => {
    const importer = new ComponentImporter();
    await importer.importComponents(options);
  });

program
  .command('list')
  .description('List available components')
  .option('-s, --source <source>', 'Component source (shadcn)', 'shadcn')
  .option('-i, --installed', 'Show only installed components')
  .option('-m, --missing', 'Show only missing components')
  .action((options) => {
    const fetcher = new ShadcnFetcher();
    
    if (options.source === 'shadcn') {
      let components: string[] = [];
      
      if (options.installed) {
        components = fetcher.getInstalledComponents();
        console.log('📦 Installed shadcn components:');
      } else if (options.missing) {
        components = fetcher.getMissingComponents();
        console.log('❌ Missing shadcn components:');
      } else {
        components = fetcher.getAllComponents().map(c => c.name);
        console.log('📋 All available shadcn components:');
      }
      
      components.forEach(name => console.log(`  - ${name}`));
      console.log(`\nTotal: ${components.length}`);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}