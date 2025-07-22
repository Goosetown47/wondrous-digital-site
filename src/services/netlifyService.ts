import { netlifyConfig, validateNetlifyConfig, isSubdomainAvailable } from '../config/netlify';
import { netlifyRateLimiter } from './netlifyRateLimiter';

interface NetlifySite {
  id: string;
  name: string;
  url: string;
  ssl_url: string;
  admin_url: string;
  deploy_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  custom_domain?: string;
}

interface DeploymentStatus {
  id: string;
  state: 'building' | 'ready' | 'error' | 'canceled';
  error_message?: string;
  created_at: string;
  published_at?: string;
  deploy_ssl_url?: string;
}

class NetlifyService {
  private apiToken: string;
  private teamId?: string;
  private baseUrl: string;

  constructor() {
    if (!validateNetlifyConfig()) {
      throw new Error('Invalid Netlify configuration');
    }
    
    this.apiToken = netlifyConfig.apiToken!;
    this.teamId = netlifyConfig.teamId;
    this.baseUrl = netlifyConfig.apiBaseUrl;
  }

  // Common headers for all API requests
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Create a new site
  async createSite(siteName: string, customDomain?: string): Promise<NetlifySite> {
    if (!isSubdomainAvailable(siteName)) {
      throw new Error(`Subdomain "${siteName}" is reserved and cannot be used`);
    }

    const body: any = {
      name: siteName,
      custom_domain: customDomain,
      processing_settings: {
        skip: true // Skip processing for initial creation
      }
    };

    if (this.teamId) {
      body.account_slug = this.teamId;
    }

    return netlifyRateLimiter.executeRequest(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/sites`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create site');
        }

        return await response.json();
      } catch (error) {
        console.error('Error creating Netlify site:', error);
        throw error;
      }
    }, 1, 10); // Higher priority for site creation
  }

  // Get site details
  async getSite(siteId: string): Promise<NetlifySite> {
    return netlifyRateLimiter.executeRequest(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/sites/${siteId}`, {
          headers: this.getHeaders()
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to get site details');
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting Netlify site:', error);
        throw error;
      }
    });
  }

  // Update site settings
  async updateSite(siteId: string, updates: Partial<NetlifySite>): Promise<NetlifySite> {
    return netlifyRateLimiter.executeRequest(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/sites/${siteId}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update site');
        }

        return await response.json();
      } catch (error) {
        console.error('Error updating Netlify site:', error);
        throw error;
      }
    });
  }

  // Delete a site
  async deleteSite(siteId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sites/${siteId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete site');
      }
    } catch (error) {
      console.error('Error deleting Netlify site:', error);
      throw error;
    }
  }


  // Get deployment status
  async getDeploymentStatus(siteId: string, deployId: string): Promise<DeploymentStatus> {
    return netlifyRateLimiter.executeRequest(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/sites/${siteId}/deploys/${deployId}`, {
          headers: this.getHeaders()
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to get deployment status');
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting deployment status:', error);
        throw error;
      }
    });
  }

  // Check if a subdomain is already taken on a specific deployment domain
  async checkSubdomainAvailability(subdomain: string, deploymentDomain: string): Promise<boolean> {
    return netlifyRateLimiter.executeRequest(async () => {
      try {
        // Construct the full domain to check
        const fullDomain = `${subdomain}.${deploymentDomain}`;
        
        // Get all sites to check their custom domains and aliases
        const sites = await this.listSites();
        
        // Check if this domain is already in use
        for (const site of sites) {
          // Check if it's the primary custom domain
          if (site.custom_domain === fullDomain) {
            return false; // Domain is taken
          }
          
          // Check if it's in the domain aliases
          if (site.domain_aliases && site.domain_aliases.includes(fullDomain)) {
            return false; // Domain is taken as an alias
          }
        }
        
        return true; // Domain is available
      } catch (error) {
        // If we get an error, assume the subdomain might be taken
        console.error('Error checking subdomain availability:', error);
        return false;
      }
    });
  }

  // List all sites (useful for checking existing deployments)
  async listSites(): Promise<NetlifySite[]> {
    try {
      let url = `${this.baseUrl}/sites`;
      if (this.teamId) {
        url += `?account_slug=${this.teamId}`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to list sites');
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing Netlify sites:', error);
      throw error;
    }
  }
  
  // Deploy a site by uploading a ZIP file
  async deploySite(siteId: string, zipBlob: Blob): Promise<DeploymentStatus> {
    return netlifyRateLimiter.executeRequest(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/sites/${siteId}/deploys`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/zip'
          },
          body: zipBlob
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to deploy site');
        }

        return await response.json();
      } catch (error) {
        console.error('Error deploying to Netlify:', error);
        throw error;
      }
    }, 5, 5); // Deploy takes more API resources
  }
}

// Export singleton instance
export const netlifyService = new NetlifyService();

// Export types
export type { NetlifySite, DeploymentStatus };