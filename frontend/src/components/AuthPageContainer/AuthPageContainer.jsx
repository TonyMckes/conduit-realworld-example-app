import { Link } from "react-router-dom";
import ContainerRow from "../ContainerRow";

function AuthPageContainer({ children, error, path, text, title }) {
  return (
    <div className="auth-page">
      <ContainerRow type="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">{title}</h1>
          <p className="text-xs-center">
            <Link to={path}>{text}</Link>
          </p>

          {error && (
            <ul className="error-messages">
              <li>{error}</li>
            </ul>
          )}

          {children}
        </div>
      </ContainerRow>
    </div>
  );
}

export default AuthPageContainer;
