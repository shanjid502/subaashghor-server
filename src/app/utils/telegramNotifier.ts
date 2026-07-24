import config from '../config';
import logger from './logger';

/**
 * Sends a rich order notification to a Telegram chat via the Bot API.
 *
 * Requirements (set in .env):
 *   TELEGRAM_BOT_TOKEN  — token from @BotFather
 *   TELEGRAM_CHAT_ID    — your personal or group chat ID
 *
 * Never throws — failure must not block the order response.
 */
export const sendTelegramOrderNotification = async (order: any): Promise<void> => {
  const botToken = config.telegram_bot_token;
  const chatId = config.telegram_chat_id;

  if (!botToken || !chatId) {
    logger.info('[Telegram Notifier] BOT_TOKEN or CHAT_ID not configured. Skipping.');
    return;
  }

  try {
    const itemLines = (order.items as any[])
      .map((item, idx) => `  ${idx + 1}. ${item.name} (${item.ml}ml) × ${item.qty} — ৳${item.price * item.qty}`)
      .join('\n');

    const paymentLabel =
      order.paymentMethod === 'bkash' ? '📲 bKash' : '💵 Cash on Delivery';

    const message = [
      `🛍️ <b>New Order — ${order.orderNumber}</b>`,
      ``,
      `👤 <b>Customer</b>`,
      `   Name  : ${order.shipping?.name || 'N/A'}`,
      `   Phone : ${order.shipping?.phone || 'N/A'}`,
      `   Email : ${order.shipping?.email || 'N/A'}`,
      ``,
      `📦 <b>Items</b>`,
      itemLines,
      ``,
      `📍 <b>Delivery Address</b>`,
      `   ${order.shipping?.address || 'N/A'}`,
      `   ${[order.shipping?.area, order.shipping?.city, order.shipping?.district].filter(Boolean).join(', ')}`,
      ``,
      `💳 <b>Payment</b>     : ${paymentLabel}`,
      `🏷️ <b>Subtotal</b>    : ৳${order.subtotal}`,
      order.discount > 0 ? `🎟️ <b>Discount</b>    : −৳${order.discount}` : null,
      `🚚 <b>Shipping Fee</b>: ৳${order.shippingFee}`,
      `✅ <b>Total</b>       : ৳${order.total}`,
      ``,
      `🕐 ${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}`,
      ``,
      `<i>সুবাসঘর — Discover Your Signature Scent</i>`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.warn(`[Telegram Notifier] Failed (HTTP ${res.status}): ${body}`);
    } else {
      logger.info(`[Telegram Notifier] Notification sent for order ${order.orderNumber}`);
    }
  } catch (err: any) {
    logger.error(`[Telegram Notifier] Error: ${err?.message}`);
  }
};
