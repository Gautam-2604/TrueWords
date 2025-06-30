
import { NextRequest, NextResponse } from 'next/server';
import { TestimonialResponse } from '@/models/testimonialResponse'; 
import { TestimonialForm } from '@/models/testimonialForm';
import formidable from 'formidable';
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

// For Pages Router (pages/api/testimonials/submit.js)
export default async function handler(req: { method: string; headers: { [x: string]: any; }; connection: { remoteAddress: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; success?: boolean; message?: string; id?: any; }): void; new(): any; }; }; }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Parse form data with formidable
    const [fields, files]: [any, any] = await new Promise((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Extract form fields (formidable returns arrays)
    const formId = Array.isArray(fields.formId) ? fields.formId[0] : fields.formId;
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const company = Array.isArray(fields.company) ? fields.company[0] : fields.company;
    const testimonial = Array.isArray(fields.testimonial) ? fields.testimonial[0] : fields.testimonial;
    const rating = Array.isArray(fields.rating) ? fields.rating[0] : fields.rating;

    // Validate required fields
    if (!formId || !name || !email || !testimonial) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the form exists and is active
    const form = await TestimonialForm.findById(formId);
    if (!form || !form.isActive) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    // Handle file uploads
    let imageUrl = null;
    let videoUrl = null;

    if (files.image) {
      const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
      imageUrl = await handleFileUpload(imageFile);
    }

    if (files.video) {
      const videoFile = Array.isArray(files.video) ? files.video[0] : files.video;
      videoUrl = await handleFileUpload(videoFile);
    }

    // Get client metadata
    const userAgent = req.headers['user-agent'] || '';
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     'unknown';

    // Create testimonial response
    const testimonialResponse = new TestimonialResponse({
      form: formId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || undefined,
      text: testimonial.trim(),
      rating: rating ? parseInt(rating) : undefined,
      imageUrl,
      videoUrl,
      approved: false,
      metadata: {
        userAgent,
        ipAddress
      }
    });

    await testimonialResponse.save();

    res.status(200).json({
      success: true,
      message: 'Testimonial submitted successfully',
      id: testimonialResponse._id
    });

  } catch (error) {
    console.error('Testimonial submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}