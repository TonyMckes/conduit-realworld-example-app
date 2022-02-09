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
  const { authState, setAuthState, headers } = useAuth();

  useEffect(() => {
    if (authState.status) {
      const user = authState.loggedUser;

      setForm({
        image: user.image ? user.image : "",
        username: user.username,
        bio: user.bio ? user.bio : "",
        email: user.email,
        password: "",
      });
    }
  }, [authState.loggedUser]);

  const inputHandler = (e) => {
    const input = e.currentTarget.name;
    const value = e.currentTarget.value;

    setForm({ ...form, [input]: value });
  };

  const formSubmit = (e) => {
    e.preventDefault();

    axios.put("api/user", { user: form }, { headers: headers }).then((res) => {
      if (res.data.errors) return console.log(res.data.errors.body);

      setAuthState({ ...authState, loggedUser: res.data.user });
    });
  };

  return (
    <>
      {form && (
        <form onSubmit={formSubmit}>
          <fieldset>
            <FormFieldset
              className="form-control-lg"
              placeholder="URL of profile picture"
              name="image"
              value={form.image}
              onChange={inputHandler}
            ></FormFieldset>

            <FormFieldset
              className="form-control-lg"
              placeholder="Your Name"
              name="username"
              value={form.username}
              onChange={inputHandler}
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
              className="form-control-lg"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={inputHandler}
            ></FormFieldset>

            <FormFieldset
              className="form-control-lg"
              type="password"
              name="password"
              value={form.password}
              placeholder="Password"
              onChange={inputHandler}
            ></FormFieldset>

            <button
              type="submit"
              className="btn btn-lg btn-primary pull-xs-right"
            >
              Update Settings
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
}
