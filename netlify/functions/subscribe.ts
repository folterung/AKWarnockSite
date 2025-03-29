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
    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Send welcome email to subscriber
    const subscriberEmail = await resend.emails.send({
      from: 'AK Warnock <newsletter@akwarnockwrites.com>',
      to: email,
      subject: 'Welcome to AK Warnock\'s Newsletter!',
      html: `
        <h1>Welcome to AK Warnock's Newsletter!</h1>
        <p>Thank you for subscribing to my newsletter. You'll be the first to know about new releases, updates, and exclusive content.</p>
        <p>Best regards,<br>AK Warnock</p>
      `,
    });

    // Send notification to admin
    const adminEmail = await resend.emails.send({
      from: 'AK Warnock <newsletter@akwarnockwrites.com>',
      to: ADMIN_EMAIL,
      subject: 'New Newsletter Subscriber',
      html: `
        <h1>New Newsletter Subscriber</h1>
        <p>A new subscriber has joined the newsletter:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (subscriberEmail.error || adminEmail.error) {
      console.error('Resend error:', subscriberEmail.error || adminEmail.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send emails' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscribed successfully' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 