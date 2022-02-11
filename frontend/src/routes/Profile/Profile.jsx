import axios from "axios";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { FollowButton } from "../../components/Buttons";
import ContainerRow from "../../components/ContainerRow";
import { useAuth } from "../../helpers/AuthContextProvider";
import useAxios from "../../hooks/useAxios";

export default function Profile() {
  const [author, setAuthor] = useState({});
  const { authState, headers } = useAuth();
  const { username } = useParams();

  const { data } = useAxios({
    url: `api/profiles/${username}`,
    headers: headers,
    dep: username,
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

              {username === authState.loggedUser.username ? (
                <Link
                  className="btn btn-sm btn-outline-secondary action-btn"
                  to="/settings"
                >
                  <i className="ion-gear-a"></i> Edit Profile Settings
                </Link>
              ) : (
                <FollowButton author={author} handler={followHandler} />
              )}
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
        end
      >
        {body}
      </NavLink>
    </li>
  );
}
