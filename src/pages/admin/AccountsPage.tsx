import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Users, UserPlus, Search, Filter, CheckCircle, XCircle, Eye, Edit, Trash2, ArrowRight } from 'lucide-react';
import CreateAccountModal from '../../components/admin/CreateAccountModal';
import StatusDropdown from '../../components/admin/StatusDropdown';
import ActionButton from '../../components/admin/ActionButton';
import { useToast } from '../../contexts/ToastContext';
import BulkActionsDropdown, { BulkAction } from '../../components/admin/BulkActionsDropdown';
import BulkOperationModal from '../../components/admin/BulkOperationModal';

interface Customer {
  id: string;
  business_name: string;
  contact_email: string;
  domain: string | null;
  account_type: 'prospect' | 'customer' | 'inactive';
  subscription_status: 'active' | 'paused' | 'cancelled' | 'none';
  converted_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  project_count?: number;
}

type TabType = 'prospects' | 'customers' | 'inactive';

const AccountsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('prospects');
  const [accounts, setAccounts] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tabCounts, setTabCounts] = useState<Record<TabType, number>>({
    prospects: 0,
    customers: 0,
    inactive: 0
  });
  const [bulkOperationModal, setBulkOperationModal] = useState<{
    isOpen: boolean;
    operation: BulkAction | null;
  }>({ isOpen: false, operation: null });
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const { addToast } = useToast();

  // Fetch tab counts on mount
  useEffect(() => {
    fetchTabCounts();
  }, []);

  // Fetch accounts based on active tab
  useEffect(() => {
    fetchAccounts();
  }, [activeTab]);

  const fetchTabCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('account_type');

      if (error) throw error;

      const counts = {
        prospects: 0,
        customers: 0,
        inactive: 0
      };

      data?.forEach(customer => {
        if (customer.account_type === 'prospect') counts.prospects++;
        else if (customer.account_type === 'customer') counts.customers++;
        else if (customer.account_type === 'inactive') counts.inactive++;
      });

      setTabCounts(counts);
    } catch (error) {
      console.error('Error fetching tab counts:', error);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Map tab to account_type
      const accountTypeMap: Record<TabType, string> = {
        prospects: 'prospect',
        customers: 'customer',
        inactive: 'inactive'
      };

      // Fetch customers with project count
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          projects:projects(count)
        `)
        .eq('account_type', accountTypeMap[activeTab])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include project count
      const transformedData = (data || []).map(customer => ({
        ...customer,
        project_count: customer.projects?.[0]?.count || 0
      }));

      setAccounts(transformedData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account =>
    account.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.domain && account.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedAccounts.size === filteredAccounts.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(filteredAccounts.map(a => a.id)));
    }
  };

  const handleSelectAccount = (accountId: string) => {
    const newSelection = new Set(selectedAccounts);
    if (newSelection.has(accountId)) {
      newSelection.delete(accountId);
    } else {
      newSelection.add(accountId);
    }
    setSelectedAccounts(newSelection);
  };

  // Handle account status transitions
  const handleStatusChange = async (accountId: string, newType: 'prospect' | 'customer' | 'inactive') => {
    try {
      const updateData: { account_type: Customer['account_type']; converted_at?: string } = { account_type: newType };
      
      // Set converted_at timestamp when converting to customer
      if (newType === 'customer') {
        updateData.converted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', accountId);

      if (error) throw error;
      
      // Show success message
      const accountName = accounts.find(a => a.id === accountId)?.business_name || 'Account';
      const tabMap: Record<typeof newType, string> = {
        'prospect': 'Prospects',
        'customer': 'Customers',
        'inactive': 'Inactive'
      };
      const statusMap: Record<typeof newType, string> = {
        'prospect': 'Prospect',
        'customer': 'Customer',
        'inactive': 'Inactive'
      };
      
      addToast(
        `${accountName} has been set to ${statusMap[newType]} in Supabase and is now in the ${tabMap[newType]} tab`, 
        'success'
      );
      
      // Refresh the list and counts
      fetchAccounts();
      fetchTabCounts();
    } catch (error) {
      console.error('Error updating account status:', error);
      addToast(
        'Failed to update account status: ' + (error as Error).message, 
        'error'
      );
    }
  };

  // Handle bulk action selection
  const handleBulkAction = (action: BulkAction) => {
    setBulkOperationModal({ isOpen: true, operation: action });
  };

  // Get selected accounts data
  const getSelectedAccountsData = () => {
    return accounts.filter(a => selectedAccounts.has(a.id));
  };

  // Determine allowed bulk actions based on selected accounts
  const getAllowedBulkActions = () => {
    const selectedAccountsData = getSelectedAccountsData();
    
    return {
      changeStatus: selectedAccountsData.length > 0,
      archive: false, // Accounts don't have archive status, they use 'inactive'
      delete: selectedAccountsData.every(a => a.account_type === 'inactive')
    };
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newType: Customer['account_type']) => {
    setIsProcessingBulk(true);
    try {
      const selectedAccountsData = getSelectedAccountsData();
      const accountIds = selectedAccountsData.map(a => a.id);
      
      // Prepare update data
      const updateData: { account_type: Customer['account_type']; converted_at?: string } = { account_type: newType };
      
      // Set converted_at timestamp when converting to customer
      if (newType === 'customer') {
        updateData.converted_at = new Date().toISOString();
      }
      
      // Update all accounts
      const updatePromises = accountIds.map(async (accountId) => {
        const { error } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', accountId);

        if (error) throw error;
        return { accountId, success: true };
      });

      const results = await Promise.allSettled(updatePromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      if (successCount > 0) {
        const statusMap: Record<Customer['account_type'], string> = {
          'prospect': 'Prospect',
          'customer': 'Customer',
          'inactive': 'Inactive'
        };
        addToast(
          `Successfully updated ${successCount} account${successCount !== 1 ? 's' : ''} to ${statusMap[newType]}`,
          'success'
        );
      }

      if (failureCount > 0) {
        addToast(
          `Failed to update ${failureCount} account${failureCount !== 1 ? 's' : ''}`,
          'error'
        );
      }

      // Refresh the list and clear selections
      await fetchAccounts();
      await fetchTabCounts();
      setSelectedAccounts(new Set());
      setBulkOperationModal({ isOpen: false, operation: null });
    } catch (error) {
      console.error('Error in bulk status change:', error);
      addToast('Failed to update account statuses', 'error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setIsProcessingBulk(true);
    try {
      const selectedAccountsData = getSelectedAccountsData();
      const accountIds = selectedAccountsData.map(a => a.id);
      
      // Delete all accounts
      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', accountIds);

      if (error) throw error;

      addToast(
        `Successfully deleted ${selectedAccountsData.length} account${selectedAccountsData.length !== 1 ? 's' : ''}`,
        'success'
      );

      // Refresh the list and clear selections
      await fetchAccounts();
      await fetchTabCounts();
      setSelectedAccounts(new Set());
      setBulkOperationModal({ isOpen: false, operation: null });
    } catch (error) {
      console.error('Error in bulk delete:', error);
      addToast('Failed to delete accounts', 'error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Handle bulk operation confirm
  const handleBulkOperationConfirm = async (data: { newStatus?: string }) => {
    switch (bulkOperationModal.operation) {
      case 'change-status':
        await handleBulkStatusChange(data.newStatus as Customer['account_type']);
        break;
      case 'delete':
        await handleBulkDelete();
        break;
    }
  };

  // Get tab counts
  const getTabCount = (tabType: TabType) => {
    return tabCounts[tabType] || 0;
  };

  // Tab configuration
  const tabs = [
    { id: 'prospects' as TabType, label: 'Prospects', icon: Users },
    { id: 'customers' as TabType, label: 'Customers', icon: CheckCircle },
    { id: 'inactive' as TabType, label: 'Inactive', icon: XCircle }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage customer accounts, prospects, and inactive accounts
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New Account
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getTabCount(tab.id)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {selectedAccounts.size > 0 && (
          <BulkActionsDropdown
            selectedCount={selectedAccounts.size}
            onAction={handleBulkAction}
            allowedActions={getAllowedBulkActions()}
          />
        )}
      </div>

      {/* Accounts List */}
      <div className="flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading accounts...</p>
            </div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No accounts found</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-visible flex-1 flex flex-col">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.size === filteredAccounts.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.has(account.id)}
                        onChange={() => handleSelectAccount(account.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {account.business_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {account.contact_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {account.domain || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {account.project_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <StatusDropdown
                        value={account.account_type}
                        options={[
                          { value: 'prospect' as const, label: 'Prospect', color: 'bg-blue-100 text-blue-800' },
                          { value: 'customer' as const, label: 'Customer', color: 'bg-green-100 text-green-800' },
                          { value: 'inactive' as const, label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
                        ]}
                        onChange={(newType) => handleStatusChange(account.id, newType)}
                        onConfirm={() => fetchTabCounts()}
                        confirmLabel="Update Status"
                        entityName={account.business_name}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <ActionButton
                          icon={Eye}
                          label="View Details"
                          onClick={() => {
                            // Handle view/edit
                            console.log('View details for', account.id);
                          }}
                        />
                        <ActionButton
                          icon={Edit}
                          label="Edit Account"
                          onClick={() => {
                            // Handle edit
                            console.log('Edit account', account.id);
                          }}
                        />
                        {activeTab === 'prospects' && (
                          <ActionButton
                            icon={ArrowRight}
                            label="Convert to Customer"
                            onClick={() => handleStatusChange(account.id, 'customer')}
                          />
                        )}
                        <ActionButton
                          icon={Trash2}
                          label="Delete Account"
                          variant="danger"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this account?')) {
                              // Handle delete
                              console.log('Delete account', account.id);
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
        fetchAccounts();
        fetchTabCounts();
      }}
      />

      {/* Bulk Operation Modal */}
      {bulkOperationModal.operation && (
        <BulkOperationModal
          isOpen={bulkOperationModal.isOpen}
          onClose={() => setBulkOperationModal({ isOpen: false, operation: null })}
          operation={bulkOperationModal.operation}
          projects={getSelectedAccountsData().map(a => ({
            id: a.id,
            project_name: a.business_name,
            project_status: a.account_type,
            business_name: a.business_name
          }))}
          onConfirm={handleBulkOperationConfirm}
          isProcessing={isProcessingBulk}
          statusOptions={[
            { value: 'prospect', label: 'Prospect', color: 'bg-blue-100 text-blue-800' },
            { value: 'customer', label: 'Customer', color: 'bg-green-100 text-green-800' },
            { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
          ]}
        />
      )}
      
    </div>
  );
};

export default AccountsPage;