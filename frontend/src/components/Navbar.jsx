import { Link } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";

function Navbar() {
  const { authState, setAuthState } = useAuth();

  const logout = () => {
    localStorage.removeItem("Token");
    setAuthState({ status: false, token: "" });
  };

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          conduit
        </Link>
        <ul className="nav navbar-nav pull-xs-right">
          <NavButton body="Home" icon="ion-compose" url="/" />

          {authState.status && (
            <>
              <NavButton body="New Article" icon="ion-compose" url="/editor" />
              <NavButton body="Settings" icon="ion-gear-a" url="/settings" />
              <NavButton body="Logout" url="/" logout={logout} />
            </>
          )}

          {!authState.status && (
            <>
              <NavButton body="Sign in" url="/login" />
              <NavButton body="Sign up" url="/register" />
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

function NavButton({ body, icon, url, logout }) {
  return (
    <li className="nav-item">
      <Link className="nav-link" to={url} onClick={logout}>
        {icon && <i className={icon}></i>} {body}
      </Link>
    </li>
  );
}

export default Navbar;
