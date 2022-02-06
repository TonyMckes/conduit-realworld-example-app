import axios from "axios";
import { useState } from "react";
import { useAuth } from "../helpers/AuthContextProvider";

function ArticleEditor() {
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
        { headers: { Authorization: `Token ${authState.token} ` } },
      )
      .then((res) => {
        if (res.data.errors) return console.log(res.data.errors.body[0]);

        setForm({
          title: "",
          description: "",
          body: "",
          tagList: "",
        });
      });
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <form onSubmit={formSubmit}>
              <fieldset>
                <Fieldset>
                  <Input
                    className="form-control"
                    placeholder="Article Title"
                    name="title"
                    value={form.title}
                    handler={inputHandler}
                  />
                </Fieldset>
                <Fieldset>
                  <Input
                    placeholder="What's this article about?"
                    name="description"
                    value={form.description}
                    handler={inputHandler}
                  />
                </Fieldset>

                <Fieldset>
                  <textarea
                    className="form-control"
                    rows="8"
                    placeholder="Write your article (in markdown)"
                    name="body"
                    value={form.body}
                    onChange={inputHandler}
                  ></textarea>
                </Fieldset>

                <Fieldset>
                  <Input
                    placeholder="Enter tags"
                    name="tags"
                    value={form.tagList}
                    handler={tagsInputHandler}
                  />
                  <div className="tag-list"></div>
                </Fieldset>

                <button
                  className="btn btn-lg pull-xs-right btn-primary"
                  type="submit"
                >
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fieldset({ children }) {
  return <fieldset className="form-group">{children}</fieldset>;
}

function Input({ placeholder, className, name, value, handler }) {
  return (
    <input
      type="text"
      className={`form-control ${className}`}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={handler}
    />
  );
}

export default ArticleEditor;
