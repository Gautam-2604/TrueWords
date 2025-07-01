import { NextResponse } from 'next/server';
import { TestimonialForm } from '@/models/testimonialForm';
import { Organization } from '@/models/organizationModel';
import { dbConnect } from '@/lib/dbConnect';

// Generate a unique slug from title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const ensureUniqueSlug = async (baseSlug: string) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (await TestimonialForm.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      organization, 
      title, 
      description, 
      allowedTypes, 
      branding,
      userId 
    } = body;

    if (!organization || !title || !userId) {
      return NextResponse.json(
        { error: 'Organization, title, and userId are required' },
        { status: 400 }
      );
    }

    if (!allowedTypes || !Array.isArray(allowedTypes) || allowedTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one allowed type must be specified' },
        { status: 400 }
      );
    }

    const validTypes = ['text', 'image', 'video'];
    const invalidTypes = allowedTypes.filter(type => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid types: ${invalidTypes.join(', ')}. Valid types are: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    const orgExists = await Organization.findOne({ 
      _id: organization,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    if (!orgExists) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      );
    }

    const baseSlug = generateSlug(title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    const formData = {
      organization,
      title: title.trim(),
      description: description?.trim() || '',
      allowedTypes,
      slug: uniqueSlug,
      branding: {
        logoUrl: branding?.logoUrl?.trim() || '',
        primaryColor: branding?.primaryColor || '#3b82f6',
        thankYouMessage: branding?.thankYouMessage?.trim() || 'Thank you for your testimonial! We appreciate your feedback.'
      }
    };

    // Create the form
    const newForm = new TestimonialForm(formData);
    await newForm.save();

    // Populate organization data for response
    await newForm.populate('organization', 'name');

    return NextResponse.json(
      {
        success: true,
        message: 'Form created successfully',
        data: {
          id: newForm._id,
          title: newForm.title,
          description: newForm.description,
          slug: newForm.slug,
          allowedTypes: newForm.allowedTypes,
          branding: newForm.branding,
          organization: newForm.organization,
          createdAt: newForm.createdAt,
          updatedAt: newForm.updatedAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating form:', error);
    
    
    

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
