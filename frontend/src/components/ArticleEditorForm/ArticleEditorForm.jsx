import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const COVER_URL_REGEX = /^https?:\/\/.{1,2045}$/;

const emptyForm = { title: "", description: "", body: "", tagList: "", coverImage: "" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [{ title, description, body, tagList, coverImage }, setForm] = useState(
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
      .then(({ author: { username }, body, coverImage, description, tagList, title }) => {
        if (username !== loggedUser.username) redirect();

        setForm({ body, coverImage: coverImage || "", description, tagList, title });
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

    setArticle({ headers, slug, body, description, tagList, title, coverImage })
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
