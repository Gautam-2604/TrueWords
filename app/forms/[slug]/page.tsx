'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Copy, Eye, Settings, Code, ExternalLink, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CustomFormData } from '@/common/types';


export default function FormDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const navigate = useRouter()
  
  const [form, setForm] = useState<CustomFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'embed' | 'responses'>('overview');
  const [copiedType, setCopiedType] = useState<string | null>(null);

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
    } catch (err) {
      setError('Failed to load form data');
      console.error('Error fetching form:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast.success("Copied")
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-gray-600 dark:text-gray-400">Loading form details...</span>
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
            The form you are looking for does not exist or has been removed.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const embedUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/embed/${form.slug}`;
  
  const codeSnippets = {
    iframe: `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`,
    script: `<div id="testimonial-widget-${form.slug}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/js/widget.js';
    script.onload = function() {
      TestimonialWidget.init({
        formSlug: '${form.slug}',
        containerId: 'testimonial-widget-${form.slug}',
        theme: '${form.branding.primaryColor || '#3B82F6'}'
      });
    };
    document.head.appendChild(script);
  })();
</script>`,
    react: `import { TestimonialWidget } from '@testimonial-app/react';

function MyComponent() {
  return (
    <TestimonialWidget 
      formSlug="${form.slug}"
      theme="${form.branding.primaryColor || '#3B82F6'}"
    />
  );
}`
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{form.title}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    form.isActive 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                  }`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {form.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{form.description}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>Organization: {form.organization.name}</span>
                  <span>Created: {formatDate(form.createdAt)}</span>
                  <span>Responses: {form.responsesCount}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.open(embedUrl, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors" onClick={()=>navigate.push(`/forms/edit/${slug}`)}>
                  <Settings className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'embed', label: 'Embed Code', icon: Code },
                { id: 'responses', label: 'Responses', icon: Eye }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'embed' | 'responses')}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Settings */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Form Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Form URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/forms/${form.slug}`}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/forms/${form.slug}`, 'url')}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {copiedType === 'url' ? '✓' : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Allowed Response Types
                    </label>
                    <div className="flex gap-2">
                      {form.allowedTypes.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-full capitalize"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {form.branding.primaryColor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Brand Color
                      </label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: form.branding.primaryColor }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{form.branding.primaryColor}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Responses</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{form.responsesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Form Views</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Embed Your Form</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose from multiple embedding options to add your testimonial form to any website.
              </p>

              <div className="space-y-6">
                {/* IFrame Embed */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">IFrame Embed</h3>
                    <button
                      onClick={() => copyToClipboard(codeSnippets.iframe, 'iframe')}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      {copiedType === 'iframe' ? '✓ Copied' : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <code className="text-gray-800 dark:text-gray-200">{codeSnippets.iframe}</code>
                  </pre>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Simple iframe embed. Works on any website.
                  </p>
                </div>

                {/* JavaScript Widget */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">JavaScript Widget</h3>
                    <button
                      onClick={() => copyToClipboard(codeSnippets.script, 'script')}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      {copiedType === 'script' ? '✓ Copied' : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <code className="text-gray-800 dark:text-gray-200">{codeSnippets.script}</code>
                  </pre>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    More customizable widget with dynamic loading.
                  </p>
                </div>

                {/* React Component */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">React Component</h3>
                    <button
                      onClick={() => copyToClipboard(codeSnippets.react, 'react')}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      {copiedType === 'react' ? '✓ Copied' : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <code className="text-gray-800 dark:text-gray-200">{codeSnippets.react}</code>
                  </pre>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    For React applications. Install our npm package first.
                  </p>
                </div>

                {/* Preview Link */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Preview Your Form</h3>
                  <button
                    onClick={() => window.open(embedUrl, '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Form Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Responses</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{form.responsesCount} total</span>
              </div>
              
              {form.responsesCount === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No responses yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Share your form to start collecting testimonials
                  </p>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/forms/${form.slug}`, 'share')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Form Link
                  </button>
                </div>
              ) : (
                <div>
                  {/* Responses will be loaded here */}
                  <p className="text-gray-500 dark:text-gray-400">Response list component would go here...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}