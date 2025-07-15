
import { NextRequest, NextResponse } from 'next/server';
import { TestimonialResponse } from '@/models/testimonialResponse'; 
import { TestimonialForm } from '@/models/testimonialForm';
import fs from 'fs';
import { dbConnect } from '@/lib/dbConnect';

const uploadDir = './public/uploads/testimonials';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    console.log(formData);
    
    
    const formId = formData.get('formId');
    const name = formData.get('name');
    const email = formData.get('email');
    const company = formData.get('company');
    const testimonial = formData.get('testimonial');
    const rating = formData.get('rating');
    const videoFile = formData.get('videoUrl');

    console.log(videoFile, "VideoFile");
    

    if (!formId || !name || !email || !testimonial) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const form = await TestimonialForm.findById(formId);
    if (!form || !form.isActive) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }
    console.log("Form", form);
    

   

    // Get client metadata
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Create testimonial response
    const testimonialResponse = new TestimonialResponse({
      form: formId,
      name: typeof name === 'string' ? name.trim() : '',
      email: typeof email === 'string' ? email.trim().toLowerCase() : '',
      company: typeof company === 'string' ? company.trim() : undefined,
      text: typeof testimonial === 'string' ? testimonial.trim() : '',
      rating: typeof rating === 'string' ? parseInt(rating) : undefined,
      approved: false, // Default to false for moderation
      videoUrl: videoFile,
      metadata: {
        userAgent,
        ipAddress
      }
    });

    console.log(testimonialResponse, "Repsonse");
    

    await testimonialResponse.save();
    console.log(form.responsesCount);
    
    form.responsesCount = (form.responsesCount || 0) + 1;
    console.log(form.responsesCount, "Response");
    
    await form.save();

    return NextResponse.json({
      success: true,
      message: 'Testimonial submitted successfully',
      id: testimonialResponse._id
    });

  } catch (error) {
    console.error('Testimonial submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

