import { Resend } from 'resend';
import { Handler } from '@netlify/functions';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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
    const { data, error } = await resend.emails.send({
      from: 'AK Warnock <newsletter@akwarnockwrites.com>',
      to: email,
      subject: 'Welcome to AK Warnock\'s Newsletter!',
      html: `
        <h1>Welcome to AK Warnock's Newsletter!</h1>
        <p>Thank you for subscribing to my newsletter. You'll be the first to know about new releases, updates, and exclusive content.</p>
        <p>Best regards,<br>AK Warnock</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send welcome email' }),
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