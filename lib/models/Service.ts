import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  _id: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  serviceType: 'home' | 'shop' | 'both';
  basePrice: number;
  priceUnit: string;
  durationMinutes: number;
  tags: string[];
  rating: number;
  totalBookings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    serviceType: { type: String, enum: ['home', 'shop', 'both'], required: true },
    basePrice: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, default: 'per service' },
    durationMinutes: { type: Number, required: true },
    tags: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalBookings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
