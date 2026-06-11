import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function setArticle({ body, coverImage, description, headers, slug, tagList, title }) {
  try {
    const { data } = await axios({
      data: { article: { title, description, body, coverImage, tagList } },
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
