import mongoose from 'mongoose';

const testimonialResponseSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'TestimonialForm', required: true },
  name: String,
  email: String,
  text: String,
  imageUrl: String,
  videoUrl: String,
  approved: { type: Boolean, default: false },
  metadata: {
    userAgent: String,
    ipAddress: String
  }
}, { timestamps: true });

export const TestimonialResponse = mongoose.models.TestimonialResponse || mongoose.model('TestimonialResponse', testimonialResponseSchema);
