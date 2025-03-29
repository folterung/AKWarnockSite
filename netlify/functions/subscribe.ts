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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d; margin-bottom: 20px;">Welcome to AK Warnock's Newsletter!</h1>
          <p style="color: #2d3748; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing to my newsletter. You'll be the first to know about new releases, updates, and exclusive content.
          </p>
          <p style="color: #2d3748; line-height: 1.6; margin-bottom: 20px;">
            Best regards,<br>AK Warnock
          </p>
          
          <hr style="border: 1px solid #e2e8f0; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #718096; text-align: center;">
            <p style="margin-bottom: 10px;">
              You received this email because you subscribed to AK Warnock's newsletter.
            </p>
            <p>
              <a href="https://akwarnockwrites.com/unsubscribe?email=${email}" 
                 style="color: #4299e1; text-decoration: none;">
                Unsubscribe from our newsletter
              </a>
            </p>
          </div>
        </div>
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