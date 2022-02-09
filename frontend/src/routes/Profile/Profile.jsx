import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import Avatar from "../../components/Avatar";
import ContainerRow from "../../components/ContainerRow";
import { useAuth } from "../../helpers/AuthContextProvider";
import useAxios from "../../hooks/useAxios";
import { FollowButton } from "../../components/Buttons";

export default function Profile() {
  const [author, setAuthor] = useState({});
  const { username } = useParams();
  const { authState, headers } = useAuth();
  const navigate = useNavigate();

  const { data } = useAxios({
    url: `api/profiles/${username}`,
    headers: headers,
  });

  useEffect(() => {
    setAuthor(data?.profile);
  }, [data]);

  const followHandler = () => {
    if (authState.status) {
      axios({
        url: `api/profiles/${username}/follow`,
        method: author.following ? "DELETE" : "POST",
        headers: headers,
      }).then((res) => {
        setAuthor(res.data.profile);
      });
    } else alert("You need to login first");
  };

  return (
    <div className="profile-page">
      <div className="user-info">
        <ContainerRow>
          {author && (
            <div className="col-xs-12 col-md-10 offset-md-1">
              <Avatar src={author.image} className="user-img" alt="author" />
              <h4>{author.username}</h4>
              <p>{author.bio}</p>
              <button
                className={`btn btn-sm btn-outline-secondary action-btn ${
                  author.following ? "active" : ""
                }`}
                onClick={followHandler}
              >
                <i className="ion-plus-round"></i>
                {author.following ? " Following " : " Follow "}
                {author.username}
              </button>
            </div>
          )}
        </ContainerRow>
      </div>

      <ContainerRow>
        <div className="col-xs-12 col-md-10 offset-md-1">
          <div className="articles-toggle">
            <ul className="nav nav-pills outline-active">
              <NavItem body="My Articles" to="" />

              <NavItem body="Favorited Articles" to="favorites" />
            </ul>
          </div>
          <Outlet />
        </div>
      </ContainerRow>
    </div>
  );
}

function NavItem({ to, body }) {
  return (
    <li className="nav-item">
      <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        to={to}
      >
        {body}
      </NavLink>
    </li>
  );
}
