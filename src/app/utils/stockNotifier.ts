import nodemailer from 'nodemailer';
import logger from './logger';

export const checkAndNotifyLowStock = async (product: any) => {
  const threshold = product.lowStockThreshold || 5;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@subaashghor.com';

  const lowStockVariants = product.sizes.filter((v: any) => v.stock < threshold);

  if (lowStockVariants.length === 0) return;

  const alertMessage = lowStockVariants
    .map(
      (v: any) =>
        `- Variant ${v.ml}ml (SKU: ${v.sku || 'N/A'}): Current Stock is ${v.stock} (Threshold: ${threshold})`
    )
    .join('\n');

  logger.warn(`[LOW STOCK ALERT] Product: "${product.name.en}" has low stock variants:\n${alertMessage}`);

  // Set up mail transport
  const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Subaash Ghor Alerts" <alerts@subaashghor.com>',
    to: adminEmail,
    subject: `⚠️ Low Stock Alert: ${product.name.en}`,
    text: `Hello Admin,\n\nThe following variants of "${product.name.en}" are running low on stock:\n\n${alertMessage}\n\nPlease restock them as soon as possible.\n\nBest regards,\nSubaash Ghor System`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 8px; overflow: hidden; background-color: #0b0f19; color: #f3f4f6;">
        <div style="background-color: #0d1527; padding: 20px; text-align: center; border-bottom: 2px solid #d4af37;">
          <h2 style="color: #d4af37; margin: 0; font-family: serif; font-size: 24px;">সুবাসঘর | Subaashghor</h2>
          <span style="font-size: 11px; color: #a3a3a3; letter-spacing: 2px; text-transform: uppercase;">Inventory Alert</span>
        </div>
        <div style="padding: 24px; line-height: 1.6;">
          <h3 style="color: #ef4444; margin-top: 0;">⚠️ Low Stock Warning</h3>
          <p>The following variants of <strong>${product.name.en}</strong> (${product.name.bn}) are running below the threshold of <strong>${threshold}</strong>:</p>
          <ul style="background: #141b2d; padding: 15px 20px; border-radius: 6px; list-style-type: none; border-left: 4px solid #ef4444;">
            ${lowStockVariants
              .map(
                (v: any) =>
                  `<li style="margin-bottom: 8px;"><strong>${v.ml}ml</strong> (SKU: <code>${v.sku || 'N/A'}</code>) &mdash; <span style="color: #ef4444; font-weight: bold;">${v.stock} remaining</span></li>`
              )
              .join('')}
          </ul>
          <p style="font-size: 13px; color: #a3a3a3; margin-top: 20px;">Please login to the admin dashboard to restock these variants.</p>
        </div>
        <div style="background-color: #0d1527; text-align: center; padding: 15px; font-size: 11px; color: #6b7280; border-top: 1px solid rgba(212, 175, 55, 0.15);">
          &copy; ${new Date().getFullYear()} Subaashghor. All rights reserved.
        </div>
      </div>
    `,
  };

  if (!smtpUser || !smtpPass) {
    logger.info(`[SMTP Not Configured] Low Stock Email alert content logged above. Configure SMTP_USER and SMTP_PASS env variables for live emails.`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail(mailOptions);
    logger.info(`[Email Sent] Low Stock email alert successfully sent to ${adminEmail}`);
  } catch (err: any) {
    logger.error(`[Email Failed] Error sending low stock email alert: ${err.message}`);
  }
};
