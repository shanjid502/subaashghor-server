import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: config.smtp_port,
  secure: config.smtp_port === 465,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  if (!config.smtp_host) {
    // In dev without SMTP, just log
    console.log(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"Subaashghor" <${config.from_email}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const orderConfirmationEmail = (order: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: Array<{ name: string; ml: number; qty: number; price: number }>;
}) => ({
  subject: `Order Confirmed — ${order.orderNumber}`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;">
      <h2>🎉 Order Confirmed!</h2>
      <p>Hi <strong>${order.customerName}</strong>,</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th align="left">Product</th><th>Size</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>
          ${order.items.map((i) => `<tr><td>${i.name}</td><td>${i.ml}ml</td><td>${i.qty}</td><td>৳${i.price}</td></tr>`).join('')}
        </tbody>
      </table>
      <p><strong>Total: ৳${order.total}</strong></p>
      <p>We'll notify you when your order ships!</p>
      <p>— Subaashghor Team</p>
    </div>
  `,
});

export const passwordResetEmail = (resetUrl: string) => ({
  subject: 'Reset Your Password — Subaashghor',
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;">
      <h2>Password Reset</h2>
      <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    </div>
  `,
});
