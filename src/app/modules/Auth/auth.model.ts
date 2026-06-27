import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAddress {
  label?: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  isDefault?: boolean;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
  addresses: IAddress[];
  signatureScent?: {
    winner: 'fresh' | 'warm' | 'floral' | 'woody';
    answers: Array<{ qid: string; value: string }>;
    recommendedSlugs: string[];
    couponCode?: string;
    takenAt: Date;
  };
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(plainPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    avatarUrl: {
      type: String,
    },
    addresses: [
      {
        label: String,
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        area: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        postcode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    signatureScent: {
      winner: { type: String, enum: ['fresh', 'warm', 'floral', 'woody'] },
      answers: [{ qid: String, value: String }],
      recommendedSlugs: [String],
      couponCode: String,
      takenAt: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        delete ret.passwordHash;
        delete ret.id;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return;
  }
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function (
  plainPassword: string,
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

export const UserModel = model<IUser>('User', userSchema);

// OtpToken schema for mobile logins
export interface IOtpToken {
  phone: string;
  codeHash: string;
  purpose: 'login' | 'signup' | 'verify';
  attempts: number;
  expiresAt: Date;
  consumedAt?: Date;
}

const otpTokenSchema = new Schema<IOtpToken>(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ['login', 'signup', 'verify'], required: true },
    attempts: { type: Number, default: 0, max: 5 },
    expiresAt: { type: Date, required: true },
    consumedAt: Date,
  },
  { timestamps: true },
);

// TTL index to automatically delete expired OTPs
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpTokenModel = model<IOtpToken>('OtpToken', otpTokenSchema);
