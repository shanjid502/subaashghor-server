import { Schema, model, Document } from 'mongoose';

export interface IAddress extends Document {
  userId: string;
  label?: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  isDefault: boolean;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: String, required: true },
    label: String,
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    area: String,
    city: String,
    district: { type: String, required: true },
    postcode: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ userId: 1 });

export const AddressModel = model<IAddress>('Address', addressSchema);
