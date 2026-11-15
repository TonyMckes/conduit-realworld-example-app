import axios from "axios";
import errorHandler from "../helpers/errorHandler";

// Changes to the article that were not saved because of a concurrent update
async function getUnsavedEdits({ headers, slug }) {
  try {
    const { data } = await axios({
      headers,
      url: `api/articles/${slug}/unsaved-edits`,
    });

    return data.unsavedEdits;
  } catch (error) {
    errorHandler(error);
  }
}

export default getUnsavedEdits;
