import { Schema, model } from 'mongoose';
import { IAddress } from './address.interface';

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
