import { Schema, model } from 'mongoose';
import { IQuestion, IQuestionOption } from './scentfinder.interface';

const questionOptionSchema = new Schema<IQuestionOption>({
  value: {
    type: String,
    enum: ['fresh', 'warm', 'floral', 'woody'],
    required: true,
  },
  label: {
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
}, { _id: false });

const questionSchema = new Schema<IQuestion>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    prompt: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    options: {
      type: [questionOptionSchema],
      required: true,
      validate: {
        validator: function (val: IQuestionOption[]) {
          return val.length === 4;
        },
        message: 'A question must have exactly 4 options',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        return ret;
      },
    },
  },
);

export const QuestionModel = model<IQuestion>('ScentFinderQuestion', questionSchema);
