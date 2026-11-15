import axios from "axios";
import errorHandler from "../helpers/errorHandler";

// The article was changed from another editor since this one loaded it, so
// the update was not saved. `conflict` holds the currently saved `article`
// and the `unsavedEdit` the server kept the submitted changes in.
export class ArticleConflictError extends Error {
  constructor(message, conflict) {
    super(message);
    this.name = "ArticleConflictError";
    this.conflict = conflict;
  }
}

async function setArticle({
  body,
  description,
  headers,
  id,
  resolvedUnsavedEdits,
  slug,
  tagList,
  title,
  version,
}) {
  let article;

  try {
    const { data } = await axios({
      data: {
        article: slug
          ? { id, title, description, body, tagList, version, resolvedUnsavedEdits }
          : { title, description, body, tagList },
      },
      headers,
      method: slug ? "PUT" : "POST",
      url: slug ? `api/articles/${slug}` : "api/articles",
    });

    article = data.article;
  } catch (error) {
    const { status, data } = error.response || {};
    if (status === 409 && data?.conflict) {
      throw new ArticleConflictError(data.errors?.body?.[0], data.conflict);
    }

    errorHandler(error);
  }

  // Not saved, and the reason isn't one `errorHandler` reports (e.g. offline)
  if (!article) throw "The article could not be saved. Please try again.";

  return article.slug;
}

export default setArticle;
