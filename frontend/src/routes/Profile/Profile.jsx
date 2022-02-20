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
  const { bio, following, image, username: authorName } = author || {};
  const { headerToken, isAuth, loggedUser } = useAuth();
  const { username } = useParams();

  const { data, loading } = useAxios({
    url: `api/profiles/${username}`,
    headers: headerToken,
    dep: username,
  });

  useEffect(() => {
    setAuthor(data?.profile);
  }, [data]);

  const followHandler = async () => {
    if (isAuth) {
      try {
        const res = await axios({
          url: `api/profiles/${username}/follow`,
          method: following ? "DELETE" : "POST",
          headers: headerToken,
        });

        if (res.data.errors) return console.log(res.data.errors.body);

        setAuthor(res.data.profile);
      } catch (error) {
        console.log(error);
      }
    } else alert("You need to login first");
  };

  return (
    <div className="profile-page">
      <div className="user-info">
        <ContainerRow>
          {!loading && (
            <div className="col-xs-12 col-md-10 offset-md-1">
              <Avatar src={image} className="user-img" alt="author" />
              <h4>{authorName}</h4>
              <p>{bio}</p>

              {username === loggedUser.username ? (
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
              <NavItem text="My Articles" url="" />

              <NavItem text="Favorited Articles" url="favorites" />
            </ul>
          </div>
          <Outlet />
        </div>
      </ContainerRow>
    </div>
  );
}
function NavItem({ url, text }) {
  return (
    <li className="nav-item">
      <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        to={url}
        end
      >
        {text}
      </NavLink>
    </li>
  );
}
