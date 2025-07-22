// Netlify API Configuration
export const netlifyConfig = {
  apiToken: import.meta.env.VITE_NETLIFY_API_TOKEN,
  teamId: import.meta.env.VITE_NETLIFY_TEAM_ID,
  apiBaseUrl: 'https://api.netlify.com/api/v1',
  
  // Domain configuration
  domain: {
    base: 'wondrousdigital.com',
    protocol: 'https'
  },

  // Site naming conventions
  siteNaming: {
    // Template public sites: {niche}-{version}.wondrousdigital.com
    templatePublic: (niche: string, version: number = 1) => {
      const cleanNiche = niche.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return `${cleanNiche}-${version}`;
    },
    
    // Prospect staging sites: {business-name}.wondrousdigital.com
    prospectStaging: (businessName: string) => {
      return businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 63); // Netlify subdomain limit
    },
    
    // Customer sites: will use custom domains
    liveCustomer: (domain: string) => domain
  },

  // Deployment settings
  deployment: {
    branch: 'main',
    buildCommand: 'npm run build',
    publishDirectory: 'dist',
    framework: 'vite'
  },

  // Rate limiting
  rateLimit: {
    maxConcurrent: 3,
    delayBetweenRequests: 1000 // 1 second
  }
};

// Validate configuration
export const validateNetlifyConfig = (): boolean => {
  if (!netlifyConfig.apiToken) {
    console.error('Netlify API token is not configured. Please set VITE_NETLIFY_API_TOKEN in .env.local');
    return false;
  }
  
  if (!netlifyConfig.teamId) {
    console.warn('Netlify team ID is not configured. Sites will be created in personal account.');
  } else {
    console.log('Netlify configured for team:', netlifyConfig.teamId);
  }
  
  return true;
};

// Helper to generate full subdomain URL
export const getSubdomainUrl = (subdomain: string): string => {
  const { protocol, base } = netlifyConfig.domain;
  return `${protocol}://${subdomain}.${base}`;
};

// Reserved subdomains that cannot be used
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'app',
  'admin',
  'blog',
  'shop',
  'store',
  'mail',
  'email',
  'ftp',
  'ssh',
  'vpn',
  'ns1',
  'ns2',
  'mx',
  'test',
  'dev',
  'staging',
  'production',
  'demo'
];

// Check if subdomain is available
export const isSubdomainAvailable = (subdomain: string): boolean => {
  const cleaned = subdomain.toLowerCase();
  return !RESERVED_SUBDOMAINS.includes(cleaned);
};