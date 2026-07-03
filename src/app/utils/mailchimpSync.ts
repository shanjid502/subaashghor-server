import { SettingsModel } from '../modules/Settings/settings.model';
import logger from './logger';

/**
 * Syncs an email address to the Mailchimp audience list.
 * Reads API key and list ID from the Settings document.
 * Silently no-ops if credentials are not configured.
 */
export const syncToMailchimp = async (email: string): Promise<void> => {
  try {
    const settings = await SettingsModel.findOne().lean();
    const s = settings as any;
    const apiKey: string | undefined = s?.mailchimp?.apiKey;
    const listId: string | undefined = s?.mailchimp?.listId;

    if (!apiKey || !listId) {
      return; // Not configured — silently skip
    }

    // Mailchimp API datacenter is the suffix after the last dash in the key (e.g. us21)
    const dc = apiKey.split('-').pop();
    if (!dc) {
      logger.warn('Mailchimp: Could not parse datacenter from API key.');
      return;
    }

    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email.trim().toLowerCase(),
        status: 'subscribed',
      }),
    });

    if (res.status === 400) {
      const body = await res.json();
      // 400 with title "Member Exists" is fine — already subscribed
      if ((body as any).title !== 'Member Exists') {
        logger.warn(`Mailchimp sync error: ${JSON.stringify(body)}`);
      }
    } else if (!res.ok) {
      logger.warn(`Mailchimp sync failed: HTTP ${res.status}`);
    } else {
      logger.info(`Mailchimp: synced ${email}`);
    }
  } catch (err: any) {
    // Never throw — Mailchimp failure must not break subscriber flow
    logger.warn(`Mailchimp sync error: ${err?.message}`);
  }
};
