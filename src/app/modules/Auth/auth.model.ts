import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { IUser } from './auth.interface';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
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
// Using any for 'this' and explicit signature for 'next' to resolve Mongoose v9 TS2349 errors
userSchema.pre('save', function (this: any, next: any) {
  const doc = this;
  if (!doc.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(config.bcrypt_salt_rounds, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(doc.password, salt, (err, hash) => {
      if (err) return next(err);
      doc.password = hash;
      next();
    });
  });
});

export const UserModel = model<IUser>('User', userSchema);
