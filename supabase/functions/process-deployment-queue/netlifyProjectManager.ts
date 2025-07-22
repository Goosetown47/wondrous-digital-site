/**
 * NetlifyProjectManager - Manages one-to-one relationship between projects and Netlify sites
 * 
 * Key principles:
 * - Each project gets its own dedicated Netlify site
 * - No sharing of sites between projects
 * - Custom domains are set directly, not as aliases
 * - Complete isolation between projects
 */

import { RateLimiter } from './rateLimiter.ts'

interface NetlifySiteResponse {
  id: string;
  name: string;
  custom_domain?: string;
  domain_aliases?: string[];
  ssl_url?: string;
  url?: string;
  created_at: string;
  updated_at: string;
  default_domain?: string; // e.g., "project-123.netlify.app"
}

interface ProjectDeploymentResult {
  siteId: string;
  siteName: string;
  siteUrl: string;
  deploymentUrl: string;
  isNewSite: boolean;
  defaultDomain: string;
}

interface ProjectInfo {
  id: string;
  project_name: string;
  netlify_site_id?: string;
  netlify_site_name?: string;
  deployment_url?: string;
}

export class NetlifyProjectManager {
  private rateLimiter: RateLimiter;
  
  constructor(
    private supabase: any,
    private netlifyToken: string,
    private netlifyTeamId?: string,
    rateLimiter?: RateLimiter
  ) {
    this.rateLimiter = rateLimiter || new RateLimiter(500, 1);
  }

  /**
   * Generate a unique site name for a project
   * Format: project-{shortId}-{sanitizedName}
   */
  private generateSiteName(projectId: string, projectName: string): string {
    // Take first 8 chars of project ID
    const shortId = projectId.substring(0, 8);
    
    // Sanitize project name: lowercase, replace spaces/special chars with hyphens
    const sanitizedName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 20); // Limit length
    
    return `project-${shortId}-${sanitizedName}`;
  }

  /**
   * Validate deployment URL to prevent main site overwrites
   */
  private validateDeploymentUrl(url: string): void {
    if (!url) {
      throw new Error('Deployment URL is required');
    }

    // Remove protocol if present
    const cleanUrl = url.replace(/^https?:\/\//, '');
    
    // Prevent deploying to bare wondrousdigital.com
    if (cleanUrl === 'wondrousdigital.com' || cleanUrl === 'www.wondrousdigital.com') {
      throw new Error('Cannot deploy project to main marketing domain. Use a subdomain like client-1.wondrousdigital.com');
    }

    // Basic domain format validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(cleanUrl)) {
      throw new Error(`Invalid domain format: ${cleanUrl}`);
    }
  }

  /**
   * Get project information from database
   */
  private async getProjectInfo(projectId: string): Promise<ProjectInfo> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('id, project_name, netlify_site_id, netlify_site_name, deployment_url')
      .eq('id', projectId)
      .single();
    
    if (error || !data) {
      throw new Error(`Project not found: ${projectId}`);
    }
    
    return data;
  }

  /**
   * Update project with Netlify site information
   */
  private async updateProjectNetlifyInfo(
    projectId: string, 
    siteId: string, 
    siteName: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .update({
        netlify_site_id: siteId,
        netlify_site_name: siteName,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
    
    if (error) {
      throw new Error(`Failed to update project Netlify info: ${error.message}`);
    }
  }

  /**
   * Create a new Netlify site for a project
   */
  private async createNetlifySite(siteName: string): Promise<NetlifySiteResponse> {
    return this.rateLimiter.execute(async () => {
      console.log(`Creating new Netlify site: ${siteName}`);
      
      const body: any = {
        name: siteName,
        // Don't set custom_domain on creation - we'll update it separately
        processing_settings: {
          skip: true
        }
      };
      
      if (this.netlifyTeamId) {
        body.account_slug = this.netlifyTeamId;
      }

      const response = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create Netlify site';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || JSON.stringify(error);
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const site = await response.json();
      console.log(`Created Netlify site: ${site.id} - ${site.name} - ${site.default_domain}`);
      return site;
    });
  }

  /**
   * Update site custom domain
   */
  private async updateSiteCustomDomain(
    siteId: string, 
    customDomain: string
  ): Promise<void> {
    return this.rateLimiter.execute(async () => {
      console.log(`Setting custom domain ${customDomain} for site ${siteId}`);
      
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          custom_domain: customDomain
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update site custom domain';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || JSON.stringify(error);
          
          // Check for domain already in use error
          if (errorMessage.includes('already has a certificate') || 
              errorMessage.includes('already exists')) {
            throw new Error(`Domain ${customDomain} is already in use by another site`);
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes('already in use')) {
            throw e;
          }
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      console.log(`Successfully set custom domain ${customDomain}`);
    });
  }

  /**
   * Get Netlify site details
   */
  private async getNetlifySite(siteId: string): Promise<NetlifySiteResponse | null> {
    return this.rateLimiter.execute(async () => {
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get site details: ${response.statusText}`);
      }

      return response.json();
    });
  }

  /**
   * Main method: Prepare deployment for a project
   * Ensures each project has its own Netlify site
   */
  async prepareProjectDeployment(
    projectId: string,
    deploymentUrl: string
  ): Promise<ProjectDeploymentResult> {
    console.log(`Preparing deployment for project ${projectId} to ${deploymentUrl}`);
    
    // Validate deployment URL
    this.validateDeploymentUrl(deploymentUrl);
    
    // Get project information
    const project = await this.getProjectInfo(projectId);
    
    // Check if project already has a Netlify site
    if (project.netlify_site_id) {
      console.log(`Project already has Netlify site: ${project.netlify_site_id}`);
      
      // Verify the site still exists
      const existingSite = await this.getNetlifySite(project.netlify_site_id);
      if (!existingSite) {
        console.warn(`Netlify site ${project.netlify_site_id} no longer exists, creating new one`);
        project.netlify_site_id = null;
        project.netlify_site_name = null;
      } else {
        // Update custom domain if it changed
        const currentDomain = existingSite.custom_domain?.replace(/^https?:\/\//, '');
        const newDomain = deploymentUrl.replace(/^https?:\/\//, '');
        
        if (currentDomain !== newDomain) {
          console.log(`Updating custom domain from ${currentDomain} to ${newDomain}`);
          await this.updateSiteCustomDomain(existingSite.id, newDomain);
        }
        
        return {
          siteId: existingSite.id,
          siteName: existingSite.name,
          siteUrl: existingSite.ssl_url || existingSite.url || `https://${newDomain}`,
          deploymentUrl: `https://${newDomain}`,
          isNewSite: false,
          defaultDomain: existingSite.default_domain || existingSite.name + '.netlify.app'
        };
      }
    }
    
    // Create new Netlify site for this project
    const siteName = this.generateSiteName(project.id, project.project_name);
    const newSite = await this.createNetlifySite(siteName);
    
    // Update project with Netlify site info
    await this.updateProjectNetlifyInfo(project.id, newSite.id, newSite.name);
    
    // Set custom domain
    const cleanDomain = deploymentUrl.replace(/^https?:\/\//, '');
    try {
      await this.updateSiteCustomDomain(newSite.id, cleanDomain);
    } catch (error: any) {
      console.error(`Failed to set custom domain: ${error.message}`);
      // Continue anyway - site is created, domain can be set manually
    }
    
    return {
      siteId: newSite.id,
      siteName: newSite.name,
      siteUrl: newSite.ssl_url || newSite.url || `https://${cleanDomain}`,
      deploymentUrl: `https://${cleanDomain}`,
      isNewSite: true,
      defaultDomain: newSite.default_domain || newSite.name + '.netlify.app'
    };
  }

  /**
   * Delete a Netlify site (for cleanup)
   */
  async deleteNetlifySite(siteId: string): Promise<void> {
    return this.rateLimiter.execute(async () => {
      console.log(`Deleting Netlify site: ${siteId}`);
      
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete site: ${response.statusText}`);
      }
      
      console.log(`Successfully deleted Netlify site: ${siteId}`);
    });
  }
}