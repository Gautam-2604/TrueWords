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