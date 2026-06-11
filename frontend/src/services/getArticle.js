import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function getArticle({ headers, slug, lang }) {
  try {
    const params = lang ? { lang } : {};
    const { data } = await axios({
      headers,
      url: `api/articles/${slug}`,
      params,
    });

    return data.article;
  } catch (error) {
    errorHandler(error);
  }
}

export default getArticle;
