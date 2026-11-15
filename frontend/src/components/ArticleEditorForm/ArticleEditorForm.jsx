import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dateTimeFormatter } from "../../helpers/dateFormatter";
import {
  applyUnsavedEdit,
  hasConflictMarkers,
  toTagList,
} from "../../helpers/mergeText";
import deleteUnsavedEdit from "../../services/deleteUnsavedEdit";
import getArticle from "../../services/getArticle";
import getUnsavedEdits from "../../services/getUnsavedEdits";
import setArticle, { ArticleConflictError } from "../../services/setArticle";
import setUnsavedEditBase from "../../services/setUnsavedEditBase";
import FormFieldset from "../FormFieldset";
import UnsavedEdits from "../UnsavedEdits";

const emptyForm = { title: "", description: "", body: "", tagList: "" };

const appliedMessages = {
  append: "were added after the article body and tags in the editor",
  merge: "were merged with the article in the editor",
  overwrite: "replaced the article in the editor",
};

function ArticleEditorForm() {
  const { state } = useLocation();
  const [form, setForm] = useState({
    title: state?.title ?? emptyForm.title,
    description: state?.description ?? emptyForm.description,
    body: state?.body ?? emptyForm.body,
    tagList: state?.tagList ?? emptyForm.tagList,
  });
  const { title, description, body, tagList } = form;
  const [errorMessage, setErrorMessage] = useState("");
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  // The article as it was last saved, the editor's starting point. Its
  // version is sent along with an update so the server can tell when the
  // article was changed from another editor in the meantime.
  const [savedArticle, setSavedArticle] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [submitting, setSubmitting] = useState(false);

  // Changes that were rejected for that reason, and what was done with them
  const [unsavedEdits, setUnsavedEdits] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [applied, setApplied] = useState(null);

  // Set when this editor's own update was just rejected
  const conflictEditId = state?.conflictEditId;
  const conflictEdit = unsavedEdits.find(({ id }) => id === conflictEditId);

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (!slug) return;

    // The editor always starts from what is saved right now, never from a
    // copy of the article another page may have been holding for a while.
    let ignore = false;
    setLoading(true);

    (async () => {
      const article = await getArticle({ headers, slug });
      if (ignore) return;
      if (!article) throw "The article could not be loaded.";
      if (article.author.username !== loggedUser.username) return redirect();

      const edits = await getUnsavedEdits({ headers, slug });
      if (ignore) return;
      if (!edits) throw "The article could not be loaded.";

      const { body, description, tagList, title } = article;
      setForm({ body, description, tagList, title });
      setSavedArticle(article);
      setUnsavedEdits(edits);
      setAppliedIds([]);
      setApplied(null);
      setErrorMessage("");
      setLoading(false);
    })().catch((error) => {
      if (ignore) return;

      console.error(error);
      setErrorMessage(
        typeof error === "string" ? error : "The article could not be loaded.",
      );
    });

    return () => {
      ignore = true;
    };
  }, [headers, isAuth, loggedUser.username, navigate, slug, state]);

  const inputHandler = (e) => {
    const type = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [type]: value }));
  };

  const tagsInputHandler = (e) => {
    const value = e.target.value;

    setForm((form) => ({ ...form, tagList: value.split(/,| /) }));
  };

  // The update was not saved. The server kept it as an unsaved edit, which
  // shows up above the form once the editor has reloaded the saved article.
  const handleConflict = async ({ article, unsavedEdit }) => {
    if (!unsavedEdit.base && savedArticle) {
      // What this editor started from, so the edit can be merged later on
      const { body, description, tagList, title } = savedArticle;

      await setUnsavedEditBase({
        base: { body, description, tagList, title },
        editId: unsavedEdit.id,
        headers,
        slug: article.slug,
      }).catch(console.error);
    }

    // Nothing can be edited or submitted until the saved article is loaded
    setLoading(true);

    // The slug is different if the title was changed from the other editor
    navigate(`/editor/${article.slug}`, {
      replace: true,
      state: { conflictEditId: unsavedEdit.id },
    });
  };

  const formSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    if (
      hasConflictMarkers(body) &&
      !window.confirm(
        "The article body still contains merge markers (lines starting with <<<<<<< or >>>>>>>). Save it anyway?",
      )
    ) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    setArticle({
      headers,
      slug,
      body,
      description,
      // An update replaces the tags of the article with exactly these
      tagList: slug ? toTagList(tagList) : tagList,
      title,
      id: savedArticle?.id,
      version: savedArticle?.version,
      resolvedUnsavedEdits: appliedIds,
    })
      .then((slug) => navigate(`/article/${slug}`))
      .catch((error) => {
        if (error instanceof ArticleConflictError) {
          return handleConflict(error.conflict);
        }

        setErrorMessage(error);
      })
      .finally(() => setSubmitting(false));
  };

  const applyHandler = (mode, unsavedEdit) => {
    const date = dateTimeFormatter(unsavedEdit.createdAt);
    const { fields, conflicts } = applyUnsavedEdit(
      mode,
      { title, description, body, tagList },
      unsavedEdit,
      { ours: "Text in the editor", theirs: `Unsaved changes from ${date}` },
    );

    setApplied({ conflicts, date, mode, undo: { appliedIds, form }, unsavedEdit });
    setAppliedIds((ids) => [...new Set([...ids, unsavedEdit.id])]);
    setForm((form) => ({ ...form, ...fields }));
  };

  const undoHandler = () => {
    setForm(applied.undo.form);
    setAppliedIds(applied.undo.appliedIds);
    setApplied(null);
  };

  const discardHandler = (unsavedEdit) => {
    const confirmation = window.confirm(
      "Delete these unsaved changes? This cannot be undone.",
    );
    if (!confirmation) return;

    deleteUnsavedEdit({ editId: unsavedEdit.id, headers, slug })
      .then(() => {
        const isOther = ({ id }) => id !== unsavedEdit.id;

        setUnsavedEdits((edits) => edits.filter(isOther));
        setAppliedIds((ids) => ids.filter((id) => id !== unsavedEdit.id));
      })
      .catch(setErrorMessage);
  };

  return (
    <>
      {conflictEdit && !applied && (
        <div className="editor-notice editor-notice-warning" role="alert">
          <strong>Your changes were not saved.</strong> This article was
          updated from another editor window after you opened it here, and
          saving would have overwritten that update. Your changes have not
          been lost: they are kept under “Unsaved changes” below (marked “Just
          now”), where you can append them to, merge them with or overwrite
          the last saved version.
        </div>
      )}

      {!loading && (
        <UnsavedEdits
          appliedIds={appliedIds}
          disabled={submitting}
          highlightedId={conflictEditId}
          onApply={applyHandler}
          onDiscard={discardHandler}
          saved={savedArticle}
          unsavedEdits={unsavedEdits}
        />
      )}

      {applied && (
        <div className="editor-notice" role="status">
          The unsaved changes from {applied.date}{" "}
          {appliedMessages[applied.mode]}.{" "}
          {applied.conflicts.body > 0 && (
            <strong>
              {applied.conflicts.body === 1
                ? "1 part of the body was"
                : `${applied.conflicts.body} parts of the body were`}{" "}
              changed in both versions: both are kept, between lines starting
              with &lt;&lt;&lt;&lt;&lt;&lt;&lt; and
              &gt;&gt;&gt;&gt;&gt;&gt;&gt;, for you to edit.{" "}
            </strong>
          )}
          {applied.conflicts.title && (
            <strong>
              The title was changed in both versions: the one in the editor
              was kept, the unsaved one is “{applied.unsavedEdit.title}”.{" "}
            </strong>
          )}
          {applied.conflicts.description && (
            <strong>
              The description was changed in both versions: the one in the
              editor was kept, the unsaved one is “
              {applied.unsavedEdit.description}”.{" "}
            </strong>
          )}
          Review the article below, then press “Update Article” to save it.{" "}
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={submitting}
            onClick={undoHandler}
            type="button"
          >
            Undo
          </button>
        </div>
      )}

      <form onSubmit={formSubmit}>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
        <fieldset disabled={loading || submitting}>
          <FormFieldset
            placeholder="Article Title"
            name="title"
            required
            value={title}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            normal
            placeholder="What's this article about?"
            name="description"
            required
            value={description}
            handler={inputHandler}
          ></FormFieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control"
              rows="8"
              placeholder="Write your article (in markdown)"
              name="body"
              required
              value={body}
              onChange={inputHandler}
            ></textarea>
          </fieldset>

          <FormFieldset
            normal
            placeholder="Enter tags"
            name="tags"
            value={tagList}
            handler={tagsInputHandler}
          >
            <div className="tag-list"></div>
          </FormFieldset>

          <button
            className="btn btn-lg pull-xs-right btn-primary"
            type="submit"
          >
            {slug ? "Update Article" : "Publish Article"}
          </button>
        </fieldset>
      </form>
    </>
  );
}

export default ArticleEditorForm;
