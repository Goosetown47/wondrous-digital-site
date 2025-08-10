/**
 * Centralized slug validation service for reserved subdomains
 * 
 * This service implements comprehensive validation to prevent unauthorized use
 * of reserved subdomains and protect critical platform infrastructure.
 * 
 * @see /docs/Security/RESERVED-SUBDOMAINS.md for complete documentation
 */

/**
 * Result of slug validation check
 */
export interface SlugValidationResult {
  isValid: boolean;
  isReserved: boolean;
  requiresAdmin: boolean;
  category?: string;
  message?: string;
}

/**
 * Reserved subdomain patterns organized by category
 * Based on /docs/Security/RESERVED-SUBDOMAINS.md
 */
const RESERVED_PATTERNS = {
  // Core Infrastructure & Application
  coreInfrastructure: [
    'app',
    'www',
    'api',
    'admin',
    'dashboard',
    'console',
    'portal',
    'platform',
    'core',
    'hub',
  ],

  // Authentication & Security
  authSecurity: [
    'auth',
    'login',
    'signin',
    'signup',
    'logout',
    'oauth',
    'oauth2',
    'sso',
    'saml',
    'ldap',
    'secure',
    'ssl',
    'tls',
    'verify',
    'confirm',
    'validate',
    'reset',
    'forgot',
    'recover',
    '2fa',
    'mfa',
    'totp',
    'identity',
    'id',
    'session',
    'sessions',
  ],

  // Development & Operations
  devOps: [
    'dev',
    'develop',
    'development',
    'staging',
    'stage',
    'test',
    'testing',
    'qa',
    'preview',
    'beta',
    'alpha',
    'canary',
    'edge',
    'ci',
    'cd',
    'deploy',
    'deployment',
    'build',
    'git',
    'github',
    'gitlab',
    'bitbucket',
    'vcs',
    'jenkins',
    'travis',
    'circleci',
    'actions',
    'docker',
    'k8s',
    'kubernetes',
    'localhost',
    'local',
  ],

  // Infrastructure Services
  infrastructureServices: [
    'cdn',
    'static',
    'assets',
    'media',
    'images',
    'files',
    'uploads',
    'cache',
    'redis',
    'memcached',
    'varnish',
    'db',
    'database',
    'mysql',
    'postgres',
    'postgresql',
    'mongodb',
    'sql',
    'backup',
    'backups',
    'restore',
    'recovery',
    'storage',
    's3',
    'blob',
    'bucket',
    'queue',
    'mq',
    'rabbitmq',
    'kafka',
    'search',
    'elastic',
    'elasticsearch',
    'solr',
    'proxy',
    'gateway',
    'lb',
    'loadbalancer',
  ],

  // Communication & Support
  communicationSupport: [
    'mail',
    'email',
    'smtp',
    'imap',
    'pop',
    'pop3',
    'mx',
    'support',
    'help',
    'helpdesk',
    'ticket',
    'tickets',
    'chat',
    'messages',
    'messaging',
    'im',
    'webhook',
    'webhooks',
    'callback',
    'callbacks',
    'notify',
    'notification',
    'notifications',
    'alerts',
    'contact',
    'contacts',
    'forum',
    'forums',
    'community',
  ],

  // Monitoring & Analytics
  monitoringAnalytics: [
    'status',
    'health',
    'ping',
    'uptime',
    'heartbeat',
    'monitor',
    'monitoring',
    'metrics',
    'telemetry',
    'analytics',
    'stats',
    'statistics',
    'tracking',
    'logs',
    'logging',
    'log',
    'sentry',
    'bugsnag',
    'rollbar',
    'airbrake',
    'grafana',
    'kibana',
    'datadog',
    'newrelic',
    'trace',
    'tracing',
    'apm',
    'debug',
    'debugger',
  ],

  // Business & Legal
  businessLegal: [
    'billing',
    'payment',
    'payments',
    'pay',
    'invoice',
    'invoices',
    'subscription',
    'subscriptions',
    'subscribe',
    'pricing',
    'plans',
    'plan',
    'upgrade',
    'downgrade',
    'checkout',
    'cart',
    'shop',
    'store',
    'legal',
    'terms',
    'tos',
    'privacy',
    'policy',
    'gdpr',
    'ccpa',
    'compliance',
    'regulatory',
    'contract',
    'contracts',
    'agreement',
    'refund',
    'refunds',
    'dispute',
  ],

  // User Management
  userManagement: [
    'account',
    'accounts',
    'user',
    'users',
    'member',
    'members',
    'profile',
    'profiles',
    'me',
    'my',
    'settings',
    'preferences',
    'config',
    'configuration',
    'team',
    'teams',
    'org',
    'organization',
    'organizations',
    'company',
    'invite',
    'invites',
    'invitation',
    'referral',
    'refer',
    'role',
    'roles',
    'permission',
    'permissions',
    'group',
    'groups',
    'tenant',
    'tenants',
  ],

  // Marketing & Sales
  marketingSales: [
    'marketing',
    'campaign',
    'campaigns',
    'promo',
    'sales',
    'crm',
    'leads',
    'lead',
    'demo',
    'demos',
    'trial',
    'try',
    'sandbox',
    'onboarding',
    'welcome',
    'getting-started',
    'start',
    'partners',
    'partner',
    'affiliates',
    'affiliate',
    'resellers',
    'blog',
    'news',
    'updates',
    'changelog',
    'docs',
    'documentation',
    'guide',
    'guides',
    'wiki',
    'academy',
    'learn',
    'training',
    'tutorial',
  ],

  // Internal & System
  internalSystem: [
    'internal',
    'private',
    'restricted',
    'confidential',
    'system',
    'sys',
    'root',
    'superuser',
    'sudo',
    'su',
    'cron',
    'jobs',
    'job',
    'worker',
    'workers',
    'task',
    'temp',
    'tmp',
    'dev-tools',
    'devtools',
    'tools',
    'diagnostics',
    'diag',
    'maintenance',
    'maint',
  ],

  // Phishing & Abuse Prevention
  phishingAbuse: [
    'security',
    'security-alert',
    'secure-update',
    'urgent-security',
    'verify-account',
    'account-verify',
    'confirm-account',
    'suspended',
    'locked',
    'blocked',
    'banned',
    'update-required',
    'action-required',
    'immediate-action',
    'official',
    'verified',
    'trusted',
    'authentic',
    'no-reply',
    'noreply',
    'do-not-reply',
    'winner',
    'prize',
    'lottery',
    'free',
  ],

  // Common Misspellings & Variations
  commonVariations: [
    'wondrous',
    'wonderous',
    'wondrousdigital',
    'wd',
    'wdigital',
    'w-digital',
  ],

  // Protocol & Service Indicators
  protocolService: [
    'ftp',
    'sftp',
    'ssh',
    'telnet',
    'vnc',
    'rdp',
    'http',
    'https',
    'ws',
    'wss',
    'tcp',
    'udp',
    'ip',
  ],
} as const;

// Special patterns that need regex matching
const SPECIAL_PATTERNS = {
  // Single letters a-z
  singleLetter: /^[a-z]$/i,
  
  // Pure numbers
  pureNumbers: /^\d+$/,
  
  // Common HTTP status codes
  httpStatusCodes: /^(200|201|204|301|302|304|400|401|403|404|405|409|410|422|429|500|502|503|504)$/,
  
  // Emergency numbers
  emergencyNumbers: /^(911|999|112|000|110|119|120|122|123)$/,
} as const;

/**
 * Get the category name for a reserved slug
 */
function getReservedCategory(slug: string): string | undefined {
  const normalizedSlug = slug.toLowerCase().trim();

  // Check special patterns first
  if (SPECIAL_PATTERNS.singleLetter.test(normalizedSlug)) {
    return 'Single Letter';
  }
  // Check specific number patterns before generic pure numbers
  if (SPECIAL_PATTERNS.httpStatusCodes.test(normalizedSlug)) {
    return 'HTTP Status Code';
  }
  if (SPECIAL_PATTERNS.emergencyNumbers.test(normalizedSlug)) {
    return 'Emergency Number';
  }
  // Generic pure numbers check last
  if (SPECIAL_PATTERNS.pureNumbers.test(normalizedSlug)) {
    return 'Numeric Pattern';
  }

  // Check each category
  for (const [category, patterns] of Object.entries(RESERVED_PATTERNS)) {
    if ((patterns as readonly string[]).includes(normalizedSlug)) {
      // Convert camelCase to human-readable format
      return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
  }

  return undefined;
}

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  const normalizedSlug = slug.toLowerCase().trim();

  // Check special patterns
  if (SPECIAL_PATTERNS.singleLetter.test(normalizedSlug)) return true;
  if (SPECIAL_PATTERNS.pureNumbers.test(normalizedSlug)) return true;

  // Check all reserved patterns
  for (const patterns of Object.values(RESERVED_PATTERNS)) {
    if ((patterns as readonly string[]).includes(normalizedSlug)) {
      return true;
    }
  }

  return false;
}

/**
 * Format error message for reserved slugs
 */
function formatErrorMessage(): string {
  // Always return the same generic message for security reasons
  // We don't want to reveal why something is reserved
  return 'This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.';
}

/**
 * Validate a slug for use in projects or domains
 * 
 * @param slug - The slug to validate
 * @param isAdmin - Whether the user has admin privileges
 * @returns Validation result with details
 */
export function validateSlug(slug: string, isAdmin: boolean = false): SlugValidationResult {
  // Check if slug is a string
  if (typeof slug !== 'string') {
    return {
      isValid: false,
      isReserved: false,
      requiresAdmin: false,
      message: 'Slug is required and must be a string.',
    };
  }

  // Handle empty string case explicitly
  if (slug === '') {
    return {
      isValid: false,
      isReserved: false,
      requiresAdmin: false,
      message: 'Slug cannot be empty.',
    };
  }

  const trimmedSlug = slug.trim();
  
  // Check if slug becomes empty after trimming
  if (trimmedSlug.length === 0) {
    return {
      isValid: false,
      isReserved: false,
      requiresAdmin: false,
      message: 'Slug cannot be empty.',
    };
  }

  // Check maximum length
  if (trimmedSlug.length > 63) {
    return {
      isValid: false,
      isReserved: false,
      requiresAdmin: false,
      message: 'Slug must be 63 characters or less.',
    };
  }

  // Check valid characters (alphanumeric and hyphens only)
  if (!/^[a-z0-9-]+$/i.test(trimmedSlug)) {
    return {
      isValid: false,
      isReserved: false,
      requiresAdmin: false,
      message: 'Slug can only contain letters, numbers, and hyphens.',
    };
  }

  // Check if it starts or ends with a hyphen
  if (trimmedSlug.startsWith('-') || trimmedSlug.endsWith('-')) {
    return {
      isValid: false,
      isReserved: false,
      requiresAdmin: false,
      message: 'Slug cannot start or end with a hyphen.',
    };
  }

  // Check if reserved
  const reserved = isReservedSlug(trimmedSlug);
  
  if (reserved) {
    const category = getReservedCategory(trimmedSlug);
    
    // Admin can override
    if (isAdmin) {
      return {
        isValid: true,
        isReserved: true,
        requiresAdmin: true,
        category,
        message: 'This is a reserved name. Admin privileges are being used to override.',
      };
    }
    
    // Regular user cannot use reserved slugs
    return {
      isValid: false,
      isReserved: true,
      requiresAdmin: true,
      category,
      message: formatErrorMessage(),
    };
  }

  // Valid slug
  return {
    isValid: true,
    isReserved: false,
    requiresAdmin: false,
  };
}

/**
 * Get all reserved patterns (for testing or documentation)
 */
export function getAllReservedPatterns(): string[] {
  const allPatterns: string[] = [];
  
  for (const patterns of Object.values(RESERVED_PATTERNS)) {
    allPatterns.push(...patterns);
  }
  
  return allPatterns;
}

/**
 * Get reserved patterns by category (for testing or documentation)
 */
export function getReservedPatternsByCategory(): Record<string, readonly string[]> {
  return RESERVED_PATTERNS;
}