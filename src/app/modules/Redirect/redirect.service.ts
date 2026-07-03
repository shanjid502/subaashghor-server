import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { RedirectModel } from './redirect.model';

const getAllRedirects = async () => {
  return RedirectModel.find().sort({ createdAt: -1 });
};

const createRedirect = async (payload: { from: string; to: string; statusCode?: 301 | 302; note?: string }) => {
  const existing = await RedirectModel.findOne({ from: payload.from });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, `A redirect for "${payload.from}" already exists`);
  }
  return RedirectModel.create(payload);
};

const updateRedirect = async (id: string, payload: Partial<{ from: string; to: string; statusCode: 301 | 302; note: string }>) => {
  const result = await RedirectModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!result) throw new AppError(StatusCodes.NOT_FOUND, 'Redirect not found');
  return result;
};

const deleteRedirect = async (id: string) => {
  const result = await RedirectModel.findByIdAndDelete(id);
  if (!result) throw new AppError(StatusCodes.NOT_FOUND, 'Redirect not found');
  return { ok: true };
};

const resolveRedirect = async (fromPath: string) => {
  // Normalize leading slash
  const normalizedFrom = fromPath.startsWith('/') ? fromPath : `/${fromPath}`;
  const redirect = await RedirectModel.findOneAndUpdate(
    { from: normalizedFrom },
    { $inc: { hitCount: 1 } },
    { new: true }
  );
  return redirect;
};

export const RedirectService = {
  getAllRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  resolveRedirect,
};
