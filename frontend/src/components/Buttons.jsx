import { Link } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";

export function FavButton({ article, compact, handler, index, text }) {
  const { slug, favorited, favoritesCount } = article || {};
  const { isAuth } = useAuth();

  return (
    <button
      className={`btn btn-sm btn-outline-primary ${
        compact ? "pull-xs-right" : ""
      } ${favorited ? "active" : ""}`}
      onClick={() =>
        handler({ slug: slug, favorited: favorited, index: index })
      }
    >
      <i className="ion-heart"></i> {!isAuth ? "" : text ? text : ""}
      <span className="counter"> ( {favoritesCount} )</span>
    </button>
  );
}

export function FollowButton({ author, handler }) {
  const { following, username, followersCount } = author || {};
  const { isAuth } = useAuth();

  return (
    <>
      <button
        className={`btn btn-sm action-btn ${following ? "btn-secondary" : ""}`}
        style={{ color: "#777" }}
        onClick={handler}
      >
        {isAuth && (
          <i className={following ? "ion-minus-round" : "ion-plus-round"}></i>
        )}{" "}
        {!isAuth ? "Followers" : following ? " Unfollow " : " Follow "}{" "}
        {isAuth && username}
        <span className="counter"> ( {followersCount} )</span>
      </button>{" "}
    </>
  );
}

export function ArticleButtons({ handler, slug }) {
  return (
    <>
      <button
        className="btn btn-sm"
        style={{ color: "#d00" }}
        onClick={handler}
      >
        <i className="ion-trash-a"></i> Delete Article
      </button>{" "}
      <button className="btn btn-sm" style={{ color: "#777" }}>
        <Link className="nav-link" to={`/editor/${slug}`}>
          <i className="ion-edit"></i> Edit Article
        </Link>
      </button>{" "}
    </>
  );
}
