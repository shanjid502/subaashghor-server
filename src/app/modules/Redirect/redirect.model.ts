import { Schema, model } from 'mongoose';
import { IRedirect } from './redirect.interface';

const redirectSchema = new Schema<IRedirect>(
  {
    from: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      // Ensure leading slash
      set: (v: string) => (v.startsWith('/') ? v : `/${v}`),
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      enum: [301, 302],
      default: 301,
    },
    note: { type: String, default: '' },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const RedirectModel = model<IRedirect>('Redirect', redirectSchema);
