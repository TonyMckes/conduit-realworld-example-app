import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userUpdate from "../../services/userUpdate";
import FormFieldset from "../FormFieldset";

function SettingsForm() {
  const { headers, isAuth, loggedUser, setAuthState } = useAuth();
  const [{ bio, email, image, password, username }, setForm] = useState({
    bio: loggedUser.bio || "",
    email: loggedUser.email,
    image: loggedUser.image || "",
    password: loggedUser.password || "",
    username: loggedUser.username,
  });

  const [inactive, setInactive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) navigate("/");
  }, [isAuth, loggedUser, navigate]);

  const inputHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [name]: value }));
    setInactive(false);
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    if (inactive) return;

    userUpdate({ headers, bio, email, image, password, username })
      .then(setAuthState)
      .catch(console.error);
    setInactive(true);
  };

  return (
    isAuth && (
      <form onSubmit={formSubmit}>
        <fieldset>
          <FormFieldset
            placeholder="URL of profile picture"
            name="image"
            value={image}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            placeholder="Your Name"
            name="username"
            required
            value={username}
            handler={inputHandler}
          ></FormFieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control form-control-lg"
              rows="8"
              placeholder="Short bio about you"
              name="bio"
              value={bio}
              onChange={inputHandler}
            ></textarea>
          </fieldset>

          <FormFieldset
            placeholder="Email"
            name="email"
            required
            value={email}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            type="password"
            name="password"
            value={password}
            placeholder="Password"
            handler={inputHandler}
          ></FormFieldset>

          {!inactive && (
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

export default SettingsForm;
