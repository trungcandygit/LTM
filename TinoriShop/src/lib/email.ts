import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_NAME = "Tinori Shop 🎀";
const FROM_EMAIL = process.env.SMTP_USER || "tinori@shop.com";

function wrapEmailHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #fdf2f8; }
        .container { max-width: 520px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(213,60,131,0.1); }
        .header { background: linear-gradient(135deg, #d53c83, #e91e8c); padding: 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .body { padding: 24px; color: #333; line-height: 1.7; }
        .body p { margin: 12px 0; }
        .highlight { background: #fdf2f8; border-left: 4px solid #d53c83; padding: 14px 18px; border-radius: 8px; margin: 16px 0; }
        .highlight p { margin: 4px 0; font-size: 14px; }
        .tracking-box { background: linear-gradient(135deg, #fdf2f8, #fce7f3); padding: 18px; border-radius: 12px; text-align: center; margin: 16px 0; }
        .tracking-code { font-size: 20px; font-weight: 800; color: #d53c83; letter-spacing: 1px; }
        .btn { display: inline-block; background: #d53c83; color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 8px 0; }
        .footer { background: #fdf2f8; padding: 16px 24px; text-align: center; font-size: 12px; color: #999; }
        .emoji { font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎀 Tinori Shop</h1>
        </div>
        <div class="body">
          ${content}
        </div>
        <div class="footer">
          <p>💕 Cảm ơn cậu đã ủng hộ Tinori!</p>
          <p>© Tinori Shop - Phụ kiện dễ thương</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email 1: Nhắc cọc (7 phút)
export async function sendDepositReminderEmail(to: string, orderCode: string) {
  if (!process.env.SMTP_USER) {
    console.log("[EMAIL] SMTP not configured, skipping deposit reminder for", orderCode);
    return;
  }

  const html = wrapEmailHtml(`
    <p>Chào cậu 💗</p>
    <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đang chờ đặt cọc <strong style="color:#d53c83">25.000đ</strong> để tụi mình giữ hàng nè ~</p>
    <div class="highlight">
      <p>⏰ Đơn hàng sẽ tự động hủy nếu không nhận được cọc trong <strong>15 phút</strong></p>
      <p>💳 Nội dung chuyển khoản: <strong>COC ${orderCode}</strong></p>
    </div>
    <p>Nếu bạn vẫn muốn mua, hãy chuyển khoản giúp tụi mình nha ✨</p>
    <p>Tinori đợi cậu 💕</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `⏰ Nhắc đặt cọc - Đơn hàng #${orderCode}`,
    html,
  });
  console.log("[EMAIL] Deposit reminder sent to", to, "for order", orderCode);
}

// Email 2: Hủy đơn (15 phút)
export async function sendOrderCancelledEmail(to: string, orderCode: string) {
  if (!process.env.SMTP_USER) {
    console.log("[EMAIL] SMTP not configured, skipping cancellation for", orderCode);
    return;
  }

  const html = wrapEmailHtml(`
    <p>Chào cậu 💗</p>
    <p>Do quá thời gian giữ đơn mà chưa nhận được cọc, đơn hàng <strong>#${orderCode}</strong> của bạn đã được huỷ rồi nè 😢</p>
    <div class="highlight">
      <p>❌ Đơn hàng <strong>#${orderCode}</strong> đã bị hủy do quá 15 phút chưa đặt cọc</p>
    </div>
    <p>Nếu vẫn muốn mua, bạn có thể đặt lại bất cứ lúc nào nha ✨</p>
    <p>Tinori luôn chờ cậu 💕</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `❌ Đơn hàng #${orderCode} đã bị hủy`,
    html,
  });
  console.log("[EMAIL] Order cancelled email sent to", to, "for order", orderCode);
}

// Email 3: Xác nhận đã nhận cọc + mã vận đơn
export async function sendDepositConfirmedEmail(
  to: string,
  orderCode: string,
  trackingCode: string,
  trackingLink?: string
) {
  if (!process.env.SMTP_USER) {
    console.log("[EMAIL] SMTP not configured, skipping deposit confirmed for", orderCode);
    return;
  }

  const trackingSection = trackingLink
    ? `<p style="text-align:center;margin-top:12px;"><a href="${trackingLink}" class="btn" style="color:white;">🔎 Theo dõi đơn hàng</a></p>`
    : "";

  const html = wrapEmailHtml(`
    <p>Chào cậu 💗</p>
    <p>Tinori đã nhận được tiền đặt cọc <strong style="color:#d53c83">25.000đ</strong> của bạn rồi nè ✨</p>
    <p>Đơn hàng của bạn đã được lên đơn vận chuyển:</p>
    <div class="tracking-box">
      <p style="margin:0;font-size:13px;color:#666;">🚚 Mã vận đơn</p>
      <p class="tracking-code">${trackingCode}</p>
      ${trackingSection}
    </div>
    <div class="highlight">
      <p>💰 Phần còn lại bạn thanh toán khi nhận hàng nha 💕</p>
    </div>
    <p>Cảm ơn cậu đã ủng hộ Tinori 🎀</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `✅ Đã nhận cọc - Đơn hàng #${orderCode} đang được giao`,
    html,
  });
  console.log("[EMAIL] Deposit confirmed email sent to", to, "for order", orderCode);
}

// Email 4: Xác nhận đơn hàng mới (gửi ngay khi đặt hàng)
export async function sendOrderConfirmationEmail(
  to: string,
  orderCode: string,
  customerName: string
) {
  if (!process.env.SMTP_USER) {
    console.log("[EMAIL] SMTP not configured, skipping order confirmation for", orderCode);
    return;
  }

  const html = wrapEmailHtml(`
    <p>Chào ${customerName} 💗</p>
    <p>Cảm ơn cậu đã đặt hàng tại Tinori! ✨</p>
    <div class="tracking-box">
      <p style="margin:0;font-size:13px;color:#666;">Mã đơn hàng</p>
      <p class="tracking-code">#${orderCode}</p>
    </div>
    <div class="highlight">
      <p>💳 Vui lòng đặt cọc <strong style="color:#d53c83">25.000đ</strong> trong vòng 15 phút</p>
      <p>📝 Nội dung chuyển khoản: <strong>COC ${orderCode}</strong></p>
      <p>⏰ Đơn sẽ tự động hủy nếu chưa nhận được cọc sau 15 phút</p>
    </div>
    <p>Tinori đợi cậu nha 💕</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `🎀 Xác nhận đơn hàng #${orderCode} - Tinori Shop`,
    html,
  });
  console.log("[EMAIL] Order confirmation sent to", to, "for order", orderCode);
}

// Email 5: Thông báo cho Admin có đơn mới
export async function sendNewOrderAdminEmail(orderCode: string, customerName: string, totalAmount: number) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) {
    console.log("[EMAIL] ADMIN_EMAIL not configured, skipping admin notification");
    return;
  }

  const html = wrapEmailHtml(`
    <p>🌟 <strong>Chủ shop ơi, có đơn hàng mới nè!</strong></p>
    <div class="highlight">
      <p>Mã đơn: <strong>#${orderCode}</strong></p>
      <p>Khách hàng: <strong>${customerName}</strong></p>
      <p>Tổng tiền: <strong>${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}</strong></p>
    </div>
    <p style="text-align:center;margin-top:12px;">
      <a href="${process.env.NEXTAUTH_URL}/admin/orders" class="btn" style="color:white;">🚀 Xem đơn ngay</a>
    </p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: adminEmail,
    subject: `🔔 CÓ ĐƠN HÀNG MỚI! #${orderCode}`,
    html,
  });
  console.log("[EMAIL] Admin notified for order", orderCode);
}

