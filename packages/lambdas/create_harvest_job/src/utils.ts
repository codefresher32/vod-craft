import { extname } from 'path';

export const getFileExtensionFromUri = (uri: string): string => {
  try {
    const { pathname } = new URL(uri);
    return extname(pathname);
  } catch {
    return '';
  }
};

export const getMediaTypeFromExtension = (ext: string): string | null => {
  const fileExtensionToMediaTypeMapping: { [key: string]: string } = {
    '.m3u8': 'hls',
    '.mpd': 'dash',
    '.ism': 'mss',
  };
  return fileExtensionToMediaTypeMapping[ext] || null;
};
