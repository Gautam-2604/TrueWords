import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, User, Quote, Pause, Volume2, VolumeX } from 'lucide-react';
import { CustomFormData, TestimonialResponse } from '@/common/types';

const TestimonialsDisplay = ({ slug, apiBaseUrl = '/api' }: { slug: string, apiBaseUrl: string }) => {
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [form, setForm] = useState<CustomFormData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
  }, [slug]);

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

      // Set form with checks
      if (data.data?.form) {
        setForm(data.data.form);
      } else {
        console.warn("Form data is missing in response");
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

  const goToTestimonial = (index: number) => {
    if (index !== currentTestimonialIndex && !isTransitioning) {
      setIsTransitioning(true);
      
      // Pause any playing videos
      Object.keys(videoRefs.current).forEach(id => {
        const video = videoRefs.current[id];
        if (video && !video.paused) {
          video.pause();
        }
      });

      setTimeout(() => {
        setCurrentTestimonialIndex(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const nextTestimonial = () => {
    const nextIndex = (currentTestimonialIndex + 1) % testimonials.length;
    goToTestimonial(nextIndex);
  };

  const prevTestimonial = () => {
    const prevIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    goToTestimonial(prevIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-600 text-lg font-medium mb-2">Unable to load testimonials</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!testimonials?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center max-w-md">
          <div className="text-gray-600 text-lg font-medium mb-2">No testimonials yet</div>
          <div className="text-gray-500 text-sm">Be the first to share your experience!</div>
        </div>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentTestimonialIndex];
  const primaryColor = form?.branding?.primaryColor || '#6366f1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-indigo-100/50 to-purple-100/50 backdrop-blur-3xl"></div>
      
      {/* Dynamic Background Color Overlay */}
      <div 
        className="absolute inset-0 opacity-20 bg-gradient-to-br transition-all duration-1000"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20, ${primaryColor}10)`
        }}
      ></div>

      {/* Header */}
      <div className="relative z-10 text-center pt-16 pb-8">
        {form?.branding?.logoUrl && (
          <img 
            src={form.branding.logoUrl} 
            alt="Logo" 
            className="h-12 mx-auto mb-6 object-contain"
          />
        )}
        <h1 
          className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          style={{ color: form?.branding?.primaryColor || undefined }}
        >
          {form?.title || 'Customer Testimonials'}
        </h1>
        {form?.description && (
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed px-4">
            {form.description}
          </p>
        )}
      </div>

      {/* Main Testimonial Display */}
      <div className="relative z-10 flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-4xl w-full">
          {/* Testimonial Card */}
          <div 
            className={`bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 ${
              isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
            }`}
          >
            {/* Video Section */}
            {currentTestimonial.videoUrl && (
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                <video
                  ref={(el) => { videoRefs.current[currentTestimonial._id.toString()] = el; }}
                  src={currentTestimonial.videoUrl}
                  className="w-full h-full object-cover"
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    updateVideoState(currentTestimonial._id.toString(), {
                      currentTime: video.currentTime,
                      duration: video.duration
                    });
                  }}
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    updateVideoState(currentTestimonial._id.toString(), {
                      duration: video.duration,
                      isMuted: video.muted,
                      isPlaying: false,
                      currentTime: 0
                    });
                  }}
                  onPlay={() => updateVideoState(currentTestimonial._id.toString(), { isPlaying: true })}
                  onPause={() => updateVideoState(currentTestimonial._id.toString(), { isPlaying: false })}
                  muted
                  autoPlay
                  playsInline
                />
                
                {/* Video Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => handleVideoToggle(currentTestimonial._id.toString())}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                    >
                      {videoStates[currentTestimonial._id.toString()]?.isPlaying ? (
                        <Pause className="w-10 h-10 text-white" />
                      ) : (
                        <Play className="w-10 h-10 text-white ml-1" />
                      )}
                    </button>
                  </div>
                  
                  {/* Video Controls Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <button
                      onClick={() => handleMuteToggle(currentTestimonial._id.toString())}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-200"
                    >
                      {videoStates[currentTestimonial._id.toString()]?.isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-white h-full transition-all duration-100"
                        style={{ 
                          width: `${videoStates[currentTestimonial._id.toString()]?.duration 
                            ? (videoStates[currentTestimonial._id.toString()]?.currentTime / videoStates[currentTestimonial._id.toString()]?.duration) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                    
                    <div className="text-white text-sm font-medium">
                      {formatTime(videoStates[currentTestimonial._id.toString()]?.currentTime || 0)} / {formatTime(videoStates[currentTestimonial._id.toString()]?.duration || 0)}
                    </div>
                  </div>
                </div>
                
                {/* Video Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Video
                </div>
              </div>
            )}

            {/* Image Section (if no video) */}
            {currentTestimonial.imageUrl && !currentTestimonial.videoUrl && (
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={currentTestimonial.imageUrl} 
                  alt="Testimonial" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            )}

            {/* Content Section */}
            <div className="p-8 md:p-12">
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <Quote className="w-16 h-16 text-indigo-200" />
              </div>

              {/* Text Content */}
              {currentTestimonial.text && (
                <div className="mb-8 text-center">
                  <p className="text-gray-700 leading-relaxed text-xl md:text-2xl font-light italic">
                    {currentTestimonial.text}
                  </p>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {currentTestimonial.name ? currentTestimonial.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-xl mb-1">
                    {currentTestimonial.name || 'Anonymous'}
                  </div>
                  {currentTestimonial.email && (
                    <div className="text-gray-500 text-sm">
                      {currentTestimonial.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="relative z-10 flex items-center justify-center pb-16">
        <div className="flex items-center gap-6">
          {/* Previous Button */}
          <button
            onClick={prevTestimonial}
            disabled={isTransitioning}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 font-medium text-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {/* Testimonial Indicators */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonialIndex 
                    ? 'bg-indigo-500 scale-125' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextTestimonial}
            disabled={isTransitioning}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 font-medium text-gray-700"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-600 text-sm font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
        {currentTestimonialIndex + 1} of {testimonials.length}
      </div>
    </div>
  );
};

export default TestimonialsDisplay;