import config from '../config';
import logger from './logger';

export const sendDiscordOrderNotification = async (
  order: any,
): Promise<void> => {
  const webhookUrl = config.discord_webhook_url;

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    logger.info(
      '[Discord Notifier] No webhook URL configured. Skipping notification.',
    );
    return;
  }

  try {
    const itemsDescription = order.items
      .map((item: any, idx: number) => {
        return `${idx + 1}. **${item.name}** (${item.ml}ml) - Qty: ${item.qty} @ ৳${item.price}`;
      })
      .join('\n');

    const embed = {
      title: '🛍️ New Order Received!',
      description: `Order **${order.orderNumber}** has been successfully placed.`,
      color: 13938487, // Gold hex #d4af37 to decimal
      fields: [
        {
          name: 'Order Number',
          value: `\`${order.orderNumber}\``,
          inline: true,
        },
        {
          name: 'Total Amount',
          value: `**৳${order.total}**`,
          inline: true,
        },
        {
          name: 'Payment Method',
          value: order.paymentMethod.toUpperCase(),
          inline: true,
        },
        {
          name: 'Customer Details',
          value: `👤 **${order.shipping.name}**\n📞 ${order.shipping.phone}\n📧 ${order.shipping.email || 'N/A'}`,
          inline: false,
        },
        {
          name: 'Delivery Address',
          value: `📍 ${order.shipping.address}\n🗺️ ${order.shipping.area}, ${order.shipping.city}, ${order.shipping.district}`,
          inline: false,
        },
        {
          name: 'Order Items',
          value: itemsDescription || '_No items listed_',
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Subaash Ghor Notification System',
      },
    };

    const payload = {
      embeds: [embed],
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      logger.warn(
        `[Discord Notifier] Webhook failed with status ${res.status}`,
      );
    } else {
      logger.info(
        `[Discord Notifier] Notification sent for order ${order.orderNumber}`,
      );
    }
  } catch (err: any) {
    logger.error(
      `[Discord Notifier] Error sending notification: ${err.message}`,
    );
  }
};
