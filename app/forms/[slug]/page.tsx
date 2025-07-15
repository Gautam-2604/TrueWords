"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Copy,
  Eye,
  Settings,
  Code,
  ExternalLink,
  BarChart3,
  Loader2,
  Brain,
  AlertCircle,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CustomFormData, TestimonialResponse } from "@/common/types";

interface AIInsight {
  painPoint: string;
  bestFeature: string;
  isLoading: boolean;
}

interface VideoAnalysis {
  emotionalTone: string;
  bodyLanguage: string;
  speechPattern: string;
  credibilityScore: number;
  keyMoments: string[];
  demographicInsights: string;
  engagementLevel: string;
}

interface DetailedInsights {
  painPoint: string;
  bestFeature: string;
  sentiment: {
    overall: string;
    positive: number;
    negative: number;
    neutral: number;
  };
  themes: {
    usability: string;
    performance: string;
    support: string;
    pricing: string;
  };
  userSegments: {
    beginners: string[];
    advanced: string[];
    business: string[];
  };
  improvements: string[];
  competitiveAdvantages: string[];
  videoAnalysis?: VideoAnalysis;
  metadata?: {
    analyzedCount: number;
    hasVideoAnalysis: boolean;
    videoFileName: string | null;
    avgSentimentScore: number;
    timestamp: string;
    processingTime: number;
  };
}

export default function FormDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const navigate = useRouter();

  const [form, setForm] = useState<CustomFormData | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "embed" | "responses" | "ai-review"
  >("overview");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  // const [aiInsights, setAiInsights] = useState<AIInsight>({
  //   painPoint: "",
  //   bestFeature: "",
  //   isLoading: false,
  // });

  const [aiInsights, setAiInsights] = useState<DetailedInsights | null>(null);
const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (slug) {
      fetchFormData();
    }
  }, [slug]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${slug}`);
      const testimonialsResponse = await fetch(`/api/testimonials/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Form not found");
        } else {
          setError("Failed to load form data");
        }
        return;
      }

      const data = await response.json();
      setForm(data);

      // Handle testimonials response
      if (testimonialsResponse.ok) {
        const testimonialData = await testimonialsResponse.json();
        console.log(testimonialData, "Testimonials");
        
        // Ensure testimonialData is an array
        if (Array.isArray(testimonialData)) {
          setTestimonials(testimonialData);
        } else if (testimonialData && typeof testimonialData === 'object') {
          // If it's an object with a data property or similar structure
          if (Array.isArray(testimonialData.data)) {
            setTestimonials(testimonialData.data);
          } else if (Array.isArray(testimonialData.testimonials)) {
            setTestimonials(testimonialData.testimonials);
          } else {
            // If it's a single object, wrap it in an array
            setTestimonials([testimonialData]);
          }
        } else {
          setTestimonials([]);
        }
      } else {
        setTestimonials([]);
      }
    } catch (err) {
      setError("Failed to load form data");
      console.error("Error fetching form:", err);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
  if (testimonials.length === 0) {
    toast.error("No testimonials to analyze");
    return;
  }

  setIsGeneratingInsights(true);

  try {
    const formData = new FormData();
    
    // Prepare testimonial text for analysis
    const testimonialTexts = testimonials.map(t => t.text).join(" | ");
    formData.append('testimonials', testimonialTexts);
    formData.append('formTitle', form?.title || "Product/Service");
    
    // Add video file if selected
    if (selectedVideoFile) {
      formData.append('video', selectedVideoFile);
    }

    const response = await fetch("/api/ai-insights", {
      method: "POST",
      body: formData, // Changed from JSON to FormData
    });

    if (!response.ok) {
      throw new Error("Failed to generate AI insights");
    }

    const data: DetailedInsights = await response.json();
    setAiInsights(data);
    toast.success("AI insights generated successfully!");
  } catch (error) {
    console.error("Error generating AI insights:", error);
    toast.error("Failed to generate AI insights. Please try again.");
  } finally {
    setIsGeneratingInsights(false);
  }
};

const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file must be less than 50MB");
      return;
    }
    
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported video format. Please use MP4, MOV, AVI, or WebM");
      return;
    }
    
    setSelectedVideoFile(file);
    toast.success(`Video "${file.name}" selected for analysis`);
  }
};

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast.success("Copied");
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-gray-600 dark:text-gray-400">
            Loading form details...
          </span>
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
            {error || "Form not found"}
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

  const embedUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  }/embed/${form.slug}`;

  const codeSnippets = {
    iframe: `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`,
    script: `<div id="testimonial-widget-${form.slug}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    }/js/widget.js';
    script.onload = function() {
      TestimonialWidget.init({
        formSlug: '${form.slug}',
        containerId: 'testimonial-widget-${form.slug}',
        theme: '${form.branding.primaryColor || "#3B82F6"}'
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
      theme="${form.branding.primaryColor || "#3B82F6"}"
    />
  );
}`,
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {form.title}
                  </h1>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      form.isActive
                        ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {form.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {form.description}
                  </p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>Organization: {form.organization.name}</span>
                  <span>Created: {formatDate(form.createdAt)}</span>
                  <span>Responses: {form.responsesCount}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(embedUrl, "_blank")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => navigate.push(`/forms/edit/${slug}`)}
                >
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
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "embed", label: "Embed Code", icon: Code },
                { id: "responses", label: "Responses", icon: Eye },
                { id: "ai-review", label: "AI Review", icon: Brain },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as "overview" | "embed" | "responses" | "ai-review")
                    }
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Settings */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Form Configuration
                </h2>
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
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/forms/${form.slug}`,
                            "url"
                          )
                        }
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {copiedType === "url" ? (
                          "✓"
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
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
                          style={{
                            backgroundColor: form.branding.primaryColor,
                          }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {form.branding.primaryColor}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Responses
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {form.responsesCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Form Views
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        -
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Conversion Rate
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        -
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "embed" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Embed Your Form
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose from multiple embedding options to add your testimonial
                form to any website.
              </p>

              <div className="space-y-6">
                {/* IFrame Embed */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      IFrame Embed
                    </h3>
                    <button
                      onClick={() =>
                        copyToClipboard(codeSnippets.iframe, "iframe")
                      }
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      {copiedType === "iframe" ? (
                        "✓ Copied"
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <code className="text-gray-800 dark:text-gray-200">
                      {codeSnippets.iframe}
                    </code>
                  </pre>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Simple iframe embed. Works on any website.
                  </p>
                </div>

                {/* JavaScript Widget */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      JavaScript Widget
                    </h3>
                    <button
                      onClick={() =>
                        copyToClipboard(codeSnippets.script, "script")
                      }
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      {copiedType === "script" ? (
                        "✓ Copied"
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <code className="text-gray-800 dark:text-gray-200">
                      {codeSnippets.script}
                    </code>
                  </pre>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    More customizable widget with dynamic loading.
                  </p>
                </div>

                {/* React Component */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      React Component
                    </h3>
                    <button
                      onClick={() =>
                        copyToClipboard(codeSnippets.react, "react")
                      }
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      {copiedType === "react" ? (
                        "✓ Copied"
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <code className="text-gray-800 dark:text-gray-200">
                      {codeSnippets.react}
                    </code>
                  </pre>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    For React applications. Install our npm package first.
                  </p>
                </div>

                {/* Preview Link */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Preview Your Form
                  </h3>
                  <button
                    onClick={() => window.open(embedUrl, "_blank")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Form Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "responses" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Responses
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonials.length} total
                </span>
              </div>

              {testimonials.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No responses yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Share your form to start collecting testimonials
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/forms/${form.slug}`,
                        "share"
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Form Link
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div 
                      key={testimonial._id?.toString() || index}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <p className="text-gray-900 dark:text-gray-100 mb-2">
                        &quot;{testimonial.text}&quot;
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        — {testimonial.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          // Replace the entire AI Review tab content with this enhanced version
{activeTab === "ai-review" && (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI-Powered Insights
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {/* Video Upload */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="video/mp4,video/mov,video/avi,video/webm"
            onChange={handleVideoUpload}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {selectedVideoFile ? selectedVideoFile.name : "Add Video"}
          </div>
        </label>
        
        <button
          onClick={generateAIInsights}
          disabled={isGeneratingInsights || testimonials.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingInsights ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Generate Insights
            </>
          )}
        </button>
      </div>
    </div>

    {testimonials.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No testimonials to analyze
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Collect some testimonials first to get AI-powered insights
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {/* Video Selection Status */}
        {selectedVideoFile && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Video selected: {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(1)}MB)
              </span>
              <button
                onClick={() => setSelectedVideoFile(null)}
                className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Powered by Google Gemini AI
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            Our AI analyzes your testimonials to provide comprehensive insights including sentiment analysis, user segmentation, and competitive advantages. Upload a video for even deeper analysis.
          </p>
        </div>

        {aiInsights && (
          <div className="space-y-6">
            {/* Metadata */}
            {aiInsights.metadata && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Analyzed {aiInsights.metadata.analyzedCount} testimonials</span>
                  <span>Score: {(aiInsights.metadata.avgSentimentScore * 100).toFixed(0)}%</span>
                  {aiInsights.metadata.hasVideoAnalysis && (
                    <span className="text-purple-600 dark:text-purple-400">+ Video Analysis</span>
                  )}
                </div>
              </div>
            )}

            {/* Primary Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      Primary Pain Point
                    </h3>
                    <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                      {aiInsights.painPoint}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Best Feature
                    </h3>
                    <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                      {aiInsights.bestFeature}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Sentiment Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overall: {aiInsights.sentiment.overall}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Positive</span>
                    <span>{aiInsights.sentiment.positive}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${aiInsights.sentiment.positive}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">Negative</span>
                    <span>{aiInsights.sentiment.negative}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${aiInsights.sentiment.negative}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Neutral</span>
                    <span>{aiInsights.sentiment.neutral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${aiInsights.sentiment.neutral}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Themes Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Theme Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Usability</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{aiInsights.themes.usability}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Performance</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{aiInsights.themes.performance}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Support</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{aiInsights.themes.support}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Pricing</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{aiInsights.themes.pricing}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Segments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                User Segments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 text-sm mb-2">Beginners</h4>
                  <ul className="space-y-1">
                    {aiInsights.userSegments.beginners.map((feedback, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {feedback}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-600 dark:text-purple-400 text-sm mb-2">Advanced</h4>
                  <ul className="space-y-1">
                    {aiInsights.userSegments.advanced.map((feedback, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {feedback}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 text-sm mb-2">Business</h4>
                  <ul className="space-y-1">
                    {aiInsights.userSegments.business.map((feedback, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {feedback}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Video Analysis */}
            {aiInsights.videoAnalysis && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Video Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">Emotional Tone</h4>
                      <p className="text-purple-800 dark:text-purple-200 text-sm">{aiInsights.videoAnalysis.emotionalTone}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">Body Language</h4>
                      <p className="text-purple-800 dark:text-purple-200 text-sm">{aiInsights.videoAnalysis.bodyLanguage}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">Speech Pattern</h4>
                      <p className="text-purple-800 dark:text-purple-200 text-sm">{aiInsights.videoAnalysis.speechPattern}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">Credibility Score</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${aiInsights.videoAnalysis.credibilityScore * 10}%` }}
                          />
                        </div>
                        <span className="text-sm text-purple-800 dark:text-purple-200">
                          {aiInsights.videoAnalysis.credibilityScore}/10
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">Engagement Level</h4>
                      <p className="text-purple-800 dark:text-purple-200 text-sm">{aiInsights.videoAnalysis.engagementLevel}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">Demographics</h4>
                      <p className="text-purple-800 dark:text-purple-200 text-sm">{aiInsights.videoAnalysis.demographicInsights}</p>
                    </div>
                  </div>
                </div>
                {aiInsights.videoAnalysis.keyMoments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-2">Key Moments</h4>
                    <ul className="space-y-1">
                      {aiInsights.videoAnalysis.keyMoments.map((moment, idx) => (
                        <li key={idx} className="text-sm text-purple-800 dark:text-purple-200">• {moment}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Improvements & Advantages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
                  Suggested Improvements
                </h3>
                <ul className="space-y-2">
                  {aiInsights.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-orange-800 dark:text-orange-200">
                      • {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Competitive Advantages
                </h3>
                <ul className="space-y-2">
                  {aiInsights.competitiveAdvantages.map((advantage, idx) => (
                    <li key={idx} className="text-sm text-blue-800 dark:text-blue-200">
                      • {advantage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
  
}