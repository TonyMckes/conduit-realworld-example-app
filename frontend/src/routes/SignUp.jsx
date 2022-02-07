import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContainerRow from "../components/ContainerRow";
import FormFieldset from "../components/FormFieldset";

function SignUp() {
  return (
    <div className="auth-page">
      <ContainerRow className="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Sign up</h1>
          <p className="text-xs-center">
            <Link to="/login">Already have an account?</Link>
          </p>

          {/* <ul className="error-messages">
              <li>That email is already taken</li>
            </ul> */}

          <SignUpForm />
        </div>
      </ContainerRow>
    </div>
  );
}

function SignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("api/users", {
        user: { username: username, email: email, password: password },
      })
      .then((res) => navigate("/login"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormFieldset
        className="form-control-lg"
        placeholder="Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      ></FormFieldset>

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
      <button className="btn btn-lg btn-primary pull-xs-right">Sign up</button>
    </form>
  );
}

export default SignUp;
