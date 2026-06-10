import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function getArticle({ headers, slug }) {
  try {
    const { data } = await axios({ headers, url: `api/articles/${slug}` });

    const article = data.article;

    // Mock: 注入阅读量假数据（基于 slug 生成稳定的随机值）
    article.viewsCount = hashCode(slug) % 10000 + 100;

    return article;
  } catch (error) {
    errorHandler(error);
  }
}

/**
 * 简单的字符串哈希函数，用于根据 slug 生成稳定的假阅读量
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default getArticle;