import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function postComment({ body, headers, slug }) {
  try {
    const { data } = await axios({
      data: { comment: { body } },
      headers,
      method: "POST",
      url: `api/articles/${slug}/comments`,
    });

    return data.comment;
  } catch (error) {
    errorHandler(error);
  }
}

export default postComment;
