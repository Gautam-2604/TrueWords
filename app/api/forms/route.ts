import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { Organization } from '@/models/organizationModel';
import { User } from '@/models/userModel';
import { TestimonialForm } from '@/models/testimonialForm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid or missing user ID' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ message: 'No such user exists' }, { status: 404 });
    }

    const orgs = await Organization.find({ owner: userId }).lean();
    if (!orgs.length) {
      return NextResponse.json([], { status: 200 }); // Return empty array instead of error
    }

    const orgIds = orgs.map(org => org._id);
    const forms = await TestimonialForm.find({ organization: { $in: orgIds } }).lean();

    // Create a map for quick organization lookup
    const orgMap = orgs.reduce((acc, org) => {
      //@ts-expect-error: some error
      acc[org._id.toString()] = org.name;
      return acc;
    }, {});

    // Return flat array of forms with organization name included
    const flatForms = forms.map(form => ({
      id: form._id,
      title: form.title,
      description: form.description,
      organizationId: form.organization,
      //@ts-expect-error: some error
      organizationName: orgMap[form.organization.toString()],
      slug: form.slug,
      allowedTypes: form.allowedTypes,
      responsesCount: form.responsesCount ?? 0,
      createdAt: form.createdAt,
      isActive: form.isActive ?? true,
    }));

    return NextResponse.json(flatForms, { status: 200 });

  } catch (error) {
    console.error('Error retrieving testimonial forms:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}