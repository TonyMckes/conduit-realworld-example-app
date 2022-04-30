import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function toggleFav({ slug, favorited, headers }) {
  try {
    const { data } = await axios({
      headers,
      method: favorited ? "DELETE" : "POST",
      url: `api/articles/${slug}/favorite`,
    });

    return data.article;
  } catch (error) {
    errorHandler(error);
  }
}

export default toggleFav;
