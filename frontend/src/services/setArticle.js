import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function setArticle({ body, coverImage, content_en, description, headers, slug, summary_en, tagList, title, title_en }) {
  try {
    const { data } = await axios({
      data: { article: { title, description, body, coverImage, tagList, title_en, content_en, summary_en } },
      headers,
      method: slug ? "PUT" : "POST",
      url: slug ? `api/articles/${slug}` : "api/articles",
    });

    return data.article.slug;
  } catch (error) {
    errorHandler(error);
  }
}

export default setArticle;
