/**
 * Command Parser for Universal Command Input System
 * Parses npm install and shadcn add commands with security validation
 */

// Security validation patterns
const UNSAFE_SHELL_OPERATORS = /[;&|><]/;
const COMMAND_SUBSTITUTION = /\$\(|`/;
const VARIABLE_EXPANSION = /\$\{|\$[A-Z_]/i;

// Command detection patterns
const NPM_INSTALL_PATTERN = /^npm\s+(install|i)(\s|$)/;
const SHADCN_ADD_PATTERN = /^npx\s+shadcn(@latest)?\s+add(\s|$)/;

// Command parsing patterns
const NPM_INSTALL_EXTRACT = /^npm\s+(install|i)(?:\s+(.+))?$/;
const SHADCN_ADD_EXTRACT = /^npx\s+shadcn(@latest)?\s+add(?:\s+(.+))?$/;

export type CommandType = 'npm' | 'shadcn-component' | 'shadcn-registry' | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  originalCommand: string;
  packages?: string[];
  component?: string;
  registryUrl?: string;
  warnings: string[];
}

export interface CommandParserResult {
  commands: ParsedCommand[];
  hasWarnings: boolean;
  totalCommands: number;
}

export interface SecurityValidationResult {
  safe: boolean;
  reason?: string;
}

export interface NpmInstallParseResult {
  packages: string[];
  warnings: string[];
}

export interface ShadcnAddParseResult {
  type: 'shadcn-component' | 'shadcn-registry';
  component?: string;
  registryUrl?: string;
  warnings: string[];
}

// Whitelisted registry domains for security
const WHITELISTED_DOMAINS = [
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

/**
 * Validate command for security violations
 * Returns safe: false if command contains dangerous patterns
 */
export function validateCommandSecurity(command: string): SecurityValidationResult {
  // Check for shell operators
  if (UNSAFE_SHELL_OPERATORS.test(command)) {
    return { safe: false, reason: 'Contains unsafe shell operators' };
  }

  // Check for command substitution
  if (COMMAND_SUBSTITUTION.test(command)) {
    return { safe: false, reason: 'Contains command substitution' };
  }

  // Check for variable expansion
  if (VARIABLE_EXPANSION.test(command)) {
    return { safe: false, reason: 'Contains variable expansion' };
  }

  // Check for sudo
  if (command.trim().startsWith('sudo ')) {
    return { safe: false, reason: 'Sudo commands not allowed' };
  }

  // For npm commands, only allow install/i
  if (command.trim().startsWith('npm ')) {
    const isInstall = NPM_INSTALL_PATTERN.test(command.trim());
    if (!isInstall) {
      return { safe: false, reason: 'Only npm install commands are allowed' };
    }
  }

  // For npx commands, only allow shadcn add
  if (command.trim().startsWith('npx ')) {
    const isShadcnAdd = SHADCN_ADD_PATTERN.test(command.trim());
    if (!isShadcnAdd) {
      return { safe: false, reason: 'Only npx shadcn add commands are allowed' };
    }
  }

  // All other commands are safe (they just won't be recognized)
  return { safe: true };
}

/**
 * Parse npm install command to extract package names
 */
export function parseNpmInstall(command: string): NpmInstallParseResult {
  const warnings: string[] = [];

  // Normalize multiple spaces
  const normalized = command.replace(/\s+/g, ' ').trim();

  // Extract packages after npm install/i
  const match = normalized.match(NPM_INSTALL_EXTRACT);

  if (!match || !match[2]) {
    warnings.push('Missing package names after npm install');
    return { packages: [], warnings };
  }

  const packages = match[2].split(' ').filter(Boolean);

  // Warn if too many packages (might be accidental paste)
  if (packages.length > 20) {
    warnings.push(`Installing ${packages.length} packages at once (more than 20 packages)`);
  }

  return { packages, warnings };
}

/**
 * Parse shadcn add command to extract component name or registry URL
 */
export function parseShadcnAdd(command: string): ShadcnAddParseResult {
  const warnings: string[] = [];

  // Normalize multiple spaces
  const normalized = command.replace(/\s+/g, ' ').trim();

  // Extract argument after shadcn add
  const match = normalized.match(SHADCN_ADD_EXTRACT);

  if (!match || !match[2]) {
    warnings.push('Missing component name after shadcn add');
    return { type: 'shadcn-component', warnings };
  }

  const argument = match[2];

  // Check if argument is a URL
  if (argument.startsWith('http://') || argument.startsWith('https://')) {
    // Parse as registry URL
    try {
      const url = new URL(argument);

      // Check if domain is whitelisted
      if (!WHITELISTED_DOMAINS.includes(url.hostname)) {
        warnings.push(`Registry domain ${url.hostname} not in whitelist`);
      }

      // Check if URL ends with .json
      if (!url.pathname.endsWith('.json')) {
        warnings.push('Registry URL should end with .json');
      }

      // Check if using HTTPS
      if (url.protocol === 'http:') {
        warnings.push('Registry URL should use HTTPS instead of HTTP');
      }

      return { type: 'shadcn-registry', registryUrl: argument, warnings };
    } catch {
      warnings.push('Invalid registry URL format');
      return { type: 'shadcn-registry', registryUrl: argument, warnings };
    }
  }

  // Parse as component name
  return { type: 'shadcn-component', component: argument, warnings };
}

/**
 * Parse multi-line command input into structured commands
 */
export function parseCommands(input: string): CommandParserResult {
  const commands: ParsedCommand[] = [];
  const seenCommands = new Set<string>();

  // Split by newlines and handle both Unix (LF) and Windows (CRLF) line endings
  const lines = input.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Skip comment lines
    if (trimmed.startsWith('#')) continue;

    const warnings: string[] = [];

    // Validate security
    const securityCheck = validateCommandSecurity(trimmed);
    if (!securityCheck.safe) {
      commands.push({
        type: 'unknown',
        originalCommand: trimmed,
        warnings: [`security violation: ${securityCheck.reason}`, ...warnings],
      });
      continue;
    }

    // Check for duplicates
    const commandKey = trimmed.toLowerCase();
    if (seenCommands.has(commandKey)) {
      warnings.push('Duplicate command detected');
    }
    seenCommands.add(commandKey);

    // Detect command type and parse
    if (NPM_INSTALL_PATTERN.test(trimmed)) {
      // Parse npm install
      const result = parseNpmInstall(trimmed);
      commands.push({
        type: 'npm',
        originalCommand: trimmed,
        packages: result.packages,
        warnings: [...warnings, ...result.warnings],
      });
    } else if (SHADCN_ADD_PATTERN.test(trimmed)) {
      // Parse shadcn add
      const result = parseShadcnAdd(trimmed);
      commands.push({
        type: result.type,
        originalCommand: trimmed,
        component: result.component,
        registryUrl: result.registryUrl,
        warnings: [...warnings, ...result.warnings],
      });
    } else {
      // Unknown command type
      commands.push({
        type: 'unknown',
        originalCommand: trimmed,
        warnings: [...warnings, 'Unknown command'],
      });
    }
  }

  const hasWarnings = commands.some(cmd => cmd.warnings.length > 0);

  return {
    commands,
    hasWarnings,
    totalCommands: commands.length,
  };
}