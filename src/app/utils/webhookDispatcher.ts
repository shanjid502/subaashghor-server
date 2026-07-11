import { SettingsModel } from '../modules/Settings/settings.model';
import logger from './logger';

/**
 * Fires a POST request to the admin-configured webhook URL (Zapier / Make.com)
 * with the provided payload. Silently no-ops if no webhook URL is configured.
 */
export const dispatchWebhook = async (event: string, payload: Record<string, any>): Promise<void> => {
  try {
    const settings = await SettingsModel.findOne().lean({ getters: true });
    const webhookUrl = (settings as any)?.webhookUrl as string | undefined;

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      return; // No webhook configured — silently skip
    }

    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    });

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!res.ok) {
      logger.warn(`Webhook dispatch failed for event "${event}": HTTP ${res.status}`);
    } else {
      logger.info(`Webhook dispatched: ${event}`);
    }
  } catch (err: any) {
    // Never throw — webhook failure must not break order flow
    logger.warn(`Webhook error for event "${event}": ${err?.message}`);
  }
};
