import axios from "axios";
import { useEffect, useState } from "react";
import ContainerRow from "../components/ContainerRow";
import FormFieldset from "../components/FormFieldset";
import { useAuth } from "../helpers/AuthContextProvider";

export default function Settings() {
  return (
    <div className="settings-page">
      <ContainerRow className="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Your Settings</h1>
          <SettingsForm />
        </div>
      </ContainerRow>
    </div>
  );
}

function SettingsForm() {
  const [form, setForm] = useState({
    image: "",
    username: "",
    bio: "",
    email: "",
    password: "",
  });
  const { headerToken, isAuth, loggedUser, setAuthState } = useAuth();

  useEffect(() => {
    if (isAuth) {
      const { image, username, bio, email } = loggedUser;

      setForm({
        image: image ? image : "",
        username: username,
        bio: bio ? bio : "",
        email: email,
        password: "",
      });
    }
  }, [isAuth, loggedUser]);

  const inputHandler = (e) => {
    const input = e.currentTarget.name;
    const value = e.currentTarget.value;

    setForm({ ...form, [input]: value });
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        "api/user",
        { user: form },
        { headers: headerToken },
      );

      if (res.data.errors) return console.log(res.data.errors.body);

      setAuthState((authState) => ({
        ...authState,
        loggedUser: res.data.user,
      }));
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    form && (
      <form onSubmit={formSubmit}>
        <fieldset>
          <FormFieldset
            placeholder="URL of profile picture"
            name="image"
            value={form.image}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            placeholder="Your Name"
            name="username"
            value={form.username}
            handler={inputHandler}
          ></FormFieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control form-control-lg"
              rows="8"
              placeholder="Short bio about you"
              name="bio"
              value={form.bio}
              onChange={inputHandler}
            ></textarea>
          </fieldset>

          <FormFieldset
            placeholder="Email"
            name="email"
            value={form.email}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            type="password"
            name="password"
            value={form.password}
            placeholder="Password"
            handler={inputHandler}
          ></FormFieldset>

          <button
            type="submit"
            className="btn btn-lg btn-primary pull-xs-right"
          >
            Update Settings
          </button>
        </fieldset>
      </form>
    )
  );
}
