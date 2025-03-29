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

    // Send confirmation email
    const { data, error } = await resend.emails.send({
      from: 'AK Warnock <newsletter@akwarnock.com>',
      to: email,
      subject: 'Unsubscribed from AK Warnock\'s Newsletter',
      html: `
        <h1>Unsubscribed Successfully</h1>
        <p>You have been unsubscribed from my newsletter. I'm sorry to see you go!</p>
        <p>If you change your mind, you can always subscribe again at any time.</p>
        <p>Best regards,<br>AK Warnock</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send confirmation email' }),
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