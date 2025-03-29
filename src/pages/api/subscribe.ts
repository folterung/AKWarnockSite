import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: 'New Newsletter Subscription',
        text: `A new user has subscribed to your newsletter: ${email}`,
      });

      return res.status(200).json({ message: 'Successfully subscribed!' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'An error occurred while subscribing' });
    }
  }

  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
}