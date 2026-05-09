import { Document } from 'mongoose';

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

export interface ISignup {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  token: string;
  password: string;
}
