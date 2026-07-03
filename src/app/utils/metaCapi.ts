import { createHash } from 'crypto';
import { SettingsModel } from '../modules/Settings/settings.model';
import { generateEventId } from './eventId';
import logger from './logger';

const hashSHA256 = (value: string): string =>
  createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

interface CAPIEventPayload {
  orderId: string;
  total: number;
  currency?: string;
  email?: string;
  phone?: string;
  ipAddress?: string;
  userAgent?: string;
  fbclid?: string;
}

/**
 * Sends a Purchase event to the Meta Conversions API (CAPI).
 * Reads pixel ID and access token from the Settings document.
 * Silently no-ops if credentials are not configured.
 */
export const sendMetaPurchaseEvent = async (data: CAPIEventPayload): Promise<void> => {
  try {
    const settings = await SettingsModel.findOne().lean();
    const s = settings as any;
    const pixelId: string | undefined = s?.pixels?.fbPixel;
    const accessToken: string | undefined = s?.pixels?.fbCapiToken;

    if (!pixelId || !accessToken) {
      return; // Not configured — silently skip
    }

    const eventId = generateEventId();
    const eventTime = Math.floor(Date.now() / 1000);

    const userData: Record<string, string> = {};
    if (data.email) userData.em = hashSHA256(data.email);
    if (data.phone) userData.ph = hashSHA256(data.phone.replace(/[^0-9]/g, ''));
    if (data.ipAddress) userData.client_ip_address = data.ipAddress;
    if (data.userAgent) userData.client_user_agent = data.userAgent;
    if (data.fbclid) userData.fbc = `fb.1.${Date.now()}.${data.fbclid}`;

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: eventTime,
          event_id: eventId,
          action_source: 'website',
          user_data: userData,
          custom_data: {
            order_id: data.orderId,
            value: data.total,
            currency: data.currency || 'BDT',
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errBody = await res.text();
      logger.warn(`Meta CAPI error: HTTP ${res.status} — ${errBody}`);
    } else {
      logger.info(`Meta CAPI: Purchase event sent for order ${data.orderId}, eventId: ${eventId}`);
    }
  } catch (err: any) {
    // Never throw — CAPI failure must not break order confirmation
    logger.warn(`Meta CAPI error: ${err?.message}`);
  }
};
