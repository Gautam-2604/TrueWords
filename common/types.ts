import { Types } from 'mongoose';
export type Branding = {
  logoUrl?: string;
  primaryColor?: string;
  thankYouMessage?: string;
};

export type CustomFormData = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  allowedTypes: string[];
  branding: Branding;
   responsesCount: number;
  isActive: boolean;
  organization: {
    _id: string;
    name: string;
    email: string;
  };

  createdAt: string;
  updatedAt: string;
};




export type User = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  organizations: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

export type TestimonialResponse = {
  _id: Types.ObjectId;
  form: Types.ObjectId;
  name?: string;
  email?: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  approved: boolean;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};


export type TestimonialForm = {
  _id: Types.ObjectId;
  organization: Types.ObjectId;
  title: string;
  description?: string;
  allowedTypes?: Array<'text' | 'image' | 'video'>;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    thankYouMessage?: string;
  };
  slug?: string;
  responsesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Organization = {
  _id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  members: Array<{
    user: Types.ObjectId;
    role: 'admin' | 'viewer';
  }>;
  createdAt: Date;
  updatedAt: Date;
};


export type EmbedSnippet = {
  _id: Types.ObjectId;
  form: Types.ObjectId;
  organization: Types.ObjectId;
  displayType: 'carousel' | 'grid' | 'list';
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
  };
  embedId?: string;
  createdAt: Date;
  updatedAt: Date;
};



