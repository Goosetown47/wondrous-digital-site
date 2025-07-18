import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { createAccountSchema } from '../../schemas';
import { useToast } from '../../contexts/ToastContext';
import { useProject } from '../../contexts/ProjectContext';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  const { refreshData } = useProject();
  const [formData, setFormData] = useState({
    business_name: '',
    contact_email: '',
    domain: '',
    account_type: 'prospect' as 'prospect' | 'customer',
    notes: ''
  });

  // Reset form and errors when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        business_name: '',
        contact_email: '',
        domain: '',
        account_type: 'prospect',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DAY 4: Full Zod validation integration
    const zodResult = createAccountSchema.safeParse(formData);
    if (!zodResult.success) {
      const zodErrors = zodResult.error.format();
      const newErrors: Record<string, string> = {};
      
      // Map Zod errors to form fields
      if (zodErrors.business_name?._errors?.length > 0) {
        newErrors.business_name = zodErrors.business_name._errors[0];
      }
      
      if (zodErrors.contact_email?._errors?.length > 0) {
        newErrors.contact_email = zodErrors.contact_email._errors[0];
      }
      
      if (zodErrors.domain?._errors?.length > 0 && formData.domain) {
        newErrors.domain = zodErrors.domain._errors[0];
      }
      
      if (zodErrors.account_type?._errors?.length > 0) {
        newErrors.account_type = zodErrors.account_type._errors[0];
      }
      
      setErrors(newErrors);
      addToast('Please fix the validation errors', 'error');
      return;
    }
    
    // Validation passed - clear any previous errors
    setErrors({});
    
    setLoading(true);

    try {
      // Insert new customer account
      const { data, error } = await supabase
        .from('customers')
        .insert({
          business_name: formData.business_name,
          contact_email: formData.contact_email,
          domain: formData.domain || null,
          account_type: formData.account_type,
          notes: formData.notes || null,
          subscription_status: 'none',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Log the action
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.data.user.id,
            action_type: 'create',
            entity_type: 'customer',
            entity_id: data.id,
            new_data: {
              business_name: data.business_name,
              account_type: data.account_type
            }
          });
      }

      // Reset form and close modal
      setFormData({
        business_name: '',
        contact_email: '',
        domain: '',
        account_type: 'prospect',
        notes: ''
      });
      
      onSuccess();
      await refreshData();
      onClose();
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              aria-invalid={!!errors.business_name}
              aria-describedby={errors.business_name ? 'business_name-error' : undefined}
            />
            {errors.business_name && (
              <p id="business_name-error" className="mt-1 text-sm text-red-600">{errors.business_name}</p>
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
              aria-invalid={!!errors.contact_email}
              aria-describedby={errors.contact_email ? 'contact_email-error' : undefined}
            />
            {errors.contact_email && (
              <p id="contact_email-error" className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
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
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Start as Prospect for new leads, or Customer for existing clients
            </p>
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
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
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
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;