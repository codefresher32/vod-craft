import { getFileExtensionFromUri, getMediaTypeFromExtension } from '../utils';

describe('utils', () => {
  describe('getFileExtensionFromUri', () => {
    test('should return the file extension for a valid URI', () => {
      expect(getFileExtensionFromUri('http://example.com/video.m3u8')).toBe('.m3u8');
      expect(getFileExtensionFromUri('http://example.com/video.mpd')).toBe('.mpd');
      expect(getFileExtensionFromUri('http://example.com/video.ism')).toBe('.ism');
    });

    test('should return an empty string for an invalid URI', () => {
      expect(getFileExtensionFromUri('invalid-uri')).toBe('');
    });

    test('should return an empty string if no extension is present', () => {
      expect(getFileExtensionFromUri('http://example.com/video')).toBe('');
    });
  });

  describe('getMediaTypeFromExtension', () => {
    test('should return the correct media type for known extensions', () => {
      expect(getMediaTypeFromExtension('.m3u8')).toBe('hls');
      expect(getMediaTypeFromExtension('.mpd')).toBe('dash');
      expect(getMediaTypeFromExtension('.ism')).toBe('mss');
    });

    test('should return null for unknown extensions', () => {
      expect(getMediaTypeFromExtension('.unknown')).toBeNull();
      expect(getMediaTypeFromExtension('.txt')).toBeNull();
    });

    test('should return null for an empty string', () => {
      expect(getMediaTypeFromExtension('')).toBeNull();
    });
  });
});
