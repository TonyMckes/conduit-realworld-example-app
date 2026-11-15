import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function deleteUnsavedEdit({ editId, headers, slug }) {
  try {
    const { data } = await axios({
      headers,
      method: "DELETE",
      url: `api/articles/${slug}/unsaved-edits/${editId}`,
    });

    return data;
  } catch (error) {
    errorHandler(error);
  }
}

export default deleteUnsavedEdit;
