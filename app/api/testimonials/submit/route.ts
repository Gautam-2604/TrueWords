
import { NextRequest, NextResponse } from 'next/server';
import { TestimonialResponse } from '@/models/testimonialResponse'; 
import { TestimonialForm } from '@/models/testimonialForm';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { dbConnect } from '@/lib/dbConnect';


const uploadDir = './public/uploads/testimonials';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


async function handleFileUpload(file: { filepath: any; originalFilename: any; mimetype?: string; }) {
  if (!file) return null;

  const fileExtension = path.extname(file.originalFilename || '');
  const fileName = `${uuidv4()}${fileExtension}`;
  const uploadPath = path.join(uploadDir, fileName);

  try {
    // Move file from temp location to upload directory
    await fs.promises.copyFile(file.filepath, uploadPath);
    await fs.promises.unlink(file.filepath); // Clean up temp file
    
    // Return the public URL
    return `/uploads/testimonials/${fileName}`;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    
    // Extract form fields
    const formId = formData.get('formId');
    const name = formData.get('name');
    const email = formData.get('email');
    const company = formData.get('company');
    const testimonial = formData.get('testimonial');
    const rating = formData.get('rating');
    
    // Get uploaded files
    const imageFile = formData.get('image');
    const videoFile = formData.get('video');

    // Validate required fields
    if (!formId || !name || !email || !testimonial) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the form exists and is active
    const form = await TestimonialForm.findById(formId);
    if (!form || !form.isActive) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    // Handle file uploads
    let imageUrl = null;
    let videoUrl = null;

    if (imageFile instanceof File && imageFile.size > 0) {
      // Convert File to formidable-like object for processing
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const tempPath = path.join(uploadDir, `temp_${uuidv4()}`);
      await fs.promises.writeFile(tempPath, buffer);
      
      const fileObj = {
        filepath: tempPath,
        originalFilename: imageFile.name,
        mimetype: imageFile.type
      };
      
      imageUrl = await handleFileUpload(fileObj);
    }

    if (videoFile instanceof File && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const tempPath = path.join(uploadDir, `temp_${uuidv4()}`);
      await fs.promises.writeFile(tempPath, buffer);
      
      const fileObj = {
        filepath: tempPath,
        originalFilename: videoFile.name,
        mimetype: videoFile.type
      };
      
      videoUrl = await handleFileUpload(fileObj);
    }

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
      imageUrl,
      videoUrl,
      approved: false, // Default to false for moderation
      metadata: {
        userAgent,
        ipAddress
      }
    });

    await testimonialResponse.save();

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

export async function GET(request: { url: string | URL; }, { params }: any) {
  try {
    await dbConnect();

    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const approvedOnly = searchParams.get('approved') !== 'false'; // Default to approved only

    // Find form by slug
    const form = await TestimonialForm.findOne({ slug, isActive: true });
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    const query: Record<string, any> = { form: form._id };
    if (approvedOnly) {
      query.approved = true;
    }

    const skip = (page - 1) * limit;

    // Get testimonials
    const [testimonials, total] = await Promise.all([
      TestimonialResponse.find(query)
        .select('name email company text rating imageUrl videoUrl createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TestimonialResponse.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        form: {
          _id: form._id,
          title: form.title,
          slug: form.slug,
          branding: form.branding
        },
        testimonials,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching testimonials by form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}