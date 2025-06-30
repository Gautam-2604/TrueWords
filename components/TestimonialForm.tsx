'use client'

import { useState } from 'react'
import { Star, Upload, X, Image, Video } from 'lucide-react'

interface FormData {
  _id: string
  title: string
  description: string
  slug: string
  allowedTypes: string[]
  branding: {
    logoUrl?: string
    primaryColor?: string
    thankYouMessage?: string
  }
  isActive: boolean
}

interface TestimonialEmbedProps {
  form: FormData
}

export default function TestimonialEmbed({ form }: TestimonialEmbedProps) {
  const [rating, setRating] = useState(5)
  const [testimonial, setTestimonial] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const primaryColor = form.branding.primaryColor || '#6366F1'
  const hasImageUpload = form.allowedTypes.includes('image')
  const hasVideoUpload = form.allowedTypes.includes('video')
  const hasUpload = hasImageUpload || hasVideoUpload

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (hasImageUpload && file.type.startsWith('image/')) return true
      if (hasVideoUpload && file.type.startsWith('video/')) return true
      return false
    })
    
    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getAcceptedTypes = () => {
    const types = []
    if (hasImageUpload) types.push('image/*')
    if (hasVideoUpload) types.push('video/*')
    return types.join(',')
  }

  const getUploadLabel = () => {
    if (hasImageUpload && hasVideoUpload) return 'Upload images or videos'
    if (hasImageUpload) return 'Upload images'
    if (hasVideoUpload) return 'Upload videos'
    return 'Upload files'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Updated handleSubmit function for your TestimonialEmbed component

const handleSubmit = async () => {
  // Validate required fields
  if (!name.trim() || !email.trim() || !testimonial.trim()) {
    alert('Please fill in all required fields');
    return;
  }

  setIsSubmitting(true);

  try {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add form fields
    formData.append('formId', form._id);
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('testimonial', testimonial.trim());
    formData.append('rating', rating.toString());
    
    if (company.trim()) {
      formData.append('company', company.trim());
    }

    // Add uploaded files
    uploadedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        formData.append('image', file);
      } else if (file.type.startsWith('video/')) {
        formData.append('video', file);
      }
    });

    // Submit to API
    const response = await fetch('/api/testimonials/submit', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit testimonial');
    }

    setIsSubmitted(true);
    
    // Post message to parent window if embedded
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'testimonial_submitted',
        data: { 
          formSlug: form.slug,
          testimonialId: result.id
        }
      }, '*');
    }

  } catch (error) {
    console.error('Error submitting testimonial:', error);
    alert(error.message || 'Failed to submit testimonial. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center border">
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <span className="text-2xl text-white">✓</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Thank you!
          </h3>
          <p className="text-gray-600 text-sm">
            {form.branding.thankYouMessage || 'Your testimonial has been submitted successfully.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            {form.branding.logoUrl && (
              <div className="mb-4">
                <img 
                  src={form.branding.logoUrl} 
                  alt="Logo" 
                  className="h-8 mx-auto"
                />
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {form.title}
            </h2>
            {form.description && (
              <p className="text-gray-600 text-sm">
                {form.description}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate your experience
              </label>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1 rounded transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoveredStar || rating)
                          ? 'fill-current text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your testimonial
              </label>
              <textarea
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none text-black"
                placeholder="Share your experience..."
              />
            </div>

            {/* Upload Section */}
            {hasUpload && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getUploadLabel()} <span className="text-gray-400">(optional)</span>
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept={getAcceptedTypes()}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {hasImageUpload && hasVideoUpload ? 'Images and videos' : 
                         hasImageUpload ? 'Images only' : 'Videos only'}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {file.type.startsWith('image/') ? (
                            <Image className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Video className="w-4 h-4 text-purple-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-black"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-black"
                placeholder="your@email.com"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-black"
                placeholder="Your company"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: isSubmitting ? '#9CA3AF' : primaryColor
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                'Submit Testimonial'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}