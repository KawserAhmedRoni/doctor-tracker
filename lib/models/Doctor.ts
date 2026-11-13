import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true, index: true },
    specialization: { type: String, required: true, trim: true, index: true },
    hospital: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    avatarUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// MongoDB indexing for searching, filtering & sorting performance optimization (per spec requirement)
DoctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });
DoctorSchema.index({ createdAt: -1 });

const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;

