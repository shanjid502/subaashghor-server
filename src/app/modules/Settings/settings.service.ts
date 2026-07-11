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
    // Retain existing database values if the payload sends masked placeholders ("********")
    if (payload.pixels && payload.pixels.fbCapiToken === '********') {
      payload.pixels.fbCapiToken = settings.pixels?.fbCapiToken;
    }
    if (payload.mailchimp && payload.mailchimp.apiKey === '********') {
      payload.mailchimp.apiKey = settings.mailchimp?.apiKey;
    }
    if (payload.webhookUrl === '********') {
      payload.webhookUrl = settings.webhookUrl;
    }

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
