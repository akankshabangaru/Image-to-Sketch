const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Sends transactional email via SMTP if configured; otherwise logs to console
// so the flow (e.g. password reset) is still testable without real credentials.
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    logger.info(`[sendEmail] SMTP not configured. Would have sent to ${to}: ${subject}`);
    logger.info(html);
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Sketchify AI <no-reply@sketchify.ai>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
