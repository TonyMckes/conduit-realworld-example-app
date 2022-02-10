import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContainerRow from "../components/ContainerRow";
import FormFieldset from "../components/FormFieldset";

function SignUp() {
  const [error, setError] = useState();

  return (
    <div className="auth-page">
      <ContainerRow className="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Sign up</h1>
          <p className="text-xs-center">
            <Link to="/login">Already have an account?</Link>
          </p>

          {error && (
            <ul className="error-messages">
              <li>{error}</li>
            </ul>
          )}

          <SignUpForm setError={setError} />
        </div>
      </ContainerRow>
    </div>
  );
}

function SignUpForm({ setError }) {
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
      .then((res) => {
        if (res.data.errors) {
          setError(res.data.errors.body);
          return console.log(res.data.errors.body);
        }

        navigate("/login");
      })
      .catch((error) => {
        setError(error.response.data.errors.body);
        console.log(error.response.data.errors.body);
      });
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
