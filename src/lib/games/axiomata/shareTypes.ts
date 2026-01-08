export type SharePlatform = 'discord' | 'twitter' | 'reddit' | 'facebook' | 'linkedin' | 'native';

export interface ShareResult {
  success: boolean;
  error?: string;
  platform: SharePlatform;
}

export interface ShareUrlConfig {
  text: string;
  url?: string;
  title?: string;
}

