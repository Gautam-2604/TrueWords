import React, { useState, useEffect } from 'react';
import {  ChevronLeft, ChevronRight, Play, User, Quote } from 'lucide-react';
import { CustomFormData, TestimonialResponse } from '@/common/types';

const TestimonialsDisplay = ({ slug, apiBaseUrl = '/api' }:{slug: string, apiBaseUrl: string}) => {
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [form, setForm] = useState<CustomFormData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    totalPages: number;
  } | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialResponse>();

  useEffect(() => {
    if (slug) {
      fetchTestimonials();
    }
  }, [slug, currentPage]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/testimonials/${slug}?page=${currentPage}&limit=9&approved=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data.testimonials);
        setForm(data.data.form);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to load testimonials');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const renderStars = (rating = 5) => {
  //   return Array.from({ length: 5 }, (_, i) => (
  //     <Star
  //       key={i}
  //       className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
  //     />
  //   ));
  // };

  const openModal = (testimonial: TestimonialResponse) => {
    setSelectedTestimonial(testimonial);
  };

  const closeModal = () => {
    setSelectedTestimonial(undefined);
  };

  const nextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (pagination?.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-red-600 text-lg font-medium mb-2">Unable to load testimonials</div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!testimonials?.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-600 text-lg font-medium mb-2">No testimonials yet</div>
        <div className="text-gray-500 text-sm">Be the first to share your experience!</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-12">
        {form?.branding?.logoUrl && (
          <img 
            src={form.branding.logoUrl} 
            alt="Logo" 
            className="h-12 mx-auto mb-4 object-contain"
          />
        )}
        <h2 
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          style={{ color: form?.branding?.primaryColor || undefined }}
        >
          {form?.title || 'Customer Testimonials'}
        </h2>
        {form?.description && (
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {form.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial._id}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-indigo-200"
            onClick={() => openModal(testimonial)}
          >
            {/* Quote Icon */}
            {/* <div className="flex justify-between items-start mb-4">
              <Quote className="w-8 h-8 text-indigo-200 group-hover:text-indigo-400 transition-colors" />
              <div className="flex gap-1">
                {renderStars(testimonial.rating)}
              </div>
            </div> */}

            {/* Content */}
            <div className="mb-6">
              {testimonial.text && (
                <p className="text-gray-700 leading-relaxed line-clamp-4 group-hover:text-gray-900 transition-colors">
                  {testimonial.text}
                </p>
              )}
              
              {testimonial.videoUrl && (
                <div className="mt-4 relative bg-gray-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Play className="w-12 h-12 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Video
                  </span>
                </div>
              )}
              
              {testimonial.imageUrl && !testimonial.videoUrl && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img 
                    src={testimonial.imageUrl} 
                    alt="Testimonial" 
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {testimonial.name || 'Anonymous'}
                </div>
                {/* {testimonial.company && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {testimonial.company}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevPage}
            disabled={!pagination.hasPrevPage}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
          </div>
          
          <button
            onClick={nextPage}
            disabled={!pagination.hasNextPage}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              {/* <div className="flex gap-1">
                {renderStars(selectedTestimonial.rating)}
              </div> */}
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>
            
            {selectedTestimonial.text && (
              <div className="mb-6">
                <Quote className="w-8 h-8 text-indigo-200 mb-4" />
                <p className="text-gray-700 text-lg leading-relaxed">
                  {selectedTestimonial.text}
                </p>
              </div>
            )}
            
            {selectedTestimonial.videoUrl && (
              <div className="mb-6 aspect-video bg-gray-100 rounded-xl overflow-hidden">
                <video 
                  src={selectedTestimonial.videoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {selectedTestimonial.imageUrl && !selectedTestimonial.videoUrl && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img 
                  src={selectedTestimonial.imageUrl} 
                  alt="Testimonial" 
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
            
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {selectedTestimonial.name ? selectedTestimonial.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  {selectedTestimonial.name || 'Anonymous'}
                </div>
                {/* {selectedTestimonial.company && (
                  <div className="text-gray-500 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {selectedTestimonial.company}
                  </div>
                )} */}
                {selectedTestimonial.email && (
                  <div className="text-sm text-gray-400">
                    {selectedTestimonial.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsDisplay;