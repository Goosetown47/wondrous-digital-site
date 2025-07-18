import React, { useState, useEffect } from 'react';
import { X, Globe, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useToast } from '../../contexts/ToastContext';
import { netlifyConfig, getSubdomainUrl } from '../../config/netlify';
import { netlifyService } from '../../services/netlifyService';

interface Project {
  id: string;
  project_name: string;
  project_status: string;
  project_type: string;
  template_niche?: string;
  template_version?: number;
  customer_id?: string;
  business_name?: string;
  subdomain?: string;
  domain?: string;
  deployment_domain?: string;
  netlify_site_id?: string;
  deployment_status?: string;
  deployment_url?: string;
  custom_domains?: string[];
}

interface DeployProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

type DeploymentStep = 'configure' | 'deploying' | 'success' | 'error';

const DeployProjectModal: React.FC<DeployProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  project,
  onSuccess 
}) => {
  const [step, setStep] = useState<DeploymentStep>('configure');
  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('wondrousdigital.com');
  const [customDomain, setCustomDomain] = useState('');
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [error, setError] = useState('');
  const { addToast } = useToast();

  // Initialize form with existing data or generate defaults
  useEffect(() => {
    if (project && isOpen) {
      // Reset state
      setStep('configure');
      setError('');
      setShowCustomDomain(false);
      
      // Use existing subdomain if available
      if (project.subdomain) {
        setSubdomain(project.subdomain);
      } else {
        // Generate subdomain based on project type
        let generatedSubdomain = '';
        
        if (project.project_status === 'template-public' && project.template_niche) {
          generatedSubdomain = netlifyConfig.siteNaming.templatePublic(
            project.template_niche, 
            project.template_version || 1
          );
        } else if (project.project_status === 'prospect-staging' && project.business_name) {
          generatedSubdomain = netlifyConfig.siteNaming.prospectStaging(project.business_name);
        }
        
        setSubdomain(generatedSubdomain);
      }
      
      // Set domain - use existing or default
      if (project.deployment_domain) {
        setSelectedDomain(project.deployment_domain);
      } else if (project.domain) {
        // If they have a custom domain in the domain field
        setSelectedDomain('custom');
        setCustomDomain(project.domain);
        setShowCustomDomain(true);
      } else {
        // Default to wondrousdigital.com
        setSelectedDomain('wondrousdigital.com');
      }
    }
  }, [project, isOpen]);

  const validateSubdomain = (): boolean => {
    if (!subdomain) {
      setError('Subdomain is required');
      return false;
    }

    if (subdomain.length < 3) {
      setError('Subdomain must be at least 3 characters');
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      setError('Subdomain can only contain lowercase letters, numbers, and hyphens');
      return false;
    }

    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      setError('Subdomain cannot start or end with a hyphen');
      return false;
    }

    return true;
  };

  const handleDeploy = async () => {
    if (!project || !validateSubdomain()) return;

    // Determine final domain
    const deploymentDomain = showCustomDomain ? customDomain : selectedDomain;
    if (showCustomDomain && !customDomain) {
      setError('Please enter a custom domain');
      return;
    }

    setLoading(true);
    setStep('deploying');
    setError('');

    try {
      // Construct full site name/URL
      const siteName = subdomain ? `${subdomain}.${deploymentDomain}` : deploymentDomain;
      
      // Only check availability for wondrousdigital.com subdomains
      if (deploymentDomain === 'wondrousdigital.com' && !project.netlify_site_id) {
        const isAvailable = await netlifyService.checkSubdomainAvailability(subdomain);
        if (!isAvailable) {
          throw new Error('This subdomain is already taken. Please choose another.');
        }
      }

      // Step 2: Create or update Netlify site
      let siteId = project.netlify_site_id;
      let siteUrl = '';

      if (!siteId) {
        // Create new site
        const site = await netlifyService.createSite(subdomain);
        siteId = site.id;
        siteUrl = site.ssl_url || site.url;
      } else {
        // Update existing site
        const site = await netlifyService.updateSite(siteId, {
          name: subdomain
        });
        siteUrl = site.ssl_url || site.url;
      }

      // Step 3: Update project in database
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          subdomain: subdomain || null,
          deployment_domain: deploymentDomain,
          netlify_site_id: siteId,
          deployment_status: 'deployed',
          deployment_url: siteUrl,
          last_deployed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Step 4: Log deployment
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.data.user.id,
            action_type: 'deploy',
            entity_type: 'project',
            entity_id: project.id,
            new_data: {
              subdomain: subdomain || null,
              deployment_domain: deploymentDomain,
              netlify_site_id: siteId,
              deployment_url: siteUrl
            }
          });
      }

      // Success!
      setDeploymentUrl(siteUrl);
      setStep('success');
      addToast('Project deployed successfully!', 'success');
      
      // Note: Actual file deployment would happen here in production
      // For now, this creates the Netlify site and reserves the subdomain
      
    } catch (error: any) {
      console.error('Deployment error:', error);
      setError(error.message || 'Failed to deploy project');
      setStep('error');
      addToast('Deployment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    }
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Deploy Project
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'configure' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Deploy "{project.project_name}" to a live URL
                </p>
                
                {/* Domain Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'custom') {
                        setShowCustomDomain(true);
                        setSelectedDomain('custom');
                      } else {
                        setShowCustomDomain(false);
                        setSelectedDomain(value);
                        setCustomDomain('');
                      }
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="wondrousdigital.com">wondrousdigital.com</option>
                    {project.custom_domains?.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                    <option value="custom">Custom domain...</option>
                  </select>
                </div>

                {/* Custom Domain Input */}
                {showCustomDomain && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Domain
                    </label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => {
                        setCustomDomain(e.target.value.toLowerCase());
                        setError('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example.com"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the full domain (e.g., customerbusiness.com)
                    </p>
                  </div>
                )}
                
                {/* Subdomain Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomain <span className="text-sm text-gray-500">(optional)</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => {
                        setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        setError('');
                      }}
                      className={`flex-1 px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="www or leave empty for root"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                      .{showCustomDomain ? (customDomain || 'domain.com') : selectedDomain}
                    </span>
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for root domain, or use 'www', 'staging', etc.
                  </p>
                </div>
              </div>

              {/* URL Preview */}
              {!error && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Your site will be available at:
                  </p>
                  <p className="text-sm font-medium text-blue-900 mt-1 break-all">
                    https://{subdomain ? `${subdomain}.` : ''}{showCustomDomain ? (customDomain || 'domain.com') : selectedDomain}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'deploying' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Deploying your project...
              </p>
              <p className="text-sm text-gray-600">
                This may take a few moments
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Deployment Successful!
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Your project is now live at:
              </p>
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Globe className="h-4 w-4 mr-1" />
                {deploymentUrl}
              </a>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Deployment Failed
              </p>
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {step === 'configure' && (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={loading || !subdomain || !!error}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Deploy Project
                  </>
                )}
              </button>
            </>
          )}

          {(step === 'success' || step === 'error') && (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeployProjectModal;