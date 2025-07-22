import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useProject } from '../../contexts/ProjectContext';

interface Customer {
  id: string;
  business_name: string;
  contact_email: string;
  domain: string | null;
  account_type: 'prospect' | 'customer' | 'inactive';
  notes: string | null;
  custom_domains: string[];
}

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer: Customer | null;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ isOpen, onClose, onSuccess, customer }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  const { refreshData } = useProject();
  const [formData, setFormData] = useState({
    business_name: '',
    contact_email: '',
    domain: '',
    account_type: 'prospect' as 'prospect' | 'customer' | 'inactive',
    notes: ''
  });
  const [customDomains, setCustomDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');

  // Initialize form with customer data when modal opens or customer changes
  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        business_name: customer.business_name || '',
        contact_email: customer.contact_email || '',
        domain: customer.domain || '',
        account_type: customer.account_type,
        notes: customer.notes || ''
      });
      setCustomDomains(customer.custom_domains || []);
      setNewDomain('');
      setErrors({});
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) return;
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }
    
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }
    
    if (formData.domain && !/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(formData.domain)) {
      newErrors.domain = 'Invalid domain format (e.g., example.com)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      // Update customer account
      const { error } = await supabase
        .from('customers')
        .update({
          business_name: formData.business_name.trim(),
          contact_email: formData.contact_email.trim(),
          domain: formData.domain.trim() || null,
          account_type: formData.account_type,
          notes: formData.notes.trim() || null,
          custom_domains: customDomains,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);

      if (error) throw error;

      // Log the action
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.data.user.id,
            action_type: 'update',
            entity_type: 'customer',
            entity_id: customer.id,
            old_data: {
              business_name: customer.business_name,
              account_type: customer.account_type,
              custom_domains: customer.custom_domains
            },
            new_data: {
              business_name: formData.business_name,
              account_type: formData.account_type,
              custom_domains: customDomains
            }
          });
      }

      addToast('Account updated successfully', 'success');
      await refreshData();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating account:', error);
      addToast('Failed to update account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateDomain = (domain: string): boolean => {
    return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain);
  };

  const handleAddDomain = () => {
    const domain = newDomain.trim().toLowerCase();
    
    if (!domain) {
      setErrors({ ...errors, newDomain: 'Domain cannot be empty' });
      return;
    }
    
    if (!validateDomain(domain)) {
      setErrors({ ...errors, newDomain: 'Invalid domain format (e.g., example.com)' });
      return;
    }
    
    if (customDomains.includes(domain)) {
      setErrors({ ...errors, newDomain: 'Domain already added' });
      return;
    }
    
    setCustomDomains([...customDomains, domain]);
    setNewDomain('');
    setErrors({ ...errors, newDomain: '' });
  };

  const handleRemoveDomain = (domain: string) => {
    setCustomDomains(customDomains.filter(d => d !== domain));
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.business_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Acme Corporation"
            />
            {errors.business_name && (
              <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.contact_email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="contact@example.com"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
            )}
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain <span className="text-sm text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.domain ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="example.com"
            />
            {errors.domain ? (
              <p className="mt-1 text-sm text-red-600">{errors.domain}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                The customer's existing domain (if they have one)
              </p>
            )}
          </div>

          {/* Custom Domains */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Domains <span className="text-sm text-gray-500">(optional)</span>
            </label>
            
            {/* Input for adding new domains */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())}
                className={`flex-1 px-3 py-2 border ${errors.newDomain ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="customerdomain.com"
              />
              <button
                type="button"
                onClick={handleAddDomain}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {errors.newDomain && (
              <p className="mt-1 text-sm text-red-600">{errors.newDomain}</p>
            )}
            
            {/* List of added domains */}
            {customDomains.length > 0 && (
              <div className="space-y-1">
                {customDomains.map((domain) => (
                  <div key={domain} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{domain}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-red-600 hover:text-red-700 focus:outline-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="mt-1 text-xs text-gray-500">
              Additional domains that can be used for project deployments
            </p>
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="prospect">Prospect</option>
              <option value="customer">Customer</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-sm text-gray-500">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional information about this account..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal;