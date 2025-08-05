import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { config } from './config';
import { EmailTemplate } from '../components/email/EmailTemplate';

declare global {
  interface Window {
    Email: any;
  }
}

const loadSmtpJs = () => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById('smtp-js')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'smtp-js';
    script.src = 'https://smtpjs.com/v3/smtp.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load SMTP.js'));
    document.head.appendChild(script);
  });
};

const sendEmail = async (to: string, subject: string, previewText: string, children: React.ReactNode) => {
  await loadSmtpJs();
  const body = renderToStaticMarkup(
    <EmailTemplate title={subject} previewText={previewText}>
      {children}
    </EmailTemplate>
  );

  return window.Email.send({
    Host: "smtp.gmail.com",
    Username: config.email.user,
    Password: config.email.pass,
    To: to,
    From: config.email.from,
    Subject: subject,
    Body: body,
  });
};

export const emailService = {
  sendPasswordResetEmail: async (to: string, token: string) => {
    const resetUrl = `${config.app.url}/auth/reset-password/${token}`;
    const subject = 'Reset Your ProLearning Password';
    const previewText = 'Reset your password';
    
    return sendEmail(to, subject, previewText, (
      <>
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href={resetUrl} className="button">Reset Password</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </>
    ));
  },

  sendWelcomeEmail: async (to: string, name: string) => {
    const subject = 'Welcome to ProLearning!';
    const previewText = 'Welcome aboard!';

    return sendEmail(to, subject, previewText, (
      <>
        <h1>Welcome, {name}!</h1>
        <p>Thank you for joining ProLearning. We are excited to have you on board.</p>
        <p>Start exploring our courses and unlock your potential.</p>
        <p><a href={config.app.url} className="button">Explore Courses</a></p>
      </>
    ));
  },

  sendLoginNotificationEmail: async (to: string) => {
    const subject = 'Security Alert: New Login to Your ProLearning Account';
    const previewText = 'New login detected';
    
    return sendEmail(to, subject, previewText, (
      <>
        <h1>New Login Detected</h1>
        <p>We detected a new login to your ProLearning account. If this was you, you can safely ignore this email.</p>
        <p>If you do not recognize this activity, please reset your password immediately and contact our support team.</p>
        <p><a href={`${config.app.url}/auth/reset-password`} className="button">Reset Password</a></p>
      </>
    ));
  },
};