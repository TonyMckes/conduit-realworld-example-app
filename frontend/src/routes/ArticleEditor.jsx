import axios from "axios";
import { useState } from "react";
import ContainerRow from "../components/ContainerRow";
import FormFieldset from "../components/FormFieldset";
import { useAuth } from "../helpers/AuthContextProvider";

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
  const { authState } = useAuth();

  const inputHandler = (e) => {
    const input = e.currentTarget.name;
    const value = e.currentTarget.value;

    setForm({ ...form, [input]: value });
  };

  const tagsInputHandler = (e) => {
    const value = e.currentTarget.value;

    setForm({ ...form, tagList: value.split(",") });
  };

  const formSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        "api/articles",
        { article: form },
        { headers: { Authorization: `Token ${authState.loggedUser.token} ` } },
      )
      .then((res) => {
        if (res.data.errors) return console.log(res.data.errors.body);

        setForm({
          title: "",
          description: "",
          body: "",
          tagList: "",
        });
      });
  };

  return (
    <form onSubmit={formSubmit}>
      <fieldset>
        <FormFieldset
          className="form-control-lg"
          placeholder="Article Title"
          name="title"
          value={form.title}
          onChange={inputHandler}
        ></FormFieldset>

        <FormFieldset
          placeholder="What's this article about?"
          name="description"
          value={form.description}
          onChange={inputHandler}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article (in markdown)"
            name="body"
            value={form.body}
            onChange={inputHandler}
          ></textarea>
        </fieldset>

        <FormFieldset
          placeholder="Enter tags"
          name="tags"
          value={form.tagList}
          onChange={tagsInputHandler}
        >
          <div className="tag-list"></div>
        </FormFieldset>

        <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
          Publish Article
        </button>
      </fieldset>
    </form>
  );
}
