import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { QuestionModel, IQuestion } from './scentfinder.model';

const defaultQuestions: IQuestion[] = [
  {
    id: 'mood',
    prompt: { bn: 'আপনার পছন্দের মুড?', en: 'Your preferred mood?' },
    options: [
      { value: 'fresh', label: { bn: 'তরতাজা ও হালকা', en: 'Fresh & airy' } },
      { value: 'warm', label: { bn: 'উষ্ণ ও মিষ্টি', en: 'Warm & sweet' } },
      { value: 'floral', label: { bn: 'ফুলেল ও রোমান্টিক', en: 'Floral & romantic' } },
      { value: 'woody', label: { bn: 'কাঠের ও গভীর', en: 'Woody & deep' } },
    ],
  },
  {
    id: 'occasion',
    prompt: { bn: 'কোন উপলক্ষ্য?', en: 'What occasion?' },
    options: [
      { value: 'fresh', label: { bn: 'প্রতিদিনের অফিস', en: 'Daily office' } },
      { value: 'warm', label: { bn: 'সন্ধ্যার ডিনার', en: 'Evening dinner' } },
      { value: 'floral', label: { bn: 'বিবাহ ও উৎসব', en: '結婚 ও উৎসব' } }, // the original Bengali wedding option: বিবাহ ও উৎসব
      { value: 'woody', label: { bn: 'ব্যক্তিগত মুহূর্ত', en: 'Personal moments' } },
    ],
  },
  {
    id: 'season',
    prompt: { bn: 'প্রিয় ঋতু?', en: 'Favorite season?' },
    options: [
      { value: 'fresh', label: { bn: 'গ্রীষ্ম', en: 'Summer' } },
      { value: 'floral', label: { bn: 'বসন্ত', en: 'Spring' } },
      { value: 'warm', label: { bn: 'শীত', en: 'Winter' } },
      { value: 'woody', label: { bn: 'শরৎ', en: 'Autumn' } },
    ],
  },
  {
    id: 'intensity',
    prompt: { bn: 'কতটা তীব্রতা?', en: 'How intense?' },
    options: [
      { value: 'fresh', label: { bn: 'মৃদু', en: 'Subtle' } },
      { value: 'floral', label: { bn: 'মাঝারি', en: 'Moderate' } },
      { value: 'warm', label: { bn: 'শক্তিশালী', en: 'Strong' } },
      { value: 'woody', label: { bn: 'নাটকীয়', en: 'Dramatic' } },
    ],
  },
];

const seedDefaultQuestions = async () => {
  const count = await QuestionModel.countDocuments();
  if (count === 0) {
    // Modify one translation back to proper Bengali spelling matching original: বিবাহ ও উৎসব
    defaultQuestions[1].options[2].label.bn = 'বিবাহ ও উৎসব';
    await QuestionModel.insertMany(defaultQuestions);
  }
};

const getAllQuestions = async () => {
  // Ensure default questions are seeded
  await seedDefaultQuestions();
  const questions = await QuestionModel.find().sort({ createdAt: 1 });
  return questions;
};

const createQuestion = async (payload: IQuestion) => {
  const existing = await QuestionModel.findOne({ id: payload.id.trim().toLowerCase() });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, 'Question ID already exists');
  }

  const result = await QuestionModel.create(payload);
  return result;
};

const deleteQuestion = async (id: string) => {
  const result = await QuestionModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Question not found');
  }
  return result;
};

export const ScentFinderService = {
  seedDefaultQuestions,
  getAllQuestions,
  createQuestion,
  deleteQuestion,
};
