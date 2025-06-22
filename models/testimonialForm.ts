import mongoose from 'mongoose';

const testimonialFormSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  description: { type: String },
  allowedTypes: [{ type: String, enum: ['text', 'image', 'video'] }],
  branding: {
    logoUrl: String,
    primaryColor: String,
    thankYouMessage: String
  },
  slug: { type: String, unique: true },
}, { timestamps: true });

export const TestimonialForm = mongoose.models.TestimonialForm || mongoose.model('TestimonialForm', testimonialFormSchema);
