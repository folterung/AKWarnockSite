import { Handler } from '@netlify/functions';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned';

async function uploadToCloudinary(imageDataUrl: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured');
  }

  // Extract base64 data from data URL (format: data:image/png;base64,iVBORw0KGgo...)
  const base64Data = imageDataUrl.includes(',') 
    ? imageDataUrl.split(',')[1] 
    : imageDataUrl.replace(/^data:image\/\w+;base64,/, '');

  const formData = new FormData();
  formData.append('file', `data:image/png;base64,${base64Data}`);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'axiomata');

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Cloudinary upload failed:', errorText);
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const result = await uploadResponse.json();
  if (result.secure_url) {
    return result.secure_url;
  }

  throw new Error('Cloudinary upload succeeded but no URL returned');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        error: 'Image hosting not configured. CLOUDINARY_CLOUD_NAME environment variable is not set. Sign up for free at https://cloudinary.com/users/register/free and get your cloud name from the dashboard.' 
      }),
    };
  }

  try {
    const { imageDataUrl } = JSON.parse(event.body || '{}');

    if (!imageDataUrl) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Image data URL is required' }),
      };
    }

    const imageUrl = await uploadToCloudinary(imageDataUrl);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ imageUrl }),
    };
  } catch (error) {
    console.error('Upload function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error during upload' 
      }),
    };
  }
};

