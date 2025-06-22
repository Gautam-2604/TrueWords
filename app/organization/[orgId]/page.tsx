'use client'
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Star, 
  Calendar, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  BarChart3,
  FileText,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Mail,
  Phone,
  Globe,
  MapPin
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import { toast } from 'sonner';

interface Member {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: 'admin' | 'viewer';
}

interface Organization {
  _id: string;
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  owner: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

interface Testimonial {
  _id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Form {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  responseCount: number;
}

const OrganizationDetail = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orgId = params?.id as string;

  useEffect(() => {
    if (!orgId || !user?.id) return;
    
    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        
        // Fetch organization details
        const orgResponse = await fetch(`/api/organization/${orgId}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setOrganization(orgData.organization);
        }

        // Mock data for demonstration
        setTestimonials([
          {
            _id: '1',
            customerName: 'John Smith',
            customerEmail: 'john@example.com',
            rating: 5,
            message: 'Amazing service! The team went above and beyond to deliver exactly what we needed. Highly recommended!',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'approved'
          },
          {
            _id: '2',
            customerName: 'Sarah Johnson',
            customerEmail: 'sarah@example.com',
            rating: 4,
            message: 'Great experience overall. Professional team and quality work. Will definitely work with them again.',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'approved'
          },
          {
            _id: '3',
            customerName: 'Mike Davis',
            customerEmail: 'mike@example.com',
            rating: 5,
            message: 'Outstanding results! The project was completed on time and exceeded our expectations.',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          }
        ]);

        setForms([
          {
            _id: '1',
            name: 'Customer Feedback Form',
            description: 'Collect feedback from customers after project completion',
            isActive: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            responseCount: 12
          },
          {
            _id: '2',
            name: 'Service Review Form',
            description: 'General service review and testimonial collection',
            isActive: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            responseCount: 8
          },
          {
            _id: '3',
            name: 'Product Review Form',
            description: 'Product-specific testimonials and reviews',
            isActive: false,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            responseCount: 5
          }
        ]);

      } catch (error) {
        console.error('Error fetching organization data:', error);
        toast.error('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [orgId, user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAverageRating = () => {
    const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
    if (approvedTestimonials.length === 0) return 0;
    const sum = approvedTestimonials.reduce((acc, t) => acc + t.rating, 0);
    return (sum / approvedTestimonials.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Organization not found</p>
          <button
            onClick={() => router.push('/organization')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={() => router.push('/organization')}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Organizations
            </button>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {organization.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Created {formatDate(organization.createdAt)}
                  </p>
                  {organization.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                      {organization.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Settings className="w-4 h-4 mr-2 inline" />
                  Settings
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4 mr-2 inline" />
                  New Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Testimonials</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{testimonials.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{getAverageRating()}</p>
                  <div className="flex">
                    {renderStars(Math.round(parseFloat(getAverageRating())))}
                  </div>
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Forms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {forms.filter(f => f.isActive).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{organization.members.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
              { id: 'forms', name: 'Forms', icon: FileText },
              { id: 'members', name: 'Members', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Testimonials */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Testimonials</h3>
                <div className="space-y-4">
                  {testimonials.slice(0, 3).map((testimonial) => (
                    <div key={testimonial._id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">{testimonial.customerName}</p>
                        <div className="flex">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {testimonial.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDate(testimonial.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {organization.email || 'contact@example.com'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {organization.phone || '+1 (555) 123-4567'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {organization.website || 'www.example.com'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {organization.address || '123 Business St, Suite 100, City, State 12345'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Testimonials</h3>
              <div className="flex space-x-3">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
                  <option>All Ratings</option>
                  <option>5 Stars</option>
                  <option>4 Stars</option>
                  <option>3 Stars</option>
                  <option>2 Stars</option>
                  <option>1 Star</option>
                </select>
              </div>
            </div>
            
            <div className="grid gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {testimonial.customerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {testimonial.customerName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(testimonial.rating)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        testimonial.status === 'approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : testimonial.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {testimonial.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {testimonial.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {formatDate(testimonial.createdAt)}
                    </p>
                    <div className="flex space-x-2">
                      {testimonial.status === 'pending' && (
                        <>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Testimonial Forms</h3>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2 inline" />
                Create New Form
              </button>
            </div>
            
            <div className="grid gap-6">
              {forms.map((form) => (
                <div key={form._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                          {form.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          form.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {form.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>Created {formatDate(form.createdAt)}</span>
                        <span>{form.responseCount} responses</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                      View Form
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm rounded-lg transition-colors">
                      Copy Link
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm rounded-lg transition-colors">
                      View Responses
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <UserPlus className="w-4 h-4 mr-2 inline" />
                Invite Member
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {organization.members.map((member, index) => (
                <div key={member.user._id} className={`p-6 ${index !== organization.members.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.user.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {member.user.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        member.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {member.role}
                      </span>
                      {member.user._id !== organization.owner && (
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetail;