import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'customer' | 'admin';
  avatar?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: { type: String },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// Hash password before save
userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = this as any;
  if (!doc.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(config.bcrypt_salt_rounds);
    doc.password = await bcrypt.hash(doc.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

export const UserModel = model<IUser>('User', userSchema);
