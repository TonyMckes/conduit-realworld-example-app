import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userLogin from "../../services/userLogin";
import FormFieldset from "../FormFieldset";

function LoginForm({ onError }) {
  const [{ email, password }, setForm] = useState({ email: "", password: "" });
  const { setAuthState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    userLogin({ email, password })
      .then(setAuthState)
      .then(() => navigate("/"))
      .catch(onError);
  };

  const inputHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormFieldset
        type="email"
        name="email"
        required
        placeholder="Email"
        value={email}
        handler={inputHandler}
        autoFocus
      ></FormFieldset>

      <FormFieldset
        name="password"
        type="password"
        required
        placeholder="Password"
        value={password}
        handler={inputHandler}
        minLength="5"
      ></FormFieldset>
      <button className="btn btn-lg btn-primary pull-xs-right">Login</button>
    </form>
  );
}

export default LoginForm;
