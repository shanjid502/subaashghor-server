import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { AddressModel } from './address.model';

const getAddresses = async (userId: string) => {
  return AddressModel.find({ userId }).lean();
};

const addAddress = async (userId: string, payload: object) => {
  const address = await AddressModel.create({ ...payload, userId });
  return address;
};

const updateAddress = async (
  userId: string,
  addressId: string,
  payload: object,
) => {
  const address = await AddressModel.findOneAndUpdate(
    { _id: addressId, userId },
    payload,
    { new: true },
  );
  if (!address) throw new AppError(StatusCodes.NOT_FOUND, 'Address not found.');
  return address;
};

const deleteAddress = async (userId: string, addressId: string) => {
  await AddressModel.findOneAndDelete({ _id: addressId, userId });
  return { ok: true };
};

const setDefaultAddress = async (userId: string, addressId: string) => {
  await AddressModel.updateMany({ userId }, { isDefault: false });
  await AddressModel.findOneAndUpdate(
    { _id: addressId, userId },
    { isDefault: true },
  );
  return AddressModel.find({ userId }).lean();
};

export const AddressService = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
