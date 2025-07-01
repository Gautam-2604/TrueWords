'use client'
import { useAuth } from "@/context/authContext";
import { Organization } from "@/lib/types";
import { ArrowLeft, Check, Eye, FileText, Image, MessageSquare, Palette, Plus, Video, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CreateFormPage = () => {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    allowedTypes: ['text'] as string[],
    branding: {
      logoUrl: '',
      primaryColor: '#3b82f6',
      thankYouMessage: 'Thank you for your testimonial! We appreciate your feedback.'
    }
  });

  useEffect(() => {
    if (!user?.id) return;
    const getOrgs = async()=>{
    const orgs = await fetch(`/api/organization?userId=${user.id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await orgs.json();
    setOrganizations(Array.isArray(data.orgs) ? data.orgs : []);
  }

  getOrgs()
    
  }, [user?.id, isLoading]);

  const handleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      allowedTypes: prev.allowedTypes.includes(type)
        ? prev.allowedTypes.filter(t => t !== type)
        : [...prev.allowedTypes, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          organization: selectedOrg,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create form');
      }

      const result = await response.json();
      router.push(`/forms/${result.data.slug}`);
    } catch (error) {
      console.error('Error creating form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const previewSlug = formData.title ? generateSlug(formData.title) : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to create forms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Create New Form</h1>
                <p className="text-sm text-muted-foreground">
                  Build a testimonial collection form
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-3 py-2 border border-border rounded-md bg-background hover:bg-muted transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Configuration */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Selection */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary" />
                  Organization
                </h3>
                <div>
                  <label htmlFor="org-select" className="block text-sm font-medium text-foreground mb-2">
                    Select Organization *
                  </label>
                  <select
                    id="org-select"
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Choose an organization...</option>
                    {organizations.map(org => (
                      <option key={org._id} value={org._id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  {organizations.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      You need to create an organization first.
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                      Form Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Customer Testimonials"
                      required
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {previewSlug && (
                      <p className="text-sm text-muted-foreground mt-1">
                        URL: your-domain.com/form/{previewSlug}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Help users understand what kind of testimonial you're looking for..."
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Content Types */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  Allowed Content Types
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { type: 'text', icon: MessageSquare, label: 'Text Testimonials', desc: 'Written feedback and reviews' },
                    { type: 'image', icon: Image, label: 'Image Testimonials', desc: 'Photos with testimonials' },
                    { type: 'video', icon: Video, label: 'Video Testimonials', desc: 'Video recordings' }
                  ].map(({ type, icon: Icon, label, desc }) => (
                    <label key={type} className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.allowedTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                        formData.allowedTypes.includes(type) 
                          ? 'bg-primary border-primary' 
                          : 'border-border'
                      }`}>
                        {formData.allowedTypes.includes(type) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <Icon className="w-5 h-5 text-muted-foreground mr-3" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{label}</div>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Branding */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-primary" />
                  Branding
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="logoUrl" className="block text-sm font-medium text-foreground mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      id="logoUrl"
                      value={formData.branding.logoUrl}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, logoUrl: e.target.value }
                      }))}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-foreground mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        id="primaryColor"
                        value={formData.branding.primaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="w-12 h-10 border border-border rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.primaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="thankYouMessage" className="block text-sm font-medium text-foreground mb-2">
                      Thank You Message
                    </label>
                    <textarea
                      id="thankYouMessage"
                      value={formData.branding.thankYouMessage}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, thankYouMessage: e.target.value }
                      }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedOrg || !formData.title.trim() || formData.allowedTypes.length === 0}
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Create Form
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:sticky lg:top-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-primary" />
                  Live Preview
                </h3>
                
                <div className="border border-border rounded-lg p-6 bg-background" style={{ borderColor: formData.branding.primaryColor + '20' }}>
                  {/* Preview Header */}
                  <div className="text-center mb-6">
                    {formData.branding.logoUrl && (
                      <img 
                        src={formData.branding.logoUrl} 
                        alt="Logo" 
                        className="h-12 mx-auto mb-4 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {formData.title || 'Form Title'}
                    </h2>
                    {formData.description && (
                      <p className="text-muted-foreground text-sm">
                        {formData.description}
                      </p>
                    )}
                  </div>

                  {/* Preview Content Types */}
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-medium text-foreground">Choose how you would like to share your testimonial:</p>
                    <div className="space-y-2">
                      {formData.allowedTypes.map(type => (
                        <div key={type} className="flex items-center p-3 border border-border rounded-md hover:bg-muted/50 cursor-pointer">
                          {type === 'text' && <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" />}
                          {type === 'image' && <Image className="w-4 h-4 mr-2 text-muted-foreground" />}
                          {type === 'video' && <Video className="w-4 h-4 mr-2 text-muted-foreground" />}
                          <span className="text-sm capitalize">{type} Testimonial</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview Submit Button */}
                  <button 
                    className="w-full py-3 rounded-md text-white font-medium transition-colors"
                    style={{ backgroundColor: formData.branding.primaryColor }}
                    disabled
                  >
                    Submit Testimonial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateFormPage;