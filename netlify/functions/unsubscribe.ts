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

    // Send confirmation email to user
    const userEmail = await resend.emails.send({
      from: 'AK Warnock <newsletter@akwarnockwrites.com>',
      to: email,
      subject: 'Unsubscribed from AK Warnock\'s Newsletter',
      html: `
        <h1>Unsubscribed Successfully</h1>
        <p>You have been unsubscribed from AK Warnock's newsletter.</p>
        <p>If you unsubscribed by mistake or would like to resubscribe in the future, you can do so at any time from the website.</p>
        <p>Best regards,<br>AK Warnock</p>
      `,
    });

    // Send notification to admin
    const adminEmail = await resend.emails.send({
      from: 'AK Warnock <newsletter@akwarnockwrites.com>',
      to: ADMIN_EMAIL,
      subject: 'Newsletter Unsubscribe',
      html: `
        <h1>Newsletter Unsubscribe</h1>
        <p>A subscriber has unsubscribed from the newsletter:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (userEmail.error || adminEmail.error) {
      console.error('Resend error:', userEmail.error || adminEmail.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send emails' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Unsubscribed successfully' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 