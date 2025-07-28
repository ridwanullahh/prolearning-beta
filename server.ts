import express from 'express';
import nodemailer from 'nodemailer';
import { config } from './src/lib/config';

const app = express();
const port = 3001; // A separate port for our API server

app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html: body,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});