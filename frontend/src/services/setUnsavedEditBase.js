import axios from "axios";
import errorHandler from "../helpers/errorHandler";

// Records the article content (`base`) the unsaved edit was started from
async function setUnsavedEditBase({ base, editId, headers, slug }) {
  try {
    const { data } = await axios({
      data: { unsavedEdit: { base } },
      headers,
      method: "PUT",
      url: `api/articles/${slug}/unsaved-edits/${editId}`,
    });

    return data.unsavedEdit;
  } catch (error) {
    errorHandler(error);
  }
}

export default setUnsavedEditBase;
