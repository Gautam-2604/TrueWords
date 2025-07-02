import { NextRequest, NextResponse} from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { TestimonialForm } from '@/models/testimonialForm';
import { CustomFormData } from '@/common/types';

export async function GET(
  request: NextRequest,
  context: {params: Promise<{slug: string}>}
) {
  try {
    // Connect to database
    await dbConnect();
    
    const { slug } = await context.params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Form slug is required' },
        { status: 400 }
      );
    }

    const form = await TestimonialForm.findOne({ 
      slug, 
      isActive: true 
    })
    .populate('organization', 'name email')
    .lean();

    if (!form || Array.isArray(form)) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Transform the data for client consumption
    const transformedForm = {
      //@ts-ignore
      _id: form._id.toString(),
      title: form.title,
      description: (form as unknown as CustomFormData).description,
      slug: form.slug,
      allowedTypes: form.allowedTypes,
      branding: {
        logoUrl: form.branding?.logoUrl || null,
        primaryColor: form.branding?.primaryColor || null,
        thankYouMessage: form.branding?.thankYouMessage || null,
      },
      responsesCount: form.responsesCount,
      isActive: form.isActive,
      organization: {
        _id: form.organization._id.toString(),
        name: form.organization.name,
        email: form.organization.email,
      },
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedForm);

  } catch (error) {
    console.error('Error fetching form:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: {params: Promise<{slug: string}>}
) {
  try {
    // Connect to database
    await dbConnect();
    
    const { slug } = await context.params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Form slug is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.slug || !body.allowedTypes) {
      return NextResponse.json(
        { error: 'Title, slug, and allowedTypes are required' },
        { status: 400 }
      );
    }

    // Validate allowedTypes array
    if (!Array.isArray(body.allowedTypes) || body.allowedTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one response type must be selected' },
        { status: 400 }
      );
    }

    // Validate allowed response types
    const validTypes = ['text', 'video', 'image', 'email'];
    const invalidTypes = body.allowedTypes.filter((type: string) => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid response types: ${invalidTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (body.slug !== slug) {
      const existingForm = await TestimonialForm.findOne({ 
        slug: body.slug,
        _id: { $ne: (await TestimonialForm.findOne({ slug }))._id }
      });
      
      if (existingForm) {
        return NextResponse.json(
          { error: 'A form with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      slug: body.slug.trim(),
      allowedTypes: body.allowedTypes,
      isActive: body.isActive !== undefined ? body.isActive : true,
      branding: {
        logoUrl: body.branding?.logoUrl?.trim() || null,
        primaryColor: body.branding?.primaryColor || '#3B82F6',
        thankYouMessage: body.branding?.thankYouMessage?.trim() || 'Thank you for your testimonial!'
      },
      updatedAt: new Date()
    };

    // Validate URL if logoUrl is provided
    if (updateData.branding.logoUrl) {
      try {
        new URL(updateData.branding.logoUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid logo URL format' },
          { status: 400 }
        );
      }
    }

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(updateData.branding.primaryColor)) {
      return NextResponse.json(
        { error: 'Invalid primary color format. Please use hex format (e.g., #3B82F6)' },
        { status: 400 }
      );
    }

    // Update the form
    const updatedForm = await TestimonialForm.findOneAndUpdate(
      { slug },
      updateData,
      { 
        new: true,
        runValidators: true
      }
    )
    .populate('organization', 'name email')
    .lean();

    if (!updatedForm || Array.isArray(updatedForm)) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Transform the data for client consumption
    const transformedForm = {
      //@ts-ignore
      _id: updatedForm._id.toString(),
      title: updatedForm.title,
      description: updatedForm.description,
      slug: updatedForm.slug,
      allowedTypes: updatedForm.allowedTypes,
      branding: {
        logoUrl: updatedForm.branding?.logoUrl || null,
        primaryColor: updatedForm.branding?.primaryColor || '#3B82F6',
        thankYouMessage: updatedForm.branding?.thankYouMessage || 'Thank you for your testimonial!',
      },
      responsesCount: updatedForm.responsesCount,
      isActive: updatedForm.isActive,
      organization: {
        _id: updatedForm.organization._id.toString(),
        name: updatedForm.organization.name,
        email: updatedForm.organization.email,
      },
      createdAt: updatedForm.createdAt.toISOString(),
      updatedAt: updatedForm.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedForm);

  } catch (error) {
    console.error('Error updating form:', error);
    
    // Handle mongoose validation errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'ValidationError'
    ) {
      const validationErrors = Object.values((error as unknown as { errors: Record<string, { message: string }> }).errors).map((err) => err.message);
      return NextResponse.json(
      { error: 'Validation failed', details: validationErrors },
      { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
      { error: 'A form with this slug already exists' },
      { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: {params: Promise<{slug: string}>}
) {
  try {
    // Connect to database
    await dbConnect();
    
    const { slug } = await context.params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Form slug is required' },
        { status: 400 }
      );
    }

    // First, check if the form exists
    const form = await TestimonialForm.findOne({ slug }).lean();
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    const deletedForm = await TestimonialForm.findOneAndDelete({ slug });

    if (!deletedForm) {
      return NextResponse.json(
        { error: 'Form not found or already deleted' },
        { status: 404 }
      );
    }

    

    // Return success response
    return NextResponse.json(
      { 
        message: 'Form deleted successfully',
        deletedForm: {
          _id: deletedForm._id.toString(),
          title: deletedForm.title,
          slug: deletedForm.slug
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting form:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}