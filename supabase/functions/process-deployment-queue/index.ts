import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { NetlifyProjectManager } from './netlifyProjectManager.ts'
import { DeploymentEngine } from './deploymentEngine.ts'
import { RateLimiter, ExponentialBackoff, Semaphore } from './rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize rate limiter and concurrency control
const rateLimiter = new RateLimiter(500, 1); // 500 calls per minute
const backoff = new ExponentialBackoff(1000, 30000, 2); // 1s base, 30s max, factor of 2
const deploymentSemaphore = new Semaphore(3); // Max 3 concurrent deployments

interface QueuedDeployment {
  id: string
  project_id: string
  customer_id: string | null
  status: 'queued' | 'processing' | 'completed' | 'failed'
  priority: number
  payload: {
    subdomain: string
    deployment_domain: string
    exportResult: any
    netlify_site_id?: string
  }
  attempt_count: number
  max_attempts: number
  error_message: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

interface ProcessingResult {
  processed: number
  succeeded: number
  failed: number
  errors: Array<{ deploymentId: string; error: string }>
  duration: number
}

// Helper function to log deployment events
async function logDeployment(
  supabase: any,
  deploymentId: string,
  projectId: string,
  level: 'info' | 'warning' | 'error',
  message: string
) {
  try {
    await supabase
      .from('deployment_logs')
      .insert({
        deployment_id: deploymentId,
        project_id: projectId,
        log_level: level,
        message,
      })
  } catch (error) {
    console.error('Failed to log deployment message:', error)
  }
}


// Helper function to create HTML template
function createHtmlTemplate(pageContent: string, siteStyles: any, title: string = 'Wondrous Digital') {
  const cssVariables = Object.entries(siteStyles || {})
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n    ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      ${cssVariables}
    }
    /* Base styles would go here */
    body {
      margin: 0;
      font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      color: var(--color-text, #333);
      background-color: var(--color-background, #fff);
    }
  </style>
</head>
<body>
  ${pageContent}
</body>
</html>`
}

// Helper function to generate ZIP file content
async function generateDeploymentZip(exportResult: any): Promise<Uint8Array> {
  console.log('Generating deployment ZIP:', {
    pageCount: exportResult.pages?.length || 0,
    assetCount: exportResult.assets?.length || 0,
    hasManifest: !!exportResult.manifest
  })
  
  // Import JSZip for Deno
  const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1')
  
  const zip = new JSZip()
  const fileList: string[] = []
  
  // Add all pages
  if (exportResult.pages && exportResult.pages.length > 0) {
    for (const page of exportResult.pages) {
      const filename = page.is_homepage ? 'index.html' : `${page.slug}.html`
      zip.file(filename, page.content)
      fileList.push(`${filename} (${page.content.length} bytes)`)
    }
  } else {
    console.warn('No pages in export result!')
  }
  
  // Add CSS files
  const cssAssets = exportResult.assets?.filter((a: any) => a.type === 'css') || []
  for (const asset of cssAssets) {
    zip.file(asset.path, asset.content)
    fileList.push(`${asset.path} (CSS, ${asset.content.length} bytes)`)
  }
  
  // Add other assets
  const otherAssets = exportResult.assets?.filter((a: any) => a.type !== 'css') || []
  for (const asset of otherAssets) {
    // For binary assets, we'd need to handle them differently
    // For now, just add text content
    if (typeof asset.content === 'string') {
      zip.file(asset.path, asset.content)
      fileList.push(`${asset.path} (${asset.type}, ${asset.content.length} bytes)`)
    }
  }
  
  // Add manifest
  if (exportResult.manifest) {
    const manifestContent = JSON.stringify(exportResult.manifest, null, 2)
    zip.file('manifest.json', manifestContent)
    fileList.push(`manifest.json (${manifestContent.length} bytes)`)
  }
  
  // Add _redirects file for Netlify
  const redirects = exportResult.pages
    ?.filter((p: any) => !p.is_homepage)
    .map((p: any) => `/${p.slug} /${p.slug}.html 200`)
    .join('\n') || ''
  
  if (redirects) {
    zip.file('_redirects', redirects)
    fileList.push(`_redirects (${redirects.length} bytes)`)
  }
  
  console.log('ZIP contents:', fileList)
  
  // Generate ZIP as Uint8Array
  const zipContent = await zip.generateAsync({ 
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })
  
  console.log(`Generated ZIP file: ${zipContent.length} bytes`)
  
  return zipContent
}


async function updateNetlifySite(
  token: string,
  siteId: string,
  updates: any
): Promise<any> {
  return rateLimiter.execute(async () => {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update Netlify site')
    }

    return response.json()
  })
}

async function deployToNetlify(
  token: string,
  siteId: string,
  zipContent: Uint8Array
): Promise<any> {
  return rateLimiter.execute(async () => {
    console.log(`Deploying to Netlify site ${siteId}, ZIP size: ${zipContent.length} bytes`)
    
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/zip'
      },
      body: zipContent
    })

    const responseText = await response.text()
    console.log(`Netlify deploy response: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      console.error('Netlify deployment failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      })
      
      let errorMessage = `Netlify API error ${response.status}: ${response.statusText}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Response wasn't JSON
        errorMessage += ` - ${responseText.substring(0, 200)}`
      }
      
      throw new Error(errorMessage)
    }

    try {
      return JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse Netlify response as JSON:', responseText)
      throw new Error('Invalid response from Netlify API')
    }
  })
}

async function getDeploymentStatus(
  token: string,
  siteId: string,
  deployId: string
): Promise<any> {
  return rateLimiter.execute(async () => {
    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/deploys/${deployId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get deployment status')
    }

    return response.json()
  })
}

// Main deployment processing function
async function processDeployment(
  supabase: any,
  deployment: QueuedDeployment,
  netlifyToken: string,
  netlifyTeamId?: string
): Promise<void> {
  const startTime = Date.now()
  
  try {
    await logDeployment(
      supabase,
      deployment.id,
      deployment.project_id,
      'info',
      'Starting deployment process'
    )

    const payload = deployment.payload
    const projectId = deployment.project_id

    // Step 1: Prepare project-specific Netlify site
    const projectManager = new NetlifyProjectManager(supabase, netlifyToken, netlifyTeamId, rateLimiter)
    
    await logDeployment(
      supabase,
      deployment.id,
      projectId,
      'info',
      'Preparing project-specific Netlify deployment'
    )
    
    // Construct deployment URL from subdomain and domain
    const deploymentUrl = payload.subdomain 
      ? `${payload.subdomain}.${payload.deployment_domain}`
      : payload.deployment_domain;
    
    let siteId: string
    let siteUrl: string
    let siteName: string
    
    try {
      const deploymentResult = await projectManager.prepareProjectDeployment(
        projectId,
        deploymentUrl
      )
      
      siteId = deploymentResult.siteId
      siteUrl = deploymentResult.deploymentUrl
      siteName = deploymentResult.siteName
      
      await logDeployment(
        supabase,
        deployment.id,
        projectId,
        'info',
        deploymentResult.isNewSite 
          ? `Created new Netlify site for project: ${siteName} (${siteId}) - ${siteUrl}`
          : `Using existing project site: ${siteName} (${siteId}) - ${siteUrl}`
      )
      
      // Update project deployment URL
      await supabase
        .from('projects')
        .update({
          deployment_url: deploymentUrl.startsWith('http') ? deploymentUrl : `https://${deploymentUrl}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
    } catch (error: any) {
      await logDeployment(
        supabase,
        deployment.id,
        projectId,
        'error',
        `Failed to prepare project Netlify site: ${error.message || error}`
      )
      throw error
    }

    // Step 2: Generate static site if not provided
    let exportResult = payload.exportResult
    
    // If no export result provided, generate it using deployment engine
    if (!exportResult || !exportResult.pages || exportResult.pages.length === 0) {
      await logDeployment(
        supabase,
        deployment.id,
        projectId,
        'info',
        'Generating static site content'
      )
      
      try {
        const deploymentEngine = new DeploymentEngine(supabase)
        exportResult = await deploymentEngine.generateStaticSite(projectId)
        
        console.log('Generated export result:', {
          pageCount: exportResult.pages?.length || 0,
          assetCount: exportResult.assets?.length || 0,
          firstPageSize: exportResult.pages?.[0]?.content?.length || 0
        })
        
        await logDeployment(
          supabase,
          deployment.id,
          projectId,
          'info',
          `Generated ${exportResult.pages.length} pages and ${exportResult.assets.length} assets`
        )
      } catch (error: any) {
        await logDeployment(
          supabase,
          deployment.id,
          projectId,
          'error',
          `Failed to generate static site: ${error.message || error}`
        )
        throw error
      }
    } else {
      console.log('Using provided export result:', {
        pageCount: exportResult.pages?.length || 0,
        assetCount: exportResult.assets?.length || 0
      })
    }
    
    // Step 3: Generate deployment ZIP
    await logDeployment(
      supabase,
      deployment.id,
      projectId,
      'info',
      'Packaging files for deployment'
    )
    
    let deploymentZip: Uint8Array
    try {
      deploymentZip = await generateDeploymentZip(exportResult)
      
      if (!deploymentZip || deploymentZip.length === 0) {
        throw new Error('Generated ZIP file is empty')
      }
      
      await logDeployment(
        supabase,
        deployment.id,
        projectId,
        'info',
        `Generated deployment ZIP: ${deploymentZip.length} bytes`
      )
    } catch (error: any) {
      await logDeployment(
        supabase,
        deployment.id,
        projectId,
        'error',
        `Failed to generate deployment ZIP: ${error.message || error}`
      )
      throw new Error(`ZIP generation failed: ${error.message || error}`)
    }

    // Step 3: Deploy to Netlify
    await logDeployment(
      supabase,
      deployment.id,
      projectId,
      'info',
      'Uploading files to Netlify'
    )
    const netlifyDeployment = await deployToNetlify(netlifyToken, siteId, deploymentZip)

    // Step 4: Monitor deployment status
    let deployStatus = netlifyDeployment
    let attempts = 0
    const maxStatusChecks = 90 // 90 * 2 seconds = 3 minutes max
    
    // Netlify deployment states that indicate processing
    const inProgressStates = ['uploaded', 'uploading', 'building', 'processing', 'preparing'];
    const finalStates = ['ready', 'error', 'failed'];
    
    console.log('Initial deployment state:', deployStatus.state)

    while (inProgressStates.includes(deployStatus.state) && attempts < maxStatusChecks) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      deployStatus = await getDeploymentStatus(netlifyToken, siteId, netlifyDeployment.id)
      
      const elapsedTime = attempts * 2;
      await logDeployment(
        supabase,
        deployment.id,
        projectId,
        'info',
        `Netlify deployment status: ${deployStatus.state} (${elapsedTime}s elapsed)`
      )
      
      // Log state transitions
      if (attempts > 0 && deployStatus.state !== deployStatus.state) {
        console.log(`Deployment state changed: ${deployStatus.state} → ${deployStatus.state}`)
      }
      
      attempts++
    }

    if (deployStatus.state !== 'ready') {
      console.error('Deployment not ready:', {
        state: deployStatus.state,
        error_message: deployStatus.error_message,
        summary: deployStatus.summary,
        deploy_ssl_url: deployStatus.deploy_ssl_url,
        id: deployStatus.id
      })
      
      let errorDetails = deployStatus.error_message || deployStatus.summary?.messages?.join(', ') || 'Unknown deployment error'
      if (deployStatus.state === 'error') {
        errorDetails = `Build error: ${errorDetails}`
      } else if (attempts >= maxStatusChecks) {
        errorDetails = `Deployment timeout - still in ${deployStatus.state} state after ${attempts * 2} seconds`
      }
      
      throw new Error(`Netlify deployment failed: ${errorDetails}`)
    }
    
    // Deployment successful - log the URLs
    console.log('Deployment successful:', {
      id: deployStatus.id,
      state: deployStatus.state,
      ssl_url: deployStatus.ssl_url,
      deploy_ssl_url: deployStatus.deploy_ssl_url,
      url: deployStatus.url,
      admin_url: deployStatus.admin_url
    })
    
    await logDeployment(
      supabase,
      deployment.id,
      projectId,
      'info',
      `Deployment ready! URL: ${deployStatus.ssl_url || deployStatus.deploy_ssl_url}`
    )

    // Step 5: Update project in database
    const { error: updateProjectError } = await supabase
      .from('projects')
      .update({
        subdomain: payload.subdomain || null,
        deployment_domain: payload.deployment_domain,
        netlify_site_id: siteId,
        deployment_status: 'deployed',
        deployment_url: siteUrl,
        last_deployed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateProjectError) {
      throw updateProjectError
    }

    // Step 6: Mark deployment as completed
    const finalUrl = deployStatus.ssl_url || deployStatus.deploy_ssl_url || siteUrl;
    const { error: updateDeploymentError } = await supabase
      .from('deployment_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        live_url: finalUrl,
        payload: {
          ...payload,
          deploymentResult: {
            netlify_site_id: siteId,
            deployment_url: finalUrl,
            deployment_id: netlifyDeployment.id,
            deploy_id: deployStatus.id,
            ssl_url: deployStatus.ssl_url,
            admin_url: deployStatus.admin_url
          }
        }
      })
      .eq('id', deployment.id)

    if (updateDeploymentError) {
      throw updateDeploymentError
    }

    const duration = Date.now() - startTime
    await logDeployment(
      supabase,
      deployment.id,
      projectId,
      'info',
      `Deployment completed successfully in ${duration}ms: ${siteUrl}`
    )

  } catch (error: any) {
    console.error('Deployment failed:', error)
    
    // Log error
    await logDeployment(
      supabase,
      deployment.id,
      deployment.project_id,
      'error',
      error.message || 'Deployment failed'
    )

    // Update deployment status
    const newAttemptCount = deployment.attempt_count + 1
    
    if (newAttemptCount < deployment.max_attempts) {
      // Calculate exponential backoff delay
      const retryDelay = backoff.getDelay(deployment.attempt_count)
      const retryAt = new Date(Date.now() + retryDelay).toISOString()
      
      // Retry - put back in queue with delay
      await supabase
        .from('deployment_queue')
        .update({
          status: 'queued',
          attempt_count: newAttemptCount,
          error_message: error.message,
          // Store retry time for delayed processing
          created_at: retryAt
        })
        .eq('id', deployment.id)
        
      await logDeployment(
        supabase,
        deployment.id,
        deployment.project_id,
        'info',
        `Scheduled retry ${newAttemptCount}/${deployment.max_attempts} in ${retryDelay}ms`
      )
    } else {
      // Max attempts reached - mark as failed
      await supabase
        .from('deployment_queue')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', deployment.id)
    }
    
    throw error
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  const result: ProcessingResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
    duration: 0
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const netlifyToken = Deno.env.get('NETLIFY_ACCESS_TOKEN')
    const netlifyTeamId = Deno.env.get('NETLIFY_TEAM_ID')

    if (!supabaseUrl || !supabaseServiceKey || !netlifyToken) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    })

    // Fetch up to 3 pending deployments that are ready to process
    const now = new Date().toISOString()
    const { data: deployments, error: fetchError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('created_at', now) // Only get deployments that are ready (respects retry delay)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(3)

    if (fetchError) {
      throw fetchError
    }

    if (!deployments || deployments.length === 0) {
      result.duration = Date.now() - startTime
      return new Response(
        JSON.stringify({
          ...result,
          message: 'No deployments to process'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Mark deployments as processing
    const deploymentIds = deployments.map((d: QueuedDeployment) => d.id)
    const { error: updateError } = await supabase
      .from('deployment_queue')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .in('id', deploymentIds)

    if (updateError) {
      throw updateError
    }

    // Process each deployment with semaphore control
    const processingPromises = deployments.map(async (deployment: QueuedDeployment) => {
      return deploymentSemaphore.execute(async () => {
        try {
          await processDeployment(supabase, deployment, netlifyToken, netlifyTeamId)
          result.succeeded++
        } catch (error: any) {
          result.failed++
          result.errors.push({
            deploymentId: deployment.id,
            error: error.message || 'Unknown error'
          })
        }
      })
    })

    // Wait for all deployments to complete
    await Promise.allSettled(processingPromises)

    result.processed = deployments.length
    result.duration = Date.now() - startTime

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Edge function error:', error)
    result.duration = Date.now() - startTime
    
    return new Response(
      JSON.stringify({
        ...result,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})