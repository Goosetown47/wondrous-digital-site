import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseRegistryCommand,
  detectComponentSource,
  transformImportPaths,
  extractDependencies,
  fetchComponentFromRegistry,
  processComponentImport,
  type ImportOptions
} from '../smart-import';

// Mock fetch for registry requests
global.fetch = vi.fn();

describe('Smart Import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseRegistryCommand', () => {
    it('should parse shadcn registry URL from npx command', () => {
      const command = 'npx shadcn@latest add https://ui.shadcn.com/registry/button.json';
      const result = parseRegistryCommand(command);

      expect(result).toEqual({
        url: 'https://ui.shadcn.com/registry/button.json',
        source: 'shadcn',
        componentName: 'button'
      });
    });

    it('should parse Aceternity registry URL', () => {
      const command = 'npx shadcn@latest add https://ui.aceternity.com/registry/container-text-flip.json';
      const result = parseRegistryCommand(command);

      expect(result).toEqual({
        url: 'https://ui.aceternity.com/registry/container-text-flip.json',
        source: 'aceternity',
        componentName: 'container-text-flip'
      });
    });

    it('should parse Skiper UI registry URL', () => {
      const command = 'npx shadcn@latest add https://skiper-ui.com/registry/hero-section.json';
      const result = parseRegistryCommand(command);

      expect(result).toEqual({
        url: 'https://skiper-ui.com/registry/hero-section.json',
        source: 'skiper',
        componentName: 'hero-section'
      });
    });

    it('should parse TweakCN registry URL', () => {
      const command = 'npx shadcn@latest add https://tweakcn.com/registry/animated-card.json';
      const result = parseRegistryCommand(command);

      expect(result).toEqual({
        url: 'https://tweakcn.com/registry/animated-card.json',
        source: 'tweakcn',
        componentName: 'animated-card'
      });
    });

    it('should handle direct registry URLs without npx command', () => {
      const url = 'https://ui.aceternity.com/registry/sparkles.json';
      const result = parseRegistryCommand(url);

      expect(result).toEqual({
        url: 'https://ui.aceternity.com/registry/sparkles.json',
        source: 'aceternity',
        componentName: 'sparkles'
      });
    });

    it('should throw error for invalid URLs', () => {
      const invalidCommand = 'invalid command';

      expect(() => parseRegistryCommand(invalidCommand)).toThrow('Invalid registry URL');
    });
  });

  describe('detectComponentSource', () => {
    it('should detect shadcn source from URL', () => {
      const url = 'https://ui.shadcn.com/registry/button.json';
      const source = detectComponentSource(url);

      expect(source).toBe('shadcn');
    });

    it('should detect aceternity source from URL', () => {
      const url = 'https://ui.aceternity.com/registry/sparkles.json';
      const source = detectComponentSource(url);

      expect(source).toBe('aceternity');
    });

    it('should detect skiper source from URL', () => {
      const url = 'https://skiper-ui.com/registry/card.json';
      const source = detectComponentSource(url);

      expect(source).toBe('skiper');
    });

    it('should detect tweakcn source from URL', () => {
      const url = 'https://tweakcn.com/registry/component.json';
      const source = detectComponentSource(url);

      expect(source).toBe('tweakcn');
    });

    it('should return custom for unknown sources', () => {
      const url = 'https://example.com/registry/component.json';
      const source = detectComponentSource(url);

      expect(source).toBe('custom');
    });
  });

  describe('transformImportPaths', () => {
    it('should transform Aceternity import paths', () => {
      const code = `
        import { cn } from "@/utils/cn";
        import { motion } from "motion/react";
        import { Button } from "@/components/aceternity/button";
      `;

      const transformed = transformImportPaths(code, 'aceternity');

      expect(transformed).toContain('@/lib/utils');
      expect(transformed).toContain('framer-motion');
      expect(transformed).toContain('@/components/ui/button');
      expect(transformed).not.toContain('@/utils/cn');
      expect(transformed).not.toContain('motion/react');
      expect(transformed).not.toContain('@/components/aceternity');
    });

    it('should transform Skiper import paths', () => {
      const code = `
        import { cn } from "@/lib/cn";
        import { Card } from "@/components/skiper/card";
      `;

      const transformed = transformImportPaths(code, 'skiper');

      expect(transformed).toContain('@/lib/utils');
      expect(transformed).toContain('@/components/ui/card');
      expect(transformed).not.toContain('@/lib/cn');
      expect(transformed).not.toContain('@/components/skiper');
    });

    it('should transform TweakCN import paths', () => {
      const code = `
        import { Component } from "@/components/tweakcn/component";
      `;

      const transformed = transformImportPaths(code, 'tweakcn');

      expect(transformed).toContain('@/components/ui/component');
      expect(transformed).not.toContain('@/components/tweakcn');
    });

    it('should not transform shadcn paths', () => {
      const code = `
        import { Button } from "@/components/ui/button";
        import { cn } from "@/lib/utils";
      `;

      const transformed = transformImportPaths(code, 'shadcn');

      expect(transformed).toBe(code);
    });

    it('should handle multiple occurrences of the same import', () => {
      const code = `
        import { cn } from "@/utils/cn";
        const className = cn("base", condition && "@/utils/cn");
        // Using @/utils/cn in comments
      `;

      const transformed = transformImportPaths(code, 'aceternity');

      expect(transformed.match(/@\/lib\/utils/g)?.length).toBe(1);
      expect(transformed).toContain('const className = cn("base", condition && "@/utils/cn")');
    });
  });

  describe('extractDependencies', () => {
    it('should extract npm dependencies from code', () => {
      const code = `
        import React from 'react';
        import { motion, AnimatePresence } from 'framer-motion';
        import { clsx } from 'clsx';
        import localModule from './local-module';
        import { cn } from '@/lib/utils';
      `;

      const deps = extractDependencies(code);

      expect(deps).toContain('react');
      expect(deps).toContain('framer-motion');
      expect(deps).toContain('clsx');
      expect(deps).not.toContain('./local-module');
      expect(deps).not.toContain('@/lib/utils');
    });

    it('should handle require statements', () => {
      const code = `
        const lodash = require('lodash');
        const path = require('path');
        const local = require('./local');
      `;

      const deps = extractDependencies(code);

      expect(deps).toContain('lodash');
      expect(deps).not.toContain('path'); // path is a Node.js built-in
      expect(deps).not.toContain('./local');
    });

    it('should deduplicate dependencies', () => {
      const code = `
        import { motion } from 'framer-motion';
        import { AnimatePresence } from 'framer-motion';
        const framer = require('framer-motion');
      `;

      const deps = extractDependencies(code);

      expect(deps.filter(d => d === 'framer-motion').length).toBe(1);
    });

    it('should ignore built-in Node modules', () => {
      const code = `
        import fs from 'fs';
        import path from 'path';
        import http from 'http';
        import express from 'express';
      `;

      const deps = extractDependencies(code);

      expect(deps).toContain('express');
      expect(deps).not.toContain('fs');
      expect(deps).not.toContain('path');
      expect(deps).not.toContain('http');
    });
  });

  describe('fetchComponentFromRegistry', () => {
    it('should fetch component data from registry', async () => {
      const mockResponse = {
        name: 'button',
        type: 'component',
        files: [{
          name: 'button.tsx',
          content: 'export function Button() { return <button>Click me</button>; }'
        }],
        dependencies: ['clsx']
      };

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchComponentFromRegistry('https://ui.shadcn.com/registry/button.json');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://ui.shadcn.com/registry/button.json');
    });

    it('should throw error for failed fetch', async () => {
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(
        fetchComponentFromRegistry('https://invalid.com/registry/component.json')
      ).rejects.toThrow('Failed to fetch component: 404 Not Found');
    });

    it('should handle network errors', async () => {
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetchComponentFromRegistry('https://ui.shadcn.com/registry/button.json')
      ).rejects.toThrow('Network error');
    });
  });

  describe('processComponentImport', () => {
    it('should process complete component import', async () => {
      const mockRegistryData = {
        name: 'container-text-flip',
        type: 'component',
        files: [{
          name: 'container-text-flip.tsx',
          content: `
            import { motion } from "motion/react";
            import { cn } from "@/utils/cn";

            export function ContainerTextFlip() {
              return <motion.div>Animated Text</motion.div>;
            }
          `
        }],
        dependencies: ['framer-motion']
      };

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistryData
      });

      const options: ImportOptions = {
        url: 'https://ui.aceternity.com/registry/container-text-flip.json',
        autoFix: true,
        installDeps: true,
        targetDir: '/components/ui/'
      };

      const result = await processComponentImport(options);

      expect(result.name).toBe('container-text-flip');
      expect(result.source).toBe('aceternity');
      expect(result.dependencies).toContain('framer-motion');
      expect(result.transformations).toContain('motion/react -> framer-motion');
      expect(result.transformations).toContain('@/utils/cn -> @/lib/utils');
      expect(result.files[0].transformedContent).toContain('framer-motion');
      expect(result.files[0].transformedContent).toContain('@/lib/utils');
      expect(result.files[0].targetPath).toBe('/components/ui/container-text-flip.tsx');
    });

    it('should skip transformation when autoFix is false', async () => {
      const mockRegistryData = {
        name: 'component',
        type: 'component',
        files: [{
          name: 'component.tsx',
          content: `import { cn } from "@/utils/cn";`
        }]
      };

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistryData
      });

      const options: ImportOptions = {
        url: 'https://ui.aceternity.com/registry/component.json',
        autoFix: false,
        installDeps: false
      };

      const result = await processComponentImport(options);

      expect(result.files[0].transformedContent).toContain('@/utils/cn');
      expect(result.transformations).toHaveLength(0);
    });

    it('should handle multiple files in component', async () => {
      const mockRegistryData = {
        name: 'complex-component',
        type: 'component',
        files: [
          {
            name: 'complex-component.tsx',
            content: 'export function ComplexComponent() { return null; }'
          },
          {
            name: 'complex-component.css',
            content: '.complex { color: red; }'
          },
          {
            name: 'utils.ts',
            content: 'export const helper = () => {};'
          }
        ]
      };

      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistryData
      });

      const result = await processComponentImport({
        url: 'https://ui.shadcn.com/registry/complex-component.json',
        autoFix: true,
        installDeps: true
      });

      expect(result.files).toHaveLength(3);
      expect(result.files[0].targetPath).toBe('/components/ui/complex-component.tsx');
      expect(result.files[1].targetPath).toBe('/components/ui/complex-component.css');
      expect(result.files[2].targetPath).toBe('/components/ui/utils.ts');
    });
  });
});