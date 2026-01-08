import { Handler } from '@netlify/functions';

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export const handler: Handler = async (event) => {
  const queryParams = event.queryStringParameters || {};
  const imageUrl = queryParams.image;
  const time = queryParams.time || '0:00';
  const textRaw = queryParams.text || `I solved today's Axiomata puzzle in ${time}!`;

  if (!imageUrl) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
      body: '<html><body><h1>Invalid share URL</h1></body></html>',
    };
  }

  const text = escapeHtml(textRaw);
  const escapedImageUrl = escapeHtml(imageUrl);
  
  const shareUrl = event.headers.host 
    ? `https://${event.headers.host}${event.path}${event.rawQuery ? '?' + event.rawQuery : ''}`
    : event.rawUrl || '';
  const siteUrl = process.env.SITE_URL || 'https://akwarnockwrites.com';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>Axiomata Puzzle Result - ${text}</title>
  <meta name="title" content="Axiomata Puzzle Result - ${text}">
  <meta name="description" content="${text} Play Axiomata daily puzzles at ${siteUrl}/games/axiomata">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="Axiomata Puzzle Result - ${text}">
  <meta property="og:description" content="${text} Play Axiomata daily puzzles at ${siteUrl}/games/axiomata">
  <meta property="og:image" content="${escapedImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:site_name" content="AK Warnock">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${shareUrl}">
  <meta property="twitter:title" content="Axiomata Puzzle Result - ${text}">
  <meta property="twitter:description" content="${text} Play Axiomata daily puzzles at ${siteUrl}/games/axiomata">
  <meta property="twitter:image" content="${escapedImageUrl}">
  
  <!-- Redirect to game after 2 seconds -->
  <meta http-equiv="refresh" content="2;url=${siteUrl}/games/axiomata">
  
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .container {
      padding: 2rem;
      max-width: 600px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      margin: 2rem 0;
    }
    .loading {
      font-size: 1.2rem;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${escapedImageUrl}" alt="Axiomata Puzzle Result - ${text}" />
    <div class="loading">Redirecting to game...</div>
  </div>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
    body: html,
  };
};

