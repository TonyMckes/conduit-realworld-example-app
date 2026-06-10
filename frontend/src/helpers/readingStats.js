/**
 * 计算文章字数与预计阅读时间
 * @param {string} content - 文章正文（Markdown 或纯文本）
 * @returns {{ wordCount: number, readingTime: string }}
 */
export function computeReadingStats(content) {
  if (!content || typeof content !== 'string') {
    return { wordCount: 0, readingTime: '0 分钟' };
  }

  // 剥离 Markdown / HTML 标签，获取纯文本
  const plainText = content
    .replace(/<[^>]*>/g, '')          // 移除 HTML 标签
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 移除 Markdown 图片
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')  // 移除 Markdown 链接，保留文字部分已在上一步处理
    .replace(/#{1,6}\s+/g, '')        // 移除 Markdown 标题标记
    .replace(/[*_~`>]/g, '')          // 移除 Markdown 加粗、斜体、删除线、引用等符号
    .replace(/```[\s\S]*?```/g, '')   // 移除代码块
    .replace(/`[^`]*`/g, '')          // 移除行内代码
    .replace(/---|\*\*\*|___/g, '')   // 移除水平分割线
    .replace(/\s+/g, ' ')             // 合并空白
    .trim();

  // 统计中文字数
  const chineseChars = (plainText.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // 统计英文单词数：先移除中文字符，再按空格分割
  const nonChineseText = plainText.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ');
  const englishWords = nonChineseText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // 总字数 = 中文字数 + 英文词数
  const wordCount = chineseChars + englishWords;

  // 预计阅读时间
  // 中文阅读速度约 300 字/分钟，英文约 200 词/分钟，取加权平均
  const chineseMinutes = chineseChars / 300;
  const englishMinutes = englishWords / 200;
  const totalMinutes = chineseMinutes + englishMinutes;
  const roundedMinutes = Math.max(1, Math.ceil(totalMinutes));

  const readingTime = wordCount === 0 ? '0 分钟' : `${roundedMinutes} 分钟`;

  return { wordCount, readingTime };
}