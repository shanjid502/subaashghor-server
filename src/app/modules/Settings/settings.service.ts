import { SettingsModel } from './settings.model';

const getSettings = async () => {
  let settings = await SettingsModel.findOne();
  if (!settings) {
    settings = await SettingsModel.create({});
  }
  return settings;
};

const updateSettings = async (payload: any) => {
  let settings = await SettingsModel.findOne();
  if (!settings) {
    settings = await SettingsModel.create(payload);
  } else {
    settings = await SettingsModel.findByIdAndUpdate(settings._id, payload, {
      new: true,
      runValidators: true,
    });
  }
  return settings;
};

export const SettingsService = {
  getSettings,
  updateSettings,
};
