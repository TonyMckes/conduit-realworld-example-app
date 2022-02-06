import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";
import FormFieldset from "../components/FormFieldset";

function SignIn() {
  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <Link to="/register">Need an account?</Link>
            </p>

            {/* <ul className="error-messages">
              <li>Wrong email/password combination</li>
            </ul> */}

            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("api/users/login", {
        user: { email: email, password: password },
      })
      .then((res) => {
        if (res.data.error) return console.log(res.data.error);
        localStorage.setItem("Token", res.data.user.token);
        setAuthState({ status: true, token: res.data.user.token });
        navigate("/");
      })
      .catch((arg) => console.log("Error", arg));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormFieldset
        className="form-control-lg"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></FormFieldset>

      <FormFieldset
        className="form-control-lg"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      ></FormFieldset>
      <button className="btn btn-lg btn-primary pull-xs-right">Sign in</button>
    </form>
  );
}

export default SignIn;
