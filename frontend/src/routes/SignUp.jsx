import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContainerRow from "../components/ContainerRow";
import FormFieldset from "../components/FormFieldset";
import { useAuth } from "../helpers/AuthContextProvider";

function SignUp() {
  const [errorMessage, setErrorMessage] = useState();

  return (
    <div className="auth-page">
      <ContainerRow className="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Sign up</h1>
          <p className="text-xs-center">
            <Link to="/login">Already have an account?</Link>
          </p>

          {errorMessage && (
            <ul className="error-messages">
              <li>{errorMessage}</li>
            </ul>
          )}

          <SignUpForm setErrorMessage={setErrorMessage} />
        </div>
      </ContainerRow>
    </div>
  );
}

function SignUpForm({ setErrorMessage }) {
  const [{ username, email, password }, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { setAuthState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("api/users", {
        user: { username: username, email: email, password: password },
      });

      if (res.data.errors) {
        setErrorMessage(res.data.errors.body);
        return console.log(res.data.errors.body);
      }

      localStorage.setItem("Token", res.data.user.token);

      const headerToken = { Authorization: `Token ${res.data.user.token}` };

      setAuthState((authState) => ({
        ...authState,
        headerToken: headerToken,
        isAuth: true,
        loggedUser: res.data.user,
      }));

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const inputHandler = (e) => {
    const input = e.currentTarget.name;
    const value = e.currentTarget.value;

    setForm((form) => ({ ...form, [input]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormFieldset
        name="username"
        required
        placeholder="Your Name"
        value={username}
        handler={inputHandler}
      ></FormFieldset>

      <FormFieldset
        name="email"
        type="email"
        required
        placeholder="Email"
        value={email}
        handler={inputHandler}
      ></FormFieldset>

      <FormFieldset
        name="password"
        type="password"
        required
        placeholder="Password"
        value={password}
        handler={inputHandler}
      ></FormFieldset>
      <button className="btn btn-lg btn-primary pull-xs-right">Sign up</button>
    </form>
  );
}

export default SignUp;
