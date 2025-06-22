import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'viewer'], default: 'admin' }
  }]
}, { timestamps: true });

export const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
