import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
}, { timestamps: true });

export const User =  mongoose.models.User || mongoose.model('User', userSchema);
