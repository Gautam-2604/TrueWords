'use client'

import { useState } from 'react'
import { Star, Upload, X, Image, Video } from 'lucide-react'
import { CustomFormData } from '@/common/types'

interface TestimonialEmbedProps {
  form: CustomFormData
}

interface UploadedFile {
  file: File
  uploading: boolean
  url?: string
  error?: string
}

export default function TestimonialEmbed({ form }: TestimonialEmbedProps) {
  const [rating, setRating] = useState(5)
  const [testimonial, setTestimonial] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const primaryColor = form.branding.primaryColor || '#6366F1'
  const hasImageUpload = form.allowedTypes.includes('image')
  const hasVideoUpload = form.allowedTypes.includes('video')
  const hasUpload = hasImageUpload || hasVideoUpload

  // Function to upload file to S3 using presigned URL
  const uploadToS3 = async (file: File): Promise<string> => {
    try {
      // Generate unique key for the file
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const key = `testimonials/${form._id}/${timestamp}_${randomString}.${fileExtension}`

      const presignedResponse = await fetch('/api/get-presigned-utl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          contentType: file.type,
          operation: 'upload'
        }),
      })

      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URL')
      }

      const { presignedUrl } = await presignedResponse.json()
      console.log("PesSigned", presignedUrl);
      

      // Upload file to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3')
      }

      const publicUrl = `https://truewords.s3.ap-south-1.amazonaws.com/${key}`
      console.log(publicUrl, "Public URL");
      
      return publicUrl

    } catch (error) {
      console.error('Error uploading to S3:', error)
      throw error
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (hasImageUpload && file.type.startsWith('image/')) return true
      if (hasVideoUpload && file.type.startsWith('video/')) return true
      return false
    })

    // Add files to state with uploading status
    const newUploadedFiles = validFiles.map(file => ({
      file,
      uploading: true,
      url: undefined,
      error: undefined
    }))

    setUploadedFiles(prev => [...prev, ...newUploadedFiles])

    // Upload each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const fileIndex = uploadedFiles.length + i

      try {
        const url = await uploadToS3(file)
        
        // Update the file with the URL
        setUploadedFiles(prev => 
          prev.map((uploadedFile, index) => 
            index === fileIndex 
              ? { ...uploadedFile, uploading: false, url }
              : uploadedFile
          )
        )
      } catch (error) {
        // Update the file with error
        setUploadedFiles(prev => 
          prev.map((uploadedFile, index) => 
            index === fileIndex 
              ? { 
                  ...uploadedFile, 
                  uploading: false, 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : uploadedFile
          )
        )
      }
    }
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

  const handleSubmit = async () => {
    // Validate required fields
    if (!name.trim() || !email.trim() || !testimonial.trim()) {
      alert('Please fill in all required fields')
      return
    }

    // Check if any files are still uploading
    const stillUploading = uploadedFiles.some(file => file.uploading)
    if (stillUploading) {
      alert('Please wait for all files to finish uploading')
      return
    }

    // Check if any files failed to upload
    const failedUploads = uploadedFiles.some(file => file.error)
    if (failedUploads) {
      alert('Some files failed to upload. Please remove them and try again.')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the data with file URLs instead of actual files
      const submitData = {
        formId: form._id,
        name: name.trim(),
        email: email.trim(),
        testimonial: testimonial.trim(),
        rating: rating,
        company: company.trim() || undefined,
        imageUrls: uploadedFiles
          .filter(file => file.file.type.startsWith('image/') && file.url)
          .map(file => file.url!),
        videoUrls: uploadedFiles
          .filter(file => file.file.type.startsWith('video/') && file.url)
          .map(file => file.url!)
      }

      // Submit to API
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit testimonial')
      }

      setIsSubmitted(true)
      
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'testimonial_submitted',
          data: { 
            formSlug: form.slug,
            testimonialId: result.id
          }
        }, '*')
      }

    } catch (error) {
      console.error('Error submitting testimonial:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit testimonial. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {uploadedFile.file.type.startsWith('image/') ? (
                            <Image className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Video className="w-4 h-4 text-purple-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(uploadedFile.file.size)}
                            </p>
                            {uploadedFile.uploading && (
                              <p className="text-xs text-blue-500 flex items-center gap-1">
                                <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                Uploading...
                              </p>
                            )}
                            {uploadedFile.error && (
                              <p className="text-xs text-red-500">
                                {uploadedFile.error}
                              </p>
                            )}
                            {uploadedFile.url && !uploadedFile.uploading && (
                              <p className="text-xs text-green-500">
                                ✓ Uploaded
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          disabled={uploadedFile.uploading}
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
              disabled={isSubmitting || uploadedFiles.some(file => file.uploading)}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: isSubmitting || uploadedFiles.some(file => file.uploading) ? '#9CA3AF' : primaryColor
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : uploadedFiles.some(file => file.uploading) ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading files...
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