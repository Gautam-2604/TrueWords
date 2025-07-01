'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Palette, 
  Settings, 
  Mail,
  MessageSquare,
  Video,
  Image as ImageIcon,
  Loader2,
  Trash2
} from 'lucide-react';
import { CustomFormData } from '@/common/types';


const RESPONSE_TYPES = [
  { id: 'text', label: 'Text', icon: MessageSquare },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'email', label: 'Email', icon: Mail }
];

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [form, setForm] = useState<CustomFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    allowedTypes: [] as string[],
    isActive: true,
    branding: {
      logoUrl: '',
      primaryColor: '#3B82F6',
      thankYouMessage: 'Thank you for your testimonial!'
    }
  });

  useEffect(() => {
    if (slug) {
      fetchFormData();
    }
  }, [slug]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Form not found');
        } else {
          setError('Failed to load form data');
        }
        return;
      }

      const data = await response.json();
      setForm(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        slug: data.slug,
        allowedTypes: data.allowedTypes,
        isActive: data.isActive,
        branding: {
          logoUrl: data.branding.logoUrl || '',
          primaryColor: data.branding.primaryColor || '#3B82F6',
          thankYouMessage: data.branding.thankYouMessage || 'Thank you for your testimonial!'
        }
      });
    } catch (err) {
      setError('Failed to load form data');
      console.error('Error fetching form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      setUnsavedChanges(true);
    };

  const handleBrandingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleTypeToggle = (typeId: string) => {
    const newTypes = formData.allowedTypes.includes(typeId)
      ? formData.allowedTypes.filter(t => t !== typeId)
      : [...formData.allowedTypes, typeId];
    
    handleInputChange('allowedTypes', newTypes);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    if (!form || formData.slug === generateSlug(form.title)) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/forms/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update form');
      }

      const updatedForm = await response.json();
      setForm(updatedForm);
      setUnsavedChanges(false);
      
      // Show success message (you can replace with a toast notification)
      alert('Form updated successfully!');
      
      // If slug changed, redirect to new URL
      if (updatedForm.slug !== slug) {
        router.push(`/forms/${updatedForm.slug}/edit`);
      }
    } catch (err) {
      console.error('Error saving form:', err);
      alert('Failed to save form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      router.push('/forms');
    } catch (err) {
      console.error('Error deleting form:', err);
      alert('Failed to delete form. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-gray-600 dark:text-gray-400">Loading form...</span>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Form not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The form you are trying to edit does not exist or has been removed.
          </p>
          <button 
            onClick={() => router.push('/forms')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Form</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Customize your testimonial form settings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open(`/embed/${form.slug}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !unsavedChanges}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Form Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter form title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what this form is for"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL Slug *
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md text-gray-500 dark:text-gray-400 text-sm">
                        /forms/
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="form-slug"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This will be part of your forms URL
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Types */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Allowed Response Types</h2>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select which types of testimonials you want to collect
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {RESPONSE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.allowedTypes.includes(type.id);
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleTypeToggle(type.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Branding */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Branding</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.branding.logoUrl}
                      onChange={(e) => handleBrandingChange('logoUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#3B82F6"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleBrandingChange('primaryColor', color)}
                          className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thank You Message
                    </label>
                    <textarea
                      value={formData.branding.thankYouMessage}
                      onChange={(e) => handleBrandingChange('thankYouMessage', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Thank you for your testimonial!"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status</h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Form is active</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  When inactive, the form wont accept new submissions
                </p>
              </div>

              {/* Form Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Form Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Responses</span>
                    <span className="text-gray-900 dark:text-gray-100">{form.responsesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Organization</span>
                    <span className="text-gray-900 dark:text-gray-100">{form.organization.name}</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete a form, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors w-full justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}