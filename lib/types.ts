type Member = {
  user: {
    name: string;
  };
  role: string;
};

export type Organization = {
  _id: string;
  name: string;
  members: Member[];
  createdAt: string;
  formsCount: number;
  testimonialsCount: number;
};

export type ProcessedTestimonialForm = {
  id: string;
  title: string;
  description?: string;
  organizationId: string;
  organizationName: string;
  allowedTypes: ('text' | 'image' | 'video')[];
  slug: string;
  responsesCount: number;
  createdAt: string; // ISO string
  isActive: boolean;
};
