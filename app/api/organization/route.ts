import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Organization } from '@/models/organizationModel';

export async function POST(request: Request) {
  try {
    const { name, owner, members} = await request.json();

    console.log(name,"H", owner,"JHBjhbh", members );
    

    if (!name || !owner) {
      return NextResponse.json({ message: 'Name and Owner Required' }, { status: 400 });
    }

    await dbConnect();
    const newOrg = new Organization({
      name,
      owner,
      members
    });

   const myOrg = await newOrg.save();
   console.log(myOrg);
   

    return NextResponse.json({ message: 'Organization created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'No User' }, { status: 400 });
    }
    await dbConnect();

    const organizations = await Organization.find({ owner: userId });
    return NextResponse.json(
      { message: 'Organizations fetched successfully.', orgs: organizations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
