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

  const primaryColor = form.branding.primaryColor || '#3B82F6'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formSlug: form.slug,
          rating,
          testimonial,
          name,
          email,
          company,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        // Optional: Notify parent window
        if (isEmbedded && window.parent !== window) {
          window.parent.postMessage({
            type: 'testimonial_submitted',
            data: { formSlug: form.slug }
          }, '*')
        }
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Thank you!
        </h2>
        <p className="text-gray-600">
          {form.branding.thankYouMessage || 'Your testimonial has been submitted successfully.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {form.branding.logoUrl && (
        <div className="text-center">
          <img 
            src={form.branding.logoUrl} 
            alt="Logo" 
            className="h-12 mx-auto"
          />
        </div>
      )}
      
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {form.title}
        </h1>
        {form.description && (
          <p className="text-gray-600">
            {form.description}
          </p>
        )}
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= rating 
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
          Your Testimonial
        </label>
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          rows={4}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your experience..."
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company (Optional)
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: primaryColor }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
      </button>
    </form>
  )
}