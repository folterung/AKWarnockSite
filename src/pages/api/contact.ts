import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, phone, email, preferredMethod, message } = req.body;

  // Format the preferred method for display
  const formatPreferredMethod = (method: string) => {
    switch (method) {
      case 'phone':
        return 'Phone Call';
      case 'text':
        return 'Text Message';
      case 'email':
        return 'Email';
      default:
        return method;
    }
  };

  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission from ${name}`,
      text: `
New Contact Form Submission
--------------------------
Name: ${name}
Phone: ${phone}
Email: ${email}
Preferred Method of Communication: ${formatPreferredMethod(preferredMethod)}

Message:
${message}

Please contact this person via ${formatPreferredMethod(preferredMethod)}.
      `,
      html: `
<h2>New Contact Form Submission</h2>
<hr style="border: 1px solid #e5e7eb; margin: 1rem 0;">
<p><strong>Name:</strong> ${name}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Preferred Method of Communication:</strong> ${formatPreferredMethod(preferredMethod)}</p>

<h3 style="margin-top: 1rem;">Message:</h3>
<div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.375rem; margin: 0.5rem 0;">
  ${message.split('\n').map(line => `<p style="margin: 0;">${line}</p>`).join('')}
</div>

<p style="margin-top: 1rem; padding: 0.5rem; background-color: #f3f4f6; border-radius: 0.375rem;">
  <strong>Action Required:</strong> Please contact this person via ${formatPreferredMethod(preferredMethod)}.
</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
} 