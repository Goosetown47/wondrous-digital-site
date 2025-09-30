import { describe, it, expect } from 'vitest';
import {
  parseCommands,
  parseNpmInstall,
  parseShadcnAdd,
  validateCommandSecurity,
  type ParsedCommand,
} from '../command-parser';

describe('command-parser', () => {
  describe('validateCommandSecurity', () => {
    it('should allow npm install commands', () => {
      const result = validateCommandSecurity('npm install framer-motion');
      expect(result.safe).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow npm i shorthand', () => {
      const result = validateCommandSecurity('npm i lucide-react');
      expect(result.safe).toBe(true);
    });

    it('should allow npx shadcn add commands', () => {
      const result = validateCommandSecurity('npx shadcn add button');
      expect(result.safe).toBe(true);
    });

    it('should allow npx shadcn@latest add commands', () => {
      const result = validateCommandSecurity('npx shadcn@latest add button');
      expect(result.safe).toBe(true);
    });

    it('should reject commands with semicolon operator', () => {
      const result = validateCommandSecurity('npm install framer-motion; rm -rf /');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('shell operator');
    });

    it('should reject commands with && operator', () => {
      const result = validateCommandSecurity('npm install framer-motion && npm run dev');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('shell operator');
    });

    it('should reject commands with || operator', () => {
      const result = validateCommandSecurity('npm install framer-motion || echo fail');
      expect(result.safe).toBe(false);
    });

    it('should reject commands with pipe operator', () => {
      const result = validateCommandSecurity('npm install framer-motion | grep error');
      expect(result.safe).toBe(false);
    });

    it('should reject commands with redirect operators', () => {
      expect(validateCommandSecurity('npm install > output.txt').safe).toBe(false);
      expect(validateCommandSecurity('npm install < input.txt').safe).toBe(false);
      expect(validateCommandSecurity('npm install >> output.txt').safe).toBe(false);
    });

    it('should reject commands with command substitution $()', () => {
      const result = validateCommandSecurity('npm install $(cat packages.txt)');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('command substitution');
    });

    it('should reject commands with backtick substitution', () => {
      const result = validateCommandSecurity('npm install `cat packages.txt`');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('command substitution');
    });

    it('should reject commands with variable expansion', () => {
      expect(validateCommandSecurity('npm install $PACKAGE').safe).toBe(false);
      expect(validateCommandSecurity('npm install ${PACKAGE}').safe).toBe(false);
    });

    it('should reject non-whitelisted npm commands', () => {
      expect(validateCommandSecurity('npm uninstall framer-motion').safe).toBe(false);
      expect(validateCommandSecurity('npm run dev').safe).toBe(false);
      expect(validateCommandSecurity('npm test').safe).toBe(false);
    });

    it('should reject non-whitelisted npx commands', () => {
      expect(validateCommandSecurity('npx create-next-app').safe).toBe(false);
      expect(validateCommandSecurity('npx eslint .').safe).toBe(false);
    });

    it('should reject sudo commands', () => {
      const result = validateCommandSecurity('sudo npm install framer-motion');
      expect(result.safe).toBe(false);
    });
  });

  describe('parseNpmInstall', () => {
    it('should parse npm install with single package', () => {
      const result = parseNpmInstall('npm install framer-motion');
      expect(result.packages).toEqual(['framer-motion']);
      expect(result.warnings).toHaveLength(0);
    });

    it('should parse npm install with multiple packages', () => {
      const result = parseNpmInstall('npm install framer-motion lucide-react clsx');
      expect(result.packages).toEqual(['framer-motion', 'lucide-react', 'clsx']);
    });

    it('should parse npm i shorthand', () => {
      const result = parseNpmInstall('npm i framer-motion');
      expect(result.packages).toEqual(['framer-motion']);
    });

    it('should parse packages with version specifiers', () => {
      const result = parseNpmInstall('npm install framer-motion@12.0.0');
      expect(result.packages).toEqual(['framer-motion@12.0.0']);
    });

    it('should parse packages with caret ranges', () => {
      const result = parseNpmInstall('npm install framer-motion@^12.0.0');
      expect(result.packages).toEqual(['framer-motion@^12.0.0']);
    });

    it('should parse packages with tilde ranges', () => {
      const result = parseNpmInstall('npm install framer-motion@~12.0.0');
      expect(result.packages).toEqual(['framer-motion@~12.0.0']);
    });

    it('should parse scoped packages', () => {
      const result = parseNpmInstall('npm install @radix-ui/react-dialog');
      expect(result.packages).toEqual(['@radix-ui/react-dialog']);
    });

    it('should parse multiple scoped packages', () => {
      const result = parseNpmInstall('npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu');
      expect(result.packages).toEqual(['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']);
    });

    it('should normalize multiple spaces', () => {
      const result = parseNpmInstall('npm install   framer-motion    lucide-react');
      expect(result.packages).toEqual(['framer-motion', 'lucide-react']);
    });

    it('should warn if no packages provided', () => {
      const result = parseNpmInstall('npm install');
      expect(result.packages).toHaveLength(0);
      expect(result.warnings).toContain('Missing package names after npm install');
    });

    it('should warn if too many packages (>20)', () => {
      const packages = Array.from({ length: 25 }, (_, i) => `package${i}`);
      const result = parseNpmInstall(`npm install ${packages.join(' ')}`);
      expect(result.packages).toHaveLength(25);
      expect(result.warnings.some(w => w.includes('20 packages'))).toBe(true);
    });
  });

  describe('parseShadcnAdd', () => {
    it('should parse shadcn add with component name', () => {
      const result = parseShadcnAdd('npx shadcn add button');
      expect(result.type).toBe('shadcn-component');
      expect(result.component).toBe('button');
      expect(result.registryUrl).toBeUndefined();
    });

    it('should parse shadcn@latest add', () => {
      const result = parseShadcnAdd('npx shadcn@latest add button');
      expect(result.type).toBe('shadcn-component');
      expect(result.component).toBe('button');
    });

    it('should parse shadcn add with registry URL', () => {
      const url = 'https://ui.aceternity.com/registry/container-text-flip.json';
      const result = parseShadcnAdd(`npx shadcn add ${url}`);
      expect(result.type).toBe('shadcn-registry');
      expect(result.registryUrl).toBe(url);
      expect(result.component).toBeUndefined();
    });

    it('should parse hyphenated component names', () => {
      const result = parseShadcnAdd('npx shadcn add dropdown-menu');
      expect(result.component).toBe('dropdown-menu');
    });

    it('should warn if no component provided', () => {
      const result = parseShadcnAdd('npx shadcn add');
      expect(result.warnings).toContain('Missing component name after shadcn add');
    });

    it('should warn if registry URL not whitelisted', () => {
      const url = 'https://malicious-site.com/registry/component.json';
      const result = parseShadcnAdd(`npx shadcn add ${url}`);
      expect(result.warnings.some(w => w.includes('not in whitelist'))).toBe(true);
    });

    it('should warn if URL does not end with .json', () => {
      const url = 'https://ui.shadcn.com/registry/button';
      const result = parseShadcnAdd(`npx shadcn add ${url}`);
      expect(result.warnings.some(w => w.includes('.json'))).toBe(true);
    });

    it('should warn if URL uses HTTP instead of HTTPS', () => {
      const url = 'http://ui.shadcn.com/registry/button.json';
      const result = parseShadcnAdd(`npx shadcn add ${url}`);
      expect(result.warnings.some(w => w.includes('HTTPS'))).toBe(true);
    });

    it('should accept all whitelisted domains', () => {
      const whitelistedDomains = [
        'ui.shadcn.com',
        'ui.aceternity.com',
        'pro.aceternity.com',
        'skiper-ui.com',
        'tweakcn.com',
        'shadcnblocks.com',
        'www.shadcnblocks.com',
        'reactbits.dev',
        'www.reactbits.dev',
        'shadcnui-expansions.typeart.cc',
        'www.shadcnui-expansions.typeart.cc',
      ];

      whitelistedDomains.forEach(domain => {
        const url = `https://${domain}/registry/test.json`;
        const result = parseShadcnAdd(`npx shadcn add ${url}`);
        expect(result.warnings.some(w => w.includes('not in whitelist'))).toBe(false);
      });
    });
  });

  describe('parseCommands', () => {
    it('should parse single npm install command', () => {
      const input = 'npm install framer-motion';
      const result = parseCommands(input);

      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].type).toBe('npm');
      expect(result.commands[0].packages).toEqual(['framer-motion']);
      expect(result.totalCommands).toBe(1);
    });

    it('should parse single shadcn add command', () => {
      const input = 'npx shadcn add button';
      const result = parseCommands(input);

      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].type).toBe('shadcn-component');
      expect(result.commands[0].component).toBe('button');
    });

    it('should parse multiple commands (multi-line)', () => {
      const input = `npm install framer-motion
npx shadcn add button
npx shadcn add https://ui.aceternity.com/registry/container-text-flip.json`;

      const result = parseCommands(input);

      expect(result.commands).toHaveLength(3);
      expect(result.commands[0].type).toBe('npm');
      expect(result.commands[1].type).toBe('shadcn-component');
      expect(result.commands[2].type).toBe('shadcn-registry');
    });

    it('should skip empty lines', () => {
      const input = `npm install framer-motion

npx shadcn add button

`;

      const result = parseCommands(input);
      expect(result.commands).toHaveLength(2);
    });

    it('should skip comment lines starting with #', () => {
      const input = `# Install dependencies
npm install framer-motion
# Add components
npx shadcn add button`;

      const result = parseCommands(input);
      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].type).toBe('npm');
      expect(result.commands[1].type).toBe('shadcn-component');
    });

    it('should detect duplicate commands', () => {
      const input = `npm install framer-motion
npm install framer-motion`;

      const result = parseCommands(input);
      expect(result.commands).toHaveLength(2);
      expect(result.commands[1].warnings.some(w => w.includes('Duplicate'))).toBe(true);
    });

    it('should mark unknown commands as type unknown', () => {
      const input = 'yarn add framer-motion';
      const result = parseCommands(input);

      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].type).toBe('unknown');
      expect(result.commands[0].warnings.some(w => w.includes('Unknown command'))).toBe(true);
    });

    it('should handle Windows-style line endings (CRLF)', () => {
      const input = 'npm install framer-motion\r\nnpx shadcn add button';
      const result = parseCommands(input);

      expect(result.commands).toHaveLength(2);
    });

    it('should trim whitespace from commands', () => {
      const input = '  npm install framer-motion  \n  npx shadcn add button  ';
      const result = parseCommands(input);

      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].originalCommand).toBe('npm install framer-motion');
    });

    it('should set hasWarnings flag correctly', () => {
      const input = 'npm install';
      const result = parseCommands(input);

      expect(result.hasWarnings).toBe(true);
    });

    it('should not set hasWarnings when no warnings', () => {
      const input = 'npm install framer-motion';
      const result = parseCommands(input);

      expect(result.hasWarnings).toBe(false);
    });

    it('should reject security violations and not include in commands', () => {
      const input = 'npm install framer-motion && rm -rf /';
      const result = parseCommands(input);

      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].type).toBe('unknown');
      expect(result.commands[0].warnings.some(w => w.includes('security'))).toBe(true);
    });

    it('should handle complex multi-command input', () => {
      const input = `# Install npm packages
npm install framer-motion lucide-react

# Add shadcn components
npx shadcn add button
npx shadcn add dropdown-menu

# Add registry components
npx shadcn add https://ui.aceternity.com/registry/container-text-flip.json`;

      const result = parseCommands(input);

      expect(result.commands).toHaveLength(4);
      expect(result.totalCommands).toBe(4);
    });
  });
});