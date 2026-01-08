import { SharePlatform } from './shareTypes';
import { getShareUrl } from './shareService';

export interface ShareTestResult {
  success: boolean;
  error?: string;
  platform: SharePlatform;
}

async function verifyClipboardImage(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes('image/png')) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to verify clipboard:', error);
    return false;
  }
}

function verifyShareUrl(platform: SharePlatform, url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    switch (platform) {
      case 'twitter':
        return urlObj.hostname === 'twitter.com' && urlObj.pathname === '/intent/tweet';
      case 'reddit':
        return urlObj.hostname === 'reddit.com' && urlObj.pathname === '/submit';
      case 'facebook':
        return urlObj.hostname === 'www.facebook.com' && urlObj.pathname === '/sharer/sharer.php';
      case 'linkedin':
        return urlObj.hostname === 'www.linkedin.com' && urlObj.pathname === '/sharing/share-offsite';
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}

async function testImageGeneration(element: HTMLElement): Promise<boolean> {
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 1.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
    return dataUrl.startsWith('data:image/png;base64,');
  } catch (error) {
    console.error('Image generation test failed:', error);
    return false;
  }
}

async function simulateShare(
  platform: SharePlatform,
  shareText: string,
  url?: string
): Promise<ShareTestResult> {
  try {
    const shareUrl = getShareUrl(platform, { text: shareText, url });
    
    if (!verifyShareUrl(platform, shareUrl)) {
      return {
        success: false,
        error: 'Invalid share URL format',
        platform,
      };
    }

    const urlObj = new URL(shareUrl);
    const params = Object.fromEntries(urlObj.searchParams.entries());

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

function getShareUrlParameters(platform: SharePlatform, url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    return Object.fromEntries(urlObj.searchParams.entries());
  } catch (error) {
    return {};
  }
}

export {
  verifyClipboardImage,
  verifyShareUrl,
  testImageGeneration,
  simulateShare,
  getShareUrlParameters,
};

