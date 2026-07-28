const nodemailer = require('nodemailer');

/**
 * Creates Nodemailer Transporter using Brevo (Sendinblue) SMTP configuration
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If live credentials are placeholder/missing, fallback to development preview logger
  if (!user || user.includes('example.com') || !pass || pass === 'your_brevo_smtp_key') {
    return {
      sendMail: async (options) => {
        console.log(`[Brevo SMTP Preview Logger] Email to: ${options.to} | Subject: "${options.subject}"`);
        return { messageId: 'brevo-preview-' + Date.now(), accepted: [options.to], rejected: [] };
      }
    };
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

/**
 * Base Core Reusable Email Dispatcher
 */
const sendMail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || '"FitZone Gym" <info@fitzonegym.com>';

    const mailOptions = {
      from,
      to,
      subject,
      html,
      text: text || ''
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Brevo Email Sent] Target: ${to} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    console.error(`[Brevo Email Error] Delivery to ${to} failed: ${error.message}`);
    throw error;
  }
};

/**
 * Send Test Email (Admin Verification)
 */
const sendTestEmail = async (toEmail) => {
  const subject = '⚡ FitZone Gym - Brevo SMTP Test Email';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080B10; color: #F8FAFC; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #F8FAFC; margin: 0;">FIT<span style="color: #D4FF00;">ZONE</span> GYM</h1>
        <p style="color: #00E5FF; font-size: 14px; font-weight: bold;">BREVO SMTP CONFIGURATION TEST</p>
      </div>
      <div style="background: #111622; padding: 20px; border-radius: 8px; border-left: 4px solid #D4FF00;">
        <p style="margin-top: 0; font-size: 16px;">Hello Admin,</p>
        <p style="color: #94A3B8; line-height: 1.6;">
          This email confirms that your <strong>Brevo (Sendinblue) SMTP Relay</strong> server configuration is working correctly!
        </p>
        <ul style="color: #F8FAFC; font-size: 14px; padding-left: 20px;">
          <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'smtp-relay.brevo.com'}</li>
          <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || '587'}</li>
          <li><strong>Sender:</strong> ${process.env.EMAIL_FROM || 'info@fitzonegym.com'}</li>
          <li><strong>Status:</strong> Active & Delivering</li>
        </ul>
      </div>
      <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 20px;">
        Sent via FitZone Gym Express Backend API
      </p>
    </div>
  `;

  return await sendMail({ to: toEmail, subject, html });
};

/**
 * Send Booking Confirmation Receipt (Fail-safe: Never crashes booking creation)
 */
const sendBookingConfirmation = async (booking) => {
  try {
    const subject = `🎉 Booking Confirmed [${booking.confirmationCode}] - FitZone Gym`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080B10; color: #F8FAFC; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #F8FAFC; margin: 0;">FIT<span style="color: #D4FF00;">ZONE</span> GYM</h1>
        </div>
        <div style="background: #111622; padding: 20px; border-radius: 8px; border-left: 4px solid #D4FF00;">
          <h2 style="color: #D4FF00; margin-top: 0;">Booking Confirmed!</h2>
          <p>Hello <strong>${booking.guestName}</strong>,</p>
          <p>Your <strong>${booking.type}</strong> pass is active.</p>
          <p>Confirmation Code: <strong style="color: #D4FF00;">${booking.confirmationCode}</strong></p>
        </div>
      </div>
    `;

    return await sendMail({ to: booking.guestEmail, subject, html });
  } catch (error) {
    console.error(`[Brevo Booking Email Notice] Confirmation email to ${booking.guestEmail} failed, but booking was saved to DB: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendMail,
  sendTestEmail,
  sendBookingConfirmation
};
