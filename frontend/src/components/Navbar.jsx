import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";
import Avatar from "./Avatar";

function Navbar() {
  const { authState } = useAuth();

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          conduit
        </Link>
        <ul className="nav navbar-nav pull-xs-right">
          <NavItem body="Home" icon="ion-compose" url="/" />

          {authState.status && (
            <>
              <NavItem body="New Article" icon="ion-compose" url="/editor" />
              <Dropdown />
            </>
          )}

          {!authState.status && (
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
  const { authState, setAuthState } = useAuth();

  const logout = () => {
    localStorage.removeItem("Token");
    setAuthState({ status: false, loggedUser: {} });
  };

  return (
    <li className="nav-item dropdown">
      <Link
        className="nav-link dropdown-toggle"
        to="#"
        onClick={() => setDropdown(!dropdown)}
      >
        <Avatar className="user-pic" src={authState.loggedUser.image} />
        {authState.loggedUser.username}
      </Link>

      <div
        className="dropdown-menu"
        style={{ display: dropdown ? "block" : "none" }}
        onMouseLeave={() => setDropdown(!dropdown)}
      >
        <DropdownItem
          icon="ion-person"
          text="Profile"
          url={`/profile/${authState.loggedUser.username}`}
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
