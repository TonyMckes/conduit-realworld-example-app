import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContainerRow from "../components/ContainerRow";
import FormFieldset from "../components/FormFieldset";
import { useAuth } from "../helpers/AuthContextProvider";

function SignIn() {
  const [errorMessage, setErrorMessage] = useState();

  return (
    <div className="auth-page">
      <ContainerRow className="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Sign in</h1>
          <p className="text-xs-center">
            <Link to="/register">Need an account?</Link>
          </p>

          {errorMessage && (
            <ul className="error-messages">
              <li>{errorMessage}</li>
            </ul>
          )}

          <SignInForm setErrorMessage={setErrorMessage} />
        </div>
      </ContainerRow>
    </div>
  );
}

function SignInForm({ setErrorMessage }) {
  const [{ email, password }, setForm] = useState({ email: "", password: "" });
  const { setAuthState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("api/users/login", {
        user: { email: email, password: password },
      });

      if (res.data.errors) return console.log(res.data.errors.body);

      localStorage.setItem("Token", res.data.user.token);

      const headerToken = { Authorization: `Token ${res.data.user.token}` };

      setAuthState({
        headerToken: headerToken,
        isAuth: true,
        loggedUser: res.data.user,
      });

      navigate("/");
    } catch (error) {
      setErrorMessage(error.response.data.errors.body);
      console.log(error);
    }
  };

  const inputHandler = (e) => {
    const input = e.currentTarget.type;
    const value = e.currentTarget.value;

    setForm((form) => ({ ...form, [input]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormFieldset
        type="email"
        required
        placeholder="Email"
        value={email}
        handler={inputHandler}
      ></FormFieldset>

      <FormFieldset
        type="password"
        required
        placeholder="Password"
        value={password}
        handler={inputHandler}
      ></FormFieldset>
      <button className="btn btn-lg btn-primary pull-xs-right">Sign in</button>
    </form>
  );
}

export default SignIn;
