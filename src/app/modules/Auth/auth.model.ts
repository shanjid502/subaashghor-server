import { Schema, model } from 'mongoose';
import { TUserRole } from './auth.interface';

// Extend this schema to fit your user requirements
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['ADMIN', 'USER'] satisfies TUserRole[], default: 'USER' },
  },
  { timestamps: true },
);

export const UserModel = model('User', userSchema);
