import React from 'react';
import { config } from '../../lib/config';

interface EmailTemplateProps {
  title: string;
  previewText: string;
  children: React.ReactNode;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  title,
  previewText,
  children,
}) => {
  const logoUrl = 'https://www.prolearning.ai/logo.png'; // A real logo URL

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f2f4f6;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              padding: 30px;
              background-color: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo {
              max-width: 180px;
              height: auto;
            }
            .content {
              padding: 30px 0;
              color: #555;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #e2e8f0;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #4f46e5;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 500;
              font-size: 16px;
            }
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #1a202c;
                color: #e2e8f0;
              }
              .container {
                background-color: #2d3748;
                border-color: #4a5568;
              }
              .header, .footer {
                border-color: #4a5568;
              }
              .content {
                color: #cbd5e0;
              }
              .footer {
                color: #a0aec0;
              }
            }
          `}
        </style>
      </head>
      <body>
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {previewText}
        </div>
        <div className="container">
          <div className="header">
            <img 
              src={logoUrl}
              alt="ProLearning Logo" 
              className="logo" 
            />
          </div>
          <div className="content">
            {children}
          </div>
          <div className="footer">
            <p>© {new Date().getFullYear()} ProLearning. All rights reserved.</p>
            <p>
              <a href={config.app.url} style={{ color: '#4f46e5' }}>Visit our website</a> | 
              <a href={`${config.app.url}/privacy`} style={{ color: '#4f46e5' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};