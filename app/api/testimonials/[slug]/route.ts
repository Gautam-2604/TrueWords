import { dbConnect } from "@/lib/dbConnect";
import { TestimonialForm } from "@/models/testimonialForm";
import { TestimonialResponse } from "@/models/testimonialResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: {params:Promise<{slug: string}>}) {
  try {
    await dbConnect();

    const { slug } = await params;

    const form = await TestimonialForm.findOne({ slug, isActive: true });
    console.log(form, "Form");
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    const testimonials = await TestimonialResponse.find({form: form._id})
    console.log(testimonials, "Testimonials")
    return NextResponse.json({
      testimonials
    });

  } catch (error) {
    console.error('Error fetching testimonials by form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}