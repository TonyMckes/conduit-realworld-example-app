import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";
import Avatar from "./Avatar";

function Navbar() {
  const { isAuth } = useAuth();

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          conduit
        </Link>
        <ul className="nav navbar-nav pull-xs-left">
          <a
            className="nav-link"
            href="https://github.com/TonyMckes/react-express-sequelize-realworld-example-app"
          >
            <i className="ion-social-github"></i> Source code
          </a>
        </ul>

        <ul className="nav navbar-nav pull-xs-right">
          <NavItem body="Home" icon="ion-compose" url="/" />

          {isAuth && (
            <>
              <NavItem body="New Article" icon="ion-compose" url="/editor" />
              <Dropdown />
            </>
          )}

          {!isAuth && (
            <>
              <NavItem body="Sign in" icon="ion-log-in" url="/login" />
              <NavItem body="Sign up" url="/register" />
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

function Dropdown() {
  const [dropdown, setDropdown] = useState(false);
  const { loggedUser, setAuthState } = useAuth();

  const logout = () => {
    localStorage.removeItem("Token");
    setAuthState({ headerToken: null, isAuth: false, loggedUser: {} });
  };

  return (
    <li className="nav-item dropdown">
      <Link
        className="nav-link dropdown-toggle"
        to="#"
        onClick={() => setDropdown(!dropdown)}
      >
        <Avatar className="user-pic" src={loggedUser.image} />
        {loggedUser.username}
      </Link>

      <div
        className="dropdown-menu"
        style={{ display: dropdown ? "block" : "none" }}
        onMouseLeave={() => setDropdown(!dropdown)}
      >
        <DropdownItem
          icon="ion-person"
          text="Profile"
          url={`/profile/${loggedUser.username}`}
        />
        <DropdownItem icon="ion-gear-a" text="Settings" url="/settings" />
        <div className="dropdown-divider"></div>
        <DropdownItem icon="ion-log-out" text="Logout" handler={logout} />
      </div>
    </li>
  );
}

function DropdownItem({ handler, icon, text, url }) {
  return (
    <Link className="dropdown-item" to={url ? url : "#"} onClick={handler}>
      {icon && <i className={icon}></i>} {text}
    </Link>
  );
}

function NavItem({ body, icon, url }) {
  return (
    <li className="nav-item">
      <NavLink
        className={({ isActive }) =>
          `nav-link ${isActive ? "ng-binding active" : ""}`
        }
        to={url ? url : "#"}
      >
        {icon && <i className={icon}></i>} {body}
      </NavLink>
    </li>
  );
}

export default Navbar;
