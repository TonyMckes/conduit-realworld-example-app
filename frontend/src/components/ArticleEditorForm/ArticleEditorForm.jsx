import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const COVER_URL_REGEX = /^https?:\/\/.{1,2045}$/;

const emptyForm = { title: "", description: "", body: "", tagList: "", coverImage: "", title_en: "", content_en: "", summary_en: "" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [{ title, description, body, tagList, coverImage, title_en, content_en, summary_en }, setForm] = useState(
    state || emptyForm,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [coverValid, setCoverValid] = useState(true);
  const [coverTouched, setCoverTouched] = useState(false);
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then(({ author: { username }, body, coverImage, description, tagList, title, title_en, content_en, summary_en }) => {
        if (username !== loggedUser.username) redirect();

        setForm({ body, coverImage: coverImage || "", description, tagList, title, title_en: title_en || "", content_en: content_en || "", summary_en: summary_en || "" });
      })
      .catch(console.error);

    return () => setForm(emptyForm);
  }, [headers, isAuth, loggedUser.username, navigate, slug, state]);

  const inputHandler = (e) => {
    const type = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [type]: value }));
  };

  const coverInputHandler = (e) => {
    const value = e.target.value;
    setForm((form) => ({ ...form, coverImage: value }));
    setCoverTouched(true);
    setCoverValid(!value || COVER_URL_REGEX.test(value));
  };

  const tagsInputHandler = (e) => {
    const value = e.target.value;

    setForm((form) => ({ ...form, tagList: value.split(/,| /) }));
  };

  const formSubmit = (e) => {
    e.preventDefault();

    setArticle({ headers, slug, body, description, tagList, title, coverImage, title_en, content_en, summary_en })
      .then((slug) => navigate(`/article/${slug}`))
      .catch(setErrorMessage);
  };

  return (
    <form onSubmit={formSubmit}>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
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

        <fieldset className="form-group">
          <input
            className={`form-control${coverTouched ? (coverValid ? " is-valid" : " is-invalid") : ""}`}
            placeholder="Cover image URL (http/https)"
            name="coverImage"
            value={coverImage}
            onChange={coverInputHandler}
          />
          {coverTouched && !coverValid && (
            <span className="form-text text-muted">
              URL must start with http:// or https:// and be at most 2048 characters
            </span>
          )}
        </fieldset>

        <fieldset className="form-group">
          <h5>English Version</h5>
          <input
            className="form-control"
            placeholder="English Title"
            name="title_en"
            value={title_en}
            onChange={inputHandler}
          />
        </fieldset>

        <FormFieldset
          normal
          placeholder="English Summary"
          name="summary_en"
          value={summary_en}
          handler={inputHandler}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article in English (in markdown)"
            name="content_en"
            value={content_en}
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

        <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
          {slug ? "Update Article" : "Publish Article"}
        </button>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
