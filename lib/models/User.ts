import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  emailVerified: boolean;
  role: 'user' | 'vendor' | 'admin';
  city: string;
  addresses: Array<{
    label: string;
    addressLine: string;
    city: string;
    pincode: string;
    locationCoords?: { lat: number; lng: number };
  }>;
  profileCompleted: boolean;
  isActive: boolean;           // 🔴 new field
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
    city: { type: String, required: true },
    addresses: [
      {
        label: String,
        addressLine: String,
        city: String,
        pincode: String,
        locationCoords: { lat: Number, lng: Number },
      },
    ],
    profileCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // 🔴 new field with default
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);