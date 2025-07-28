import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { config } from './config';
import { EmailTemplate } from '../components/email/EmailTemplate';

// A helper function to call our new API endpoint
const sendApiRequest = async (to: string, subject: string, bodyContent: React.ReactElement) => {
  // Render the entire email, including the template, to a single HTML string.
  const body = renderToStaticMarkup(bodyContent);

  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, body }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send email');
  }

  return response.json();
};

export const emailService = {
  sendPasswordResetEmail: async (to: string, token: string) => {
    const resetUrl = `${config.app.url}/auth/reset-password/${token}`;
    const subject = 'Reset Your ProLearning Password';
    await sendApiRequest(to, subject, 
      <EmailTemplate title={subject} previewText="Reset your password">
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href={resetUrl} className="button">Reset Password</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </EmailTemplate>
    );
  },

  sendWelcomeEmail: async (to: string, name: string) => {
    const subject = 'Welcome to ProLearning!';
    await sendApiRequest(to, subject,
      <EmailTemplate title={subject} previewText="Welcome aboard!">
        <h1>Welcome, {name}!</h1>
        <p>Thank you for joining ProLearning. We are excited to have you on board.</p>
        <p>Start exploring our courses and unlock your potential.</p>
        <p><a href={config.app.url} className="button">Explore Courses</a></p>
      </EmailTemplate>
    );
  },

  sendLoginNotificationEmail: async (to: string) => {
    const subject = 'Security Alert: New Login to Your ProLearning Account';
    await sendApiRequest(to, subject,
      <EmailTemplate title={subject} previewText="New login detected">
        <h1>New Login Detected</h1>
        <p>We detected a new login to your ProLearning account. If this was you, you can safely ignore this email.</p>
        <p>If you do not recognize this activity, please reset your password immediately and contact our support team.</p>
        <p><a href={`${config.app.url}/auth/reset-password`} className="button">Reset Password</a></p>
      </EmailTemplate>
    );
  },
};