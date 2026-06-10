import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function setArticle({ body, description, headers, slug, tagList, title, status }) {
  try {
    const { data } = await axios({
      data: { article: { title, description, body, tagList, status } },
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
