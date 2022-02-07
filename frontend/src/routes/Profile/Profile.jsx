import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import Avatar from "../../components/Avatar";
import ContainerRow from "../../components/ContainerRow";

export default function Profile() {
  const [author, setAuthor] = useState({});
  const { username } = useParams();

  useEffect(() => {
    axios.get(`api/profiles/${username}`).then((res) => {
      if (res.data.errors) console.log(res.data.errors.body);

      setAuthor(res.data.profile);
    });
  }, []);

  useEffect(() => {}, [author]);

  // FIXME: Following status not being save on db
  // const followHandler = (arg) => {
  //   if (author.following) {
  //     axios
  //       .delete(`api/profiles/${username}/follow`, {
  //         headers: { Authorization: `Token ${authState.token}` },
  //       })
  //       .then((res) => {
  //         if (res.data.errors) console.log(res.data.errors.body);

  //         setAuthor({ ...author, following: false });
  //       });
  //   } else {
  //     axios
  //       .post(`api/profiles/${username}/follow`, null, {
  //         headers: { Authorization: `Token ${authState.token}` },
  //       })
  //       .then((res) => {
  //         if (res.data.errors) console.log(res.data.errors.body);

  //         setAuthor({ ...author, following: true });
  //       });
  //   }
  // };

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
                className="btn btn-sm btn-outline-secondary action-btn"
                // onClick={followHandler}
              >
                <i className="ion-plus-round"></i>
                {author.following ? " Unfollow " : " Follow "}
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
