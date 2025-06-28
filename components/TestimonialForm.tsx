'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

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

interface TestimonialFormProps {
  form: FormData
  isEmbedded?: boolean
}

export default function TestimonialForm({ form, isEmbedded = false }: TestimonialFormProps) {
  const [rating, setRating] = useState(5)
  const [testimonial, setTestimonial] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const primaryColor = form.branding.primaryColor || '#6366F1'

  // Mock form data for demo
  const mockForm = {
    _id: '1',
    title: 'Share Your Experience',
    description: 'Help others discover our amazing service by sharing your honest feedback',
    slug: 'demo-form',
    allowedTypes: ['text'],
    branding: {
      logoUrl: 'https://via.placeholder.com/120x40/6366F1/FFFFFF?text=LOGO',
      primaryColor: '#6366F1',
      thankYouMessage: 'Thank you for your valuable feedback! We truly appreciate you taking the time to share your experience.'
    },
    isActive: true
  }

  const activeForm = form || mockForm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitted(true)
      
      if (isEmbedded && window.parent !== window) {
        window.parent.postMessage({
          type: 'testimonial_submitted',
          data: { formSlug: activeForm.slug }
        }, '*')
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-white/20">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg transform animate-bounce">
                <span className="text-3xl text-white">✓</span>
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto opacity-20 animate-ping"></div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Thank you!
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {activeForm.branding.thankYouMessage || 'Your testimonial has been submitted successfully.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                {activeForm.branding.logoUrl && (
                  <div className="mb-6">
                    <img 
                      src={activeForm.branding.logoUrl} 
                      alt="Logo" 
                      className="h-10 mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {activeForm.title}
                  </h1>
                  {activeForm.description && (
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {activeForm.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  How would you rate your experience?
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-2 rounded-full hover:bg-yellow-50 transition-all duration-200 transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-all duration-200 ${
                          star <= (hoveredStar || rating)
                            ? 'fill-current text-yellow-400 drop-shadow-sm' 
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500">
                  {rating === 5 ? '🌟 Excellent!' : 
                   rating === 4 ? '😊 Great!' : 
                   rating === 3 ? '👍 Good!' : 
                   rating === 2 ? '😐 Fair' : '😞 Poor'}
                </p>
              </div>

              {/* Testimonial */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Share your experience
                </label>
                <div className="relative">
                  <textarea
                    value={testimonial}
                    onChange={(e) => setTestimonial(e.target.value)}
                    rows={4}
                    required
                    className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-300 resize-none placeholder-gray-400"
                    placeholder="Tell us about your experience and what made it special..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {testimonial.length}/500
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Company <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                    style={{ 
                      background: isSubmitting 
                        ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                        : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting your testimonial...
                        </>
                      ) : (
                        <>
                          Submit Testimonial
                          <span className="text-xl">✨</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Your feedback helps us improve and helps others make informed decisions
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}