import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  bookingType: 'home' | 'shop';
  bookingDate: Date;
  bookingTime: string;
  address: {
    addressLine: string;
    city: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  notes: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  paymentStatus: 'unpaid' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    bookingType: { type: String, enum: ['home', 'shop'], required: true },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true },
    address: {
      addressLine: String,
      city: String,
      pincode: String,
      coordinates: { lat: Number, lng: Number },
    },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    price: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
