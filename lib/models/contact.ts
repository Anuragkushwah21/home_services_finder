import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status: 'new' | 'read' | 'replied' | 'resolved';
  reply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['new', 'read', 'replied', 'resolved'], default: 'new' },
    reply: { type: String },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
