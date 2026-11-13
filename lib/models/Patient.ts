import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPatient extends Document {
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';
  condition: string;
  assignedDoctorId?: Types.ObjectId | null;
  hospital?: string;
  address?: string;
  notes?: string;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: {
      type: String,
      enum: ['Female', 'Male', 'Non-binary', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    condition: { type: String, required: true, trim: true, index: true },
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', default: null, index: true },
    hospital: { type: String, default: '' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
    registrationDate: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searching, filtering & pagination
PatientSchema.index({ fullName: 'text', condition: 'text', phone: 'text' });
PatientSchema.index({ assignedDoctorId: 1, registrationDate: -1 });
PatientSchema.index({ condition: 1, registrationDate: -1 });

const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;

