/**
 * Calculate reading statistics for article body text.
 * @param {string} body - The article body text
 * @param {number} wordsPerMinute - Reading speed (default 200)
 * @returns {{ wordCount: number, estimatedMinutes: number }}
 */
export default function getReadingStats(body, wordsPerMinute = 200) {
  if (!body || body.trim() === '') {
    return { wordCount: 0, estimatedMinutes: 0 };
  }

  // Count Chinese characters (Unicode range 4E00-9FFF)
  const chineseChars = (body.match(/[一-鿿]/g) || []).length;

  // Count English words (split by whitespace after removing Chinese chars)
  const englishWords = body
    .replace(/[一-鿿]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0).length;

  const wordCount = chineseChars + englishWords;
  const estimatedMinutes = Math.ceil(wordCount / wordsPerMinute);

  return { wordCount, estimatedMinutes };
}
