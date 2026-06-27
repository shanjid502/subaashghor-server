import { Schema, model } from 'mongoose';

export interface INewslatter {
  _id?: string;
  email: string;
  active?: boolean;
}

const newslatterSchema = new Schema<INewslatter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        delete ret.id;
        return ret;
      },
    },
  },
);

export const NewslatterModel = model<INewslatter>('Newslatter', newslatterSchema);
