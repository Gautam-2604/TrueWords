'use client'
import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Filter, Search, Eye, Check, X, Trash2, Image, Video, Calendar, User, Mail, Building } from 'lucide-react';

type Testimonial = {
  _id: string;
  name: string;
  company?: string;
  rating?: number;
  approved: boolean;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
};

const TestimonialDisplay = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Filters
  const [filters, setFilters] = useState({
    formSlug: '',
    approved: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Admin mode
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // Stats
  const [stats, setStats] = useState<any>(null);
  
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 'grid' or 'list'

  // Fetch testimonials
  const fetchTestimonials = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      if (filters.formSlug) params.append('formSlug', filters.formSlug);
      if (filters.approved !== 'all') params.append('approved', filters.approved);
      
      const response = await fetch(`/api/testimonials?${params}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setTestimonials(data.data.testimonials);
      setPagination(data.data.pagination);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // Update testimonial approval status
  const updateApprovalStatus = async (id: any, approved: boolean) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });
      
      if (!response.ok) throw new Error('Failed to update testimonial');
      
      // Refresh testimonials
      fetchTestimonials(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete testimonial
  const deleteTestimonial = async (id: any) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete testimonial');
      
      fetchTestimonials(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedTestimonials.length === 0) return;
    
    if (bulkAction === 'delete' && !confirm(`Delete ${selectedTestimonials.length} testimonials?`)) return;
    
    try {
      const response = await fetch('/api/testimonials/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          testimonialIds: selectedTestimonials
        })
      });
      
      if (!response.ok) throw new Error('Bulk operation failed');
      
      setSelectedTestimonials([]);
      setBulkAction('');
      fetchTestimonials(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Effects
  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.search) {
        // Filter testimonials client-side for search
        // In a real app, you'd want to implement server-side search
        fetchTestimonials(1);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [filters.search]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAdminMode 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isAdminMode ? 'Exit Admin' : 'Admin Mode'}
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>

       

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Slug</label>
              <input
                type="text"
                value={filters.formSlug}
                onChange={(e) => setFilters({...filters, formSlug: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter form slug"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.approved}
                onChange={(e) => setFilters({...filters, approved: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search testimonials..."
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {isAdminMode && selectedTestimonials.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedTestimonials.length} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose action...</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Testimonials */}
      {!loading && testimonials.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'p-4' : 'p-6'
              }`}
            >
              {/* Admin checkbox */}
              {isAdminMode && (
                <div className="mb-3">
                  <input
                    type="checkbox"
                    checked={selectedTestimonials.includes(testimonial._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTestimonials([...selectedTestimonials, testimonial._id]);
                      } else {
                        setSelectedTestimonials(selectedTestimonials.filter(id => id !== testimonial._id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    {testimonial.company && (
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {testimonial.rating && renderStars(testimonial.rating)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    testimonial.approved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {testimonial.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{testimonial.text}</p>
              </div>

              {/* Media */}
              {(testimonial.imageUrl || testimonial.videoUrl) && (
                <div className="mb-4 flex gap-2">
                  {testimonial.imageUrl && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Image className="w-4 h-4" />
                      <span>Image</span>
                    </div>
                  )}
                  {testimonial.videoUrl && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(testimonial.createdAt)}</span>
                </div>
                
                {isAdminMode && (
                  <div className="flex gap-2">
                    {!testimonial.approved && (
                      <button
                        onClick={() => updateApprovalStatus(testimonial._id, true)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {testimonial.approved && (
                      <button
                        onClick={() => updateApprovalStatus(testimonial._id, false)}
                        className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                        title="Unapprove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTestimonial(testimonial._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && testimonials.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && testimonials.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => fetchTestimonials(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => fetchTestimonials(page)}
                    className={`w-10 h-10 rounded-lg ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => fetchTestimonials(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialDisplay;