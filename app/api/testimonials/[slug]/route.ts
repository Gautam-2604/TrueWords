import { dbConnect } from "@/lib/dbConnect";
import { TestimonialForm } from "@/models/testimonialForm";
import { TestimonialResponse } from "@/models/testimonialResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: {params:Promise<{slug: string}>}) {
  try {
    await dbConnect();

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const approvedOnly = searchParams.get('approved') !== 'false'; // Default to approved only

    // Find form by slug
    const form = await TestimonialForm.findOne({ slug, isActive: true });
    console.log(form, "Form");
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    const query: { form: typeof form._id; approved?: boolean } = { form: form._id };
if (approvedOnly) {
  query.approved = true;
}

    const skip = (page - 1) * limit;

    const [testimonials, total] = await Promise.all([
      TestimonialResponse.find(query)
        .select('name email company text rating imageUrl videoUrl createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TestimonialResponse.countDocuments(query)
    ]);

    console.log(testimonials, "Testimonials");
    

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