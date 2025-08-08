export interface DNSProvider {
  name: string;
  instructions: {
    a_record: {
      location: string[];
      fields: {
        type: string;
        name: string;
        value: string;
        ttl: string;
      };
    };
    txt_record?: {
      location: string[];
      fields: {
        type: string;
        name: string;
        value: string;
        ttl?: string;
      };
    };
    cname_record?: {
      location: string[];
      fields: {
        type: string;
        name: string;
        value: string;
        ttl?: string;
      };
    };
  };
}

export const DNS_PROVIDERS: Record<string, DNSProvider> = {
  godaddy: {
    name: 'GoDaddy',
    instructions: {
      a_record: {
        location: [
          'Log in to your GoDaddy account',
          'Go to My Products → Domains',
          'Click DNS next to your domain',
          'Click Add in the Records section'
        ],
        fields: {
          type: 'A',
          name: '@',
          value: '216.198.79.1',
          ttl: '600 seconds (or 1/2 hour)'
        }
      },
      txt_record: {
        location: [
          'In the same DNS management page',
          'Click Add for a new record'
        ],
        fields: {
          type: 'TXT',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: '600 seconds'
        }
      }
    }
  },
  namecheap: {
    name: 'Namecheap',
    instructions: {
      a_record: {
        location: [
          'Sign in to your Namecheap account',
          'Go to Domain List',
          'Click Manage next to your domain',
          'Select Advanced DNS tab'
        ],
        fields: {
          type: 'A Record',
          name: '@',
          value: '216.198.79.1',
          ttl: 'Automatic'
        }
      },
      txt_record: {
        location: [
          'In the Advanced DNS tab',
          'Click Add New Record'
        ],
        fields: {
          type: 'TXT Record',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: 'Automatic'
        }
      }
    }
  },
  cloudflare: {
    name: 'Cloudflare',
    instructions: {
      a_record: {
        location: [
          'Log in to Cloudflare dashboard',
          'Select your domain',
          'Go to DNS → Records',
          'Click Add record'
        ],
        fields: {
          type: 'A',
          name: '@',
          value: '216.198.79.1',
          ttl: 'Auto'
        }
      },
      txt_record: {
        location: [
          'In the DNS Records section',
          'Click Add record'
        ],
        fields: {
          type: 'TXT',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: 'Auto'
        }
      }
    }
  },
  google: {
    name: 'Google Domains',
    instructions: {
      a_record: {
        location: [
          'Sign in to Google Domains',
          'Click your domain',
          'Select DNS from the left menu',
          'Under Custom records, click Manage custom records'
        ],
        fields: {
          type: 'A',
          name: '@',
          value: '216.198.79.1',
          ttl: '1 hour'
        }
      },
      txt_record: {
        location: [
          'In the Custom records section',
          'Add another record'
        ],
        fields: {
          type: 'TXT',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: '1 hour'
        }
      }
    }
  },
  namecom: {
    name: 'Name.com',
    instructions: {
      a_record: {
        location: [
          'Log in to Name.com',
          'Click My Domains',
          'Select your domain',
          'Click DNS Records'
        ],
        fields: {
          type: 'A',
          name: 'Leave blank for root',
          value: '216.198.79.1',
          ttl: '300'
        }
      },
      txt_record: {
        location: [
          'In the DNS Records page',
          'Click Add Record'
        ],
        fields: {
          type: 'TXT',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: '300'
        }
      }
    }
  },
  route53: {
    name: 'AWS Route 53',
    instructions: {
      a_record: {
        location: [
          'Sign in to AWS Console',
          'Go to Route 53',
          'Click Hosted zones',
          'Select your domain',
          'Click Create record'
        ],
        fields: {
          type: 'A',
          name: 'Leave blank for root',
          value: '216.198.79.1',
          ttl: '300'
        }
      },
      txt_record: {
        location: [
          'In the hosted zone',
          'Click Create record'
        ],
        fields: {
          type: 'TXT',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: '300'
        }
      }
    }
  },
  bluehost: {
    name: 'Bluehost',
    instructions: {
      a_record: {
        location: [
          'Log in to your Bluehost account',
          'Go to Domains → My Domains',
          'Click Manage next to your domain',
          'Select DNS tab'
        ],
        fields: {
          type: 'A',
          name: '@',
          value: '216.198.79.1',
          ttl: '4 hours'
        }
      },
      txt_record: {
        location: [
          'In the DNS management section',
          'Click Add Record'
        ],
        fields: {
          type: 'TXT',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: '4 hours'
        }
      }
    }
  },
  generic: {
    name: 'Other DNS Provider',
    instructions: {
      a_record: {
        location: [
          'Log in to your DNS provider',
          'Find DNS management or DNS settings',
          'Look for "Add Record" or "Create Record"'
        ],
        fields: {
          type: 'A',
          name: '@ or root or blank',
          value: '216.198.79.1',
          ttl: '600 or lowest available'
        }
      },
      txt_record: {
        location: [
          'In your DNS management',
          'Add another record'
        ],
        fields: {
          type: 'TXT',
          name: '_vercel',
          value: 'Verification value from below',
          ttl: '600 or lowest available'
        }
      }
    }
  }
};

export function getProviderInstructions(
  provider: string, 
  recordType: 'a_record' | 'txt_record' | 'cname_record'
) {
  const p = DNS_PROVIDERS[provider];
  if (!p) return DNS_PROVIDERS.generic.instructions[recordType];
  return p.instructions[recordType];
}