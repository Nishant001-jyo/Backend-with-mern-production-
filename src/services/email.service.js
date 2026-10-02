/**
 * Universal Email Service (Stubbed for Development & Testing)
 *
 * This service is designed to be completely decoupled.
 * In development, it logs simulated emails to the console.
 * To integrate a real provider (Nodemailer, SendGrid, Resend, AWS SES):
 * simply install your provider SDK and replace the implementation inside `sendEmail`.
 *
 * Example Nodemailer integration:
 * ```js
 * import nodemailer from 'nodemailer';
 * const transporter = nodemailer.createTransport({ ...credentials });
 * await transporter.sendMail({ from, to, subject, html });
 * ```
 */

import config from '../config/config.js';
import { NODE_ENVIRONMENTS } from '../config/constants.js';

export class EmailService {
  /**
   * Generic sender function
   *
   * @param {Object} options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject line
   * @param {string} options.text - Plain text version
   * @param {string} [options.html] - HTML content version
   * @returns {Promise<boolean>}
   */
  static async sendEmail({ to, subject, text, html }) {
    if (config.env === NODE_ENVIRONMENTS.TEST) {
      return true;
    }

    // Default development stub: Log nicely formatted email to console
    console.log('\n✉️ --- [OUTGOING EMAIL STUB] ---');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text || html}`);
    console.log('--------------------------------\n');

    return true;
  }

  /**
   * Send a welcome email to newly registered users
   *
   * @param {Object} user
   * @param {string} user.email
   * @param {string} user.name
   */
  static async sendWelcomeEmail(user) {
    const subject = 'Welcome to the Platform!';
    const text = `Hi ${user.name},\n\nThank you for signing up. We're excited to have you on board!`;
    const html = `<p>Hi <strong>${user.name}</strong>,</p><p>Thank you for signing up. We're excited to have you on board!</p>`;

    return await this.sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });
  }

  /**
   * Send password reset instruction email
   *
   * @param {Object} user
   * @param {string} resetUrl
   */
  static async sendPasswordResetEmail(user, resetUrl) {
    const subject = 'Your Password Reset Request';
    const text = `Hi ${user.name},\n\nPlease use the following link to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    const html = `<p>Hi ${user.name},</p><p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`;

    return await this.sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });
  }
}

export default EmailService;
