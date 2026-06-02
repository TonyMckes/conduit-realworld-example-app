import { describe, it, expect } from 'vitest';
import getReadingStats from './readingStats';

describe('getReadingStats', () => {
  it('should return 0 words and 0 minutes for empty body', () => {
    expect(getReadingStats('')).toEqual({ wordCount: 0, estimatedMinutes: 0 });
    expect(getReadingStats(null)).toEqual({ wordCount: 0, estimatedMinutes: 0 });
    expect(getReadingStats(undefined)).toEqual({ wordCount: 0, estimatedMinutes: 0 });
  });

  it('should count Chinese and English words correctly', () => {
    // "Hello world 你好" → 2 English words + 2 Chinese chars = 4
    expect(getReadingStats('Hello world 你好', 3)).toEqual({ wordCount: 4, estimatedMinutes: 2 });
  });

  it('should round up reading time', () => {
    // "one two three four" → 4 English words, at 3 wpm = ceil(4/3) = 2 minutes
    expect(getReadingStats('one two three four', 3)).toEqual({ wordCount: 4, estimatedMinutes: 2 });
  });
});
