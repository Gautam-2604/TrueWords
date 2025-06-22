'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, Calendar, MoreVertical, Edit3, Trash2, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Organization } from '@/lib/types';
import { useAuth } from '@/context/authContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const OrganizationsDashboard = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const {user} = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  
useEffect(() => {
  if (!user?.id) return;
  
  console.log("Starting");
  
  const getOrgs = async() => {
    console.log("Starting 2");
    
    const response = await fetch(`/api/organization?userId=${user.id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log(data, "Data");
    
    
    setOrganizations(Array.isArray(data.orgs) ? data.orgs : []);
  };

  getOrgs();
}, [user?.id]);

  const handleAddOrganization = async () => {
    if (!newOrgName.trim()) return;
    
    setIsLoading(true);
    const response = await fetch('/api/organization',{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({name: newOrgName, owner:user?.id, member:[{user:user?.id, role:'admin'}]})
    })
    if (response.ok) {
          toast.success('Organization Created Successfully');
          router.push('/organization');
        } else {
          const errorData = await response.json(); 
          toast.error(errorData.message || 'Sign in failed. Please try again.');
        }

    setTimeout(() => {
      
      setNewOrgName('');
      setShowAddModal(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleOrganizationClick = (orgId: string) => {
    router.push(`/organization/${orgId}`);
  };

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizations</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your organizations and collect testimonials
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Organization
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {organizations.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No organizations yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first organization to start collecting testimonials from your customers
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Organization
            </button>
          </div>
        ) : (
          /* Organizations Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <button
                key={org._id}
                onClick={() => handleOrganizationClick(org._id)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-200 group w-full text-left"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {org.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created {formatDate(org.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle more options
                      }}
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="flex space-x-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {org.testimonialsCount || 0} testimonials
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        {org.formsCount || 0} forms
                      </div>
                    </div>

                    {/* Members */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {org.members.length} member{org.members.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex -space-x-2">
                        {org.members.slice(0, 3).map((member, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
                          >
                            <span className="text-xs font-medium text-white">
                              {member.user.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        ))}
                        {org.members.length > 3 && (
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              +{org.members.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                  <div className="flex space-x-2">
                    <div className="flex-1 text-center py-2 px-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      View Details
                    </div>
                    <div className="flex-1 text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Manage Forms
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Enter organization name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 rounded-b-xl flex space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewOrgName('');
                }}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrganization}
                disabled={!newOrgName.trim() || isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsDashboard;