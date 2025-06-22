import mongoose from 'mongoose';

const embedSnippetSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'TestimonialForm', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  displayType: { type: String, enum: ['carousel', 'grid', 'list'], default: 'carousel' },
  theme: {
    backgroundColor: String,
    textColor: String,
    borderRadius: Number
  },
  embedId: { type: String, unique: true }
}, { timestamps: true });

export const EmbedSnippet =  mongoose.models.EmbedSnippet || mongoose.model('EmbedSnippet', embedSnippetSchema);
