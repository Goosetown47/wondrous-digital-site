import { NetlifyAPI } from 'netlify';
import { env } from '@/env.mjs';

const netlify = new NetlifyAPI(env.NETLIFY_AUTH_TOKEN);

interface DeployOptions {
  siteName: string;
  customDomain?: string;
  html: string;
}

export async function deployToNetlify({ siteName, customDomain, html }: DeployOptions) {
  try {
    // Check if site already exists
    let site;
    try {
      const sites = await netlify.listSites();
      site = sites.find((s: any) => s.name === siteName);
    } catch (error) {
      console.log('Error listing sites:', error);
    }

    // Create site if it doesn't exist
    if (!site) {
      site = await netlify.createSite({
        body: {
          name: siteName,
          custom_domain: customDomain,
        },
      });
      console.log('Created new site:', site.id);
    }

    // Create deployment
    const deploy = await netlify.createSiteDeploy({
      site_id: site.id,
      body: {
        files: {
          '/index.html': html,
        },
      },
    });

    // Upload the file
    await netlify.uploadDeployFile({
      deploy_id: deploy.id,
      path: '/index.html',
      body: Buffer.from(html),
    });

    // Wait for deploy to be ready
    let deployStatus = deploy;
    while (deployStatus.state !== 'ready' && deployStatus.state !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      deployStatus = await netlify.getSiteDeploy({
        site_id: site.id,
        deploy_id: deploy.id,
      });
    }

    if (deployStatus.state === 'error') {
      throw new Error('Deployment failed');
    }

    // Return the URLs
    return {
      url: deployStatus.deploy_ssl_url || deployStatus.deploy_url,
      customDomain: customDomain ? `https://${customDomain}` : undefined,
      siteId: site.id,
      deployId: deploy.id,
    };
  } catch (error) {
    console.error('Netlify deployment error:', error);
    throw error;
  }
}