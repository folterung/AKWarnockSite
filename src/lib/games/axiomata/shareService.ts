import { SharePlatform, ShareResult, ShareUrlConfig } from './shareTypes';

const GAME_URL = typeof window !== 'undefined' ? window.location.origin + '/games/axiomata' : '';

async function generateShareImage(element: HTMLElement): Promise<string | null> {
  if (!element) return null;

  await new Promise(resolve => setTimeout(resolve, 100));

  const { toPng } = await import('html-to-image');
  
  const dataUrl = await toPng(element, {
    quality: 1.0,
    pixelRatio: 1.5,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  return dataUrl;
}

async function copyImageToClipboard(dataUrl: string): Promise<void> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
}

async function uploadImageToHosting(dataUrl: string): Promise<string> {
  try {
    const uploadResponse = await fetch('/.netlify/functions/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageDataUrl: dataUrl }),
    });

    if (!uploadResponse.ok) {
      let errorMessage = 'Upload failed';
      try {
        const errorData = await uploadResponse.json();
        errorMessage = errorData.error || errorMessage;
        
        if (errorMessage.includes('not configured')) {
          errorMessage = 'Cloudinary not configured. Sign up for free at https://cloudinary.com/users/register/free and add CLOUDINARY_CLOUD_NAME to Netlify environment variables.';
        } else if (uploadResponse.status === 404) {
          errorMessage = 'Netlify function not found. Are you running Netlify Dev locally? Functions only work on Netlify or with Netlify Dev.';
        }
      } catch {
        if (uploadResponse.status === 404) {
          errorMessage = 'Netlify function not found. Functions only work on Netlify or with Netlify Dev.';
        } else {
          errorMessage = `Upload failed with status ${uploadResponse.status}`;
        }
      }
      throw new Error(errorMessage);
    }

    const result = await uploadResponse.json();
    if (result.imageUrl) {
      return result.imageUrl;
    }

    throw new Error('Upload succeeded but no URL returned');
  } catch (error) {
    console.error('Image upload failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error during image upload');
  }
}

function createShareablePageUrl(imageUrl: string, shareText: string, time: string): string {
  if (typeof window === 'undefined') {
    return GAME_URL;
  }
  const baseUrl = window.location.origin;
  const sharePageUrl = `${baseUrl}/.netlify/functions/share-page`;
  const params = new URLSearchParams({
    image: imageUrl,
    text: shareText,
    time: time,
  });
  return `${sharePageUrl}?${params.toString()}`;
}

function getShareUrl(platform: SharePlatform, config: ShareUrlConfig, shareablePageUrl: string): string {
  const { text, title } = config;
  const encodedUrl = encodeURIComponent(shareablePageUrl);
  const encodedText = encodeURIComponent(text);
  const encodedTitle = title ? encodeURIComponent(title) : encodedText;

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case 'reddit':
      return `https://reddit.com/submit?title=${encodedTitle}&url=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    default:
      return shareablePageUrl;
  }
}

async function shareToDiscord(dataUrl: string): Promise<ShareResult> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      return {
        success: false,
        error: 'Clipboard API not available',
        platform: 'discord',
      };
    }

    await copyImageToClipboard(dataUrl);
    
    return {
      success: true,
      platform: 'discord',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'discord',
    };
  }
}

async function shareToReddit(
  dataUrl: string,
  shareText: string,
  time: string,
  url?: string
): Promise<ShareResult> {
  try {
    const imageUrl = await uploadImageToHosting(dataUrl);
    const shareablePageUrl = createShareablePageUrl(imageUrl, shareText, time);
    const shareUrl = getShareUrl('reddit', { text: shareText, title: shareText }, shareablePageUrl);
    
    if (!shareUrl || shareUrl === '') {
      return {
        success: false,
        error: 'Invalid share URL',
        platform: 'reddit',
      };
    }

    const shareWindow = window.open(
      shareUrl,
      'share',
      'width=550,height=420,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!shareWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for this site.',
        platform: 'reddit',
      };
    }

    return {
      success: true,
      platform: 'reddit',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'reddit',
    };
  }
}

async function shareToTwitter(
  dataUrl: string,
  shareText: string,
  time: string,
  url?: string
): Promise<ShareResult> {
  try {
    const imageUrl = await uploadImageToHosting(dataUrl);
    const shareablePageUrl = createShareablePageUrl(imageUrl, shareText, time);
    const shareUrl = getShareUrl('twitter', { text: shareText }, shareablePageUrl);
    
    if (!shareUrl || shareUrl === '') {
      return {
        success: false,
        error: 'Invalid share URL',
        platform: 'twitter',
      };
    }

    const shareWindow = window.open(
      shareUrl,
      'share',
      'width=550,height=420,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!shareWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for this site.',
        platform: 'twitter',
      };
    }

    return {
      success: true,
      platform: 'twitter',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'twitter',
    };
  }
}

async function shareToFacebook(
  dataUrl: string,
  shareText: string,
  time: string,
  url?: string
): Promise<ShareResult> {
  try {
    const imageUrl = await uploadImageToHosting(dataUrl);
    const shareablePageUrl = createShareablePageUrl(imageUrl, shareText, time);
    const shareUrl = getShareUrl('facebook', { text: shareText }, shareablePageUrl);
    
    if (!shareUrl || shareUrl === '') {
      return {
        success: false,
        error: 'Invalid share URL',
        platform: 'facebook',
      };
    }

    const shareWindow = window.open(
      shareUrl,
      'share',
      'width=550,height=420,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!shareWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for this site.',
        platform: 'facebook',
      };
    }

    return {
      success: true,
      platform: 'facebook',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'facebook',
    };
  }
}

async function shareToLinkedIn(
  dataUrl: string,
  shareText: string,
  time: string,
  url?: string
): Promise<ShareResult> {
  try {
    const imageUrl = await uploadImageToHosting(dataUrl);
    const shareablePageUrl = createShareablePageUrl(imageUrl, shareText, time);
    const shareUrl = getShareUrl('linkedin', { text: shareText }, shareablePageUrl);
    
    if (!shareUrl || shareUrl === '') {
      return {
        success: false,
        error: 'Invalid share URL',
        platform: 'linkedin',
      };
    }

    const shareWindow = window.open(
      shareUrl,
      'share',
      'width=550,height=420,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!shareWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for this site.',
        platform: 'linkedin',
      };
    }

    return {
      success: true,
      platform: 'linkedin',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'linkedin',
    };
  }
}

async function shareToSocialPlatform(
  platform: SharePlatform,
  shareText: string,
  url?: string
): Promise<ShareResult> {
  try {
    const shareUrl = getShareUrl(platform, { text: shareText, url });
    const shareWindow = window.open(
      shareUrl,
      'share',
      'width=550,height=420,menubar=no,toolbar=no,location=no,status=no'
    );

    if (!shareWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for this site.',
        platform,
      };
    }

    return {
      success: true,
      platform,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform,
    };
  }
}

async function shareViaNative(
  dataUrl: string,
  shareText: string
): Promise<ShareResult> {
  try {
    if (!navigator.share) {
      downloadImage(dataUrl);
      return {
        success: true,
        platform: 'native',
      };
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    if (!blob || blob.size === 0) {
      downloadImage(dataUrl);
      return {
        success: false,
        error: 'Failed to generate image',
        platform: 'native',
      };
    }

    const file = new File([blob], 'axiomata-result.png', { 
      type: 'image/png',
      lastModified: Date.now(),
    });

    const shareData: ShareData = {
      title: 'Axiomata Puzzle Result',
      text: shareText,
    };

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      shareData.files = [file];
    }

    await navigator.share(shareData);

    return {
      success: true,
      platform: 'native',
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Share cancelled',
        platform: 'native',
      };
    }
    
    if (navigator.clipboard && navigator.clipboard.write) {
      try {
        await copyImageToClipboard(dataUrl);
        return {
          success: true,
          platform: 'native',
        };
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
      }
    }
    
    downloadImage(dataUrl);
    return {
      success: true,
      platform: 'native',
    };
  }
}

function downloadImage(dataUrl: string, filename: string = 'axiomata-result.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

async function shareToPlatform(
  platform: SharePlatform,
  dataUrl: string,
  shareText: string,
  time: string,
  url?: string
): Promise<ShareResult> {
  if (platform === 'discord') {
    return await shareToDiscord(dataUrl);
  }

  if (platform === 'twitter') {
    return await shareToTwitter(dataUrl, shareText, time, url);
  }

  if (platform === 'reddit') {
    return await shareToReddit(dataUrl, shareText, time, url);
  }

  if (platform === 'facebook') {
    return await shareToFacebook(dataUrl, shareText, time, url);
  }

  if (platform === 'linkedin') {
    return await shareToLinkedIn(dataUrl, shareText, time, url);
  }

  if (platform === 'native') {
    return await shareViaNative(dataUrl, shareText);
  }

  return await shareToSocialPlatform(platform, shareText, url);
}

export {
  generateShareImage,
  copyImageToClipboard,
  uploadImageToHosting,
  createShareablePageUrl,
  getShareUrl,
  shareToDiscord,
  shareToTwitter,
  shareToReddit,
  shareToFacebook,
  shareToLinkedIn,
  shareToPlatform,
  shareViaNative,
  shareToSocialPlatform,
  downloadImage,
};

