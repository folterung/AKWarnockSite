import { Resend } from 'resend';
import { Handler } from '@netlify/functions';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!ADMIN_EMAIL) {
    console.error('ADMIN_EMAIL environment variable is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    const { name, email, phone, preferredMethod, message } = JSON.parse(event.body || '{}');

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, email, and message are required' }),
      };
    }

    // Send contact form submission to admin
    const { error } = await resend.emails.send({
      from: 'AK Warnock <newsletter@akwarnockwrites.com>',
      to: ADMIN_EMAIL,
      subject: 'New Contact Form Submission',
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Preferred Contact Method:</strong> ${preferredMethod || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send message' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent successfully' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 