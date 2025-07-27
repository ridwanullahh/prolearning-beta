import nodemailer from 'nodemailer';
import { config } from './config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const emailService = {
  sendPasswordResetEmail: async (to: string, token: string) => {
    const resetUrl = `${config.app.url}/auth/reset-password/${token}`;
    const mailOptions = {
      from: `"ProLearning" <${config.email.user}>`,
      to,
      subject: 'Reset Your ProLearning Password',
      html: `
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  },
};