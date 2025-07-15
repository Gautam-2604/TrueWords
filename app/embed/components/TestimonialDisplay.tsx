import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, User, Quote, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { CustomFormData, TestimonialResponse } from '@/common/types';

const TestimonialsDisplay = ({ slug, apiBaseUrl = '/api' }: { slug: string, apiBaseUrl: string }) => {
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [form, setForm] = useState<CustomFormData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    totalPages: number;
  } | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialResponse>();
  const [videoStates, setVideoStates] = useState<{[key: string]: {
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
  }}>({});
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});

  useEffect(() => {
    if (slug) {
      fetchTestimonials();
    }
  }, [slug, currentPage]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/testimonials/${slug}`);

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }

      const data = await response.json();
      console.log(data, "Data - - - - - - -- - -  - - - -");

      // Set testimonials - validate the shape just like in fetchFormData
      if (Array.isArray(data.testimonials)) {
        setTestimonials(data.testimonials);
      } else if (data.testimonials && typeof data.testimonials === 'object') {
        if (Array.isArray(data.testimonials.data)) {
          setTestimonials(data.testimonials.data);
        } else if (Array.isArray(data.testimonials.testimonials)) {
          setTestimonials(data.testimonials.testimonials);
        } else {
          setTestimonials([data.testimonials]);
        }
      } else {
        setTestimonials([]);
      }

      // Set form and pagination with checks
      if (data.data?.form) {
        setForm(data.data.form);
      } else {
        console.warn("Form data is missing in response");
      }

      if (data.data?.pagination) {
        setPagination(data.data.pagination);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const updateVideoState = (testimonialId: string, updates: Partial<{
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
  }>) => {
    setVideoStates(prev => ({
      ...prev,
      [testimonialId]: {
        ...prev[testimonialId],
        ...updates
      }
    }));
  };

  const handleVideoPlay = (testimonialId: string) => {
    const video = videoRefs.current[testimonialId];
    if (video) {
      video.play();
      updateVideoState(testimonialId, { isPlaying: true });
    }
  };

  const handleVideoPause = (testimonialId: string) => {
    const video = videoRefs.current[testimonialId];
    if (video) {
      video.pause();
      updateVideoState(testimonialId, { isPlaying: false });
    }
  };

  const handleVideoToggle = (testimonialId: string) => {
    const video = videoRefs.current[testimonialId];
    if (video) {
      if (video.paused) {
        video.play();
        updateVideoState(testimonialId, { isPlaying: true });
      } else {
        video.pause();
        updateVideoState(testimonialId, { isPlaying: false });
      }
    }
  };

  const handleMuteToggle = (testimonialId: string) => {
    const video = videoRefs.current[testimonialId];
    if (video) {
      video.muted = !video.muted;
      updateVideoState(testimonialId, { isMuted: video.muted });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openModal = (testimonial: TestimonialResponse) => {
    setSelectedTestimonial(testimonial);
  };

  const closeModal = () => {
    setSelectedTestimonial(undefined);
    // Pause any playing videos when closing modal
    Object.keys(videoRefs.current).forEach(id => {
      const video = videoRefs.current[id];
      if (video && !video.paused) {
        video.pause();
      }
    });
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
            key={testimonial._id.toString()}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-indigo-200"
          >
            {/* Video Section */}
            {testimonial.videoUrl && (
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                <video
                  ref={(el) => { videoRefs.current[testimonial._id.toString()] = el; }}
                  src={testimonial.videoUrl}
                  className="w-full h-full object-cover"
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    updateVideoState(testimonial._id.toString(), {
                      currentTime: video.currentTime,
                      duration: video.duration
                    });
                  }}
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    updateVideoState(testimonial._id.toString(), {
                      duration: video.duration,
                      isMuted: video.muted,
                      isPlaying: false,
                      currentTime: 0
                    });
                  }}
                  onPlay={() => updateVideoState(testimonial._id.toString(), { isPlaying: true })}
                  onPause={() => updateVideoState(testimonial._id.toString(), { isPlaying: false })}
                  muted
                  playsInline
                />
                
                {/* Video Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoToggle(testimonial._id.toString());
                      }}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                    >
                      {videoStates[testimonial._id.toString()]?.isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                  </div>
                  
                  {/* Video Controls Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMuteToggle(testimonial._id.toString());
                      }}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-200"
                    >
                      {videoStates[testimonial._id.toString()]?.isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-white h-full transition-all duration-100"
                        style={{ 
                          width: `${videoStates[testimonial._id.toString()]?.duration 
                            ? (videoStates[testimonial._id.toString()]?.currentTime / videoStates[testimonial._id.toString()]?.duration) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                    
                    <div className="text-white text-xs font-medium">
                      {formatTime(videoStates[testimonial._id.toString()]?.currentTime || 0)} / {formatTime(videoStates[testimonial._id.toString()]?.duration || 0)}
                    </div>
                  </div>
                </div>
                
                {/* Video Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  Video
                </div>
              </div>
            )}

            {/* Image Section (if no video) */}
            {testimonial.imageUrl && !testimonial.videoUrl && (
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={testimonial.imageUrl} 
                  alt="Testimonial" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}

            {/* Content Section */}
            <div className="p-6" onClick={() => openModal(testimonial)}>
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="w-8 h-8 text-indigo-200 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </div>

              {/* Text Content */}
              {testimonial.text && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed line-clamp-3 group-hover:text-gray-900 transition-colors">
                    {testimonial.text}
                  </p>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {testimonial.name || 'Anonymous'}
                  </div>
                  {testimonial.email && (
                    <div className="text-sm text-gray-500 truncate">
                      {testimonial.email}
                    </div>
                  )}
                </div>
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
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
          </div>
          
          <button
            onClick={nextPage}
            disabled={!pagination.hasNextPage}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 font-medium"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Enhanced Modal */}
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-2xl font-bold text-gray-900">Testimonial Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              {/* Video in Modal */}
              {selectedTestimonial.videoUrl && (
                <div className="mb-8">
                  <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
                    <video
                      ref={(el) => { videoRefs.current[`modal-${selectedTestimonial._id.toString()}`] = el; }}
                      src={selectedTestimonial.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      controlsList="nodownload"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Image in Modal */}
              {selectedTestimonial.imageUrl && !selectedTestimonial.videoUrl && (
                <div className="mb-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={selectedTestimonial.imageUrl} 
                      alt="Testimonial" 
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Text Content */}
              {selectedTestimonial.text && (
                <div className="mb-8">
                  <Quote className="w-12 h-12 text-indigo-200 mb-6" />
                  <p className="text-gray-700 text-xl leading-relaxed font-light">
                    {selectedTestimonial.text}
                  </p>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                  {selectedTestimonial.name ? selectedTestimonial.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-2xl mb-1">
                    {selectedTestimonial.name || 'Anonymous'}
                  </div>
                  {selectedTestimonial.email && (
                    <div className="text-gray-500 text-lg">
                      {selectedTestimonial.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsDisplay;