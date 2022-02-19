import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    disabled: true,
  });
  const { headerToken, isAuth, loggedUser, setAuthState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) {
      const { image, username, bio, email } = loggedUser;

      setForm({
        ...form,
        image: image ? image : "",
        username: username ? username : "",
        bio: bio ? bio : "",
        email: email ? email : "",
        password: "",
      });
    } else navigate("/");
  }, [isAuth, loggedUser]);

  const inputHandler = (e) => {
    const input = e.currentTarget.name;
    const value = e.currentTarget.value;

    setForm({ ...form, [input]: value, disabled: false });
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    if (form.disabled) return;

    try {
      const res = await axios.put(
        "api/user",
        { user: form },
        { headers: headerToken },
      );

      if (res.data.errors) return console.log(res.data.errors.body);

      setForm({ ...form, disabled: true });

      setAuthState((authState) => ({
        ...authState,
        loggedUser: res.data.user,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    isAuth && (
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

          {!form.disabled && (
            <button
              type="submit"
              className="btn btn-lg btn-primary pull-xs-right"
            >
              Update Settings
            </button>
          )}
        </fieldset>
      </form>
    )
  );
}
