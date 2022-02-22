import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="container">
      <Link to="/" className="logo-font">
        conduit
      </Link>
      <span className="attribution">
        An interactive learning project from{" "}
        <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed
        under MIT.
      </span>

      <ul className="nav navbar-nav pull-xs-right">
        <a
          className="nav-link"
          href="https://github.com/TonyMckes/react-express-sequelize-realworld-example-app"
        >
          <i className="ion-social-github"></i> Source code
        </a>
      </ul>
    </div>
  );
}

export default Footer;
