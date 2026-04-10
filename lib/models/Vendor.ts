import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description: string;
  city: string;
  serviceRadiusKm: number;
  shopAddress: string;
  experienceYears: number;
  isVerified: boolean;
  rating: number;
  totalBookings: number;
  workingHours: string;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    serviceRadiusKm: { type: Number, default: 10 },
    shopAddress: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalBookings: { type: Number, default: 0 },
    workingHours: { type: String, default: '09:00-18:00' },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);
