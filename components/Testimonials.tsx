import React from 'react'
import { AnimatedTestimonials } from './ui/animated-testimonials'
import { testimonials } from '@/lib/constants'

const Testimonials = () => {
  return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of businesses already using TestimonialHub
            </p>
          </div>
          
          
            <AnimatedTestimonials testimonials={testimonials} />
          
        </div>
      </section>
  )
}

export default Testimonials
