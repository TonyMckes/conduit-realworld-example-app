import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContainerRow from "../components/ContainerRow";
import FormFieldset from "../components/FormFieldset";
import { useAuth } from "../helpers/AuthContextProvider";
import useAxios from "../hooks/useAxios";

export default function ArticleEditor() {
  return (
    <div className="editor-page">
      <ContainerRow className="page">
        <div className="col-md-10 offset-md-1 col-xs-12">
          <ArticleEditorForm />
        </div>
      </ContainerRow>
    </div>
  );
}

function ArticleEditorForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    body: "",
    tagList: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const { isAuth, headerToken, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  const { data, loading } = useAxios({
    url: `api/articles/${slug}`,
    headers: headerToken,
  });

  useEffect(() => {
    if (isAuth) {
      const {
        article: {
          title,
          description,
          body,
          tagList,

          author: { username: author } = {},
        } = {},

        article,
      } = data || {};

      if (slug && article && author === loggedUser.username) {
        setForm({
          title: title,
          description: description,
          body: body,
          tagList: tagList,
        });
      }
    } else navigate("/");

    return () =>
      setForm({
        title: "",
        description: "",
        body: "",
        tagList: "",
      });
  }, [data, isAuth, loggedUser.username, slug]);

  const inputHandler = (e) => {
    const input = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (e.currentTarget.name === "title") setErrorMessage("");

    setForm({ ...form, [input]: value });
  };

  const tagsInputHandler = (e) => {
    const value = e.currentTarget.value;

    setForm({ ...form, tagList: value.split(/,| /) });
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios({
        url: slug ? `api/articles/${slug}` : "api/articles",
        method: slug ? "PUT" : "POST",
        data: { article: form },
        headers: headerToken,
      });

      if (res.data.errors) return setErrorMessage(res.data.errors.body);

      setForm({
        title: "",
        description: "",
        body: "",
        tagList: "",
      });

      navigate(`/article/${res.data.article.slug}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    !loading && (
      <form onSubmit={formSubmit}>
        <fieldset>
          {errorMessage && (
            <span className="error-messages">{errorMessage}</span>
          )}
          <FormFieldset
            placeholder="Article Title"
            name="title"
            required
            value={form.title}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            normal
            placeholder="What's this article about?"
            name="description"
            required
            value={form.description}
            handler={inputHandler}
          ></FormFieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control"
              rows="8"
              placeholder="Write your article (in markdown)"
              name="body"
              required
              value={form.body}
              onChange={inputHandler}
            ></textarea>
          </fieldset>

          <FormFieldset
            normal
            placeholder="Enter tags"
            name="tags"
            value={form.tagList}
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
    )
  );
}
