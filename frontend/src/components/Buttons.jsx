import { Link } from "react-router-dom";

export function FavButton({ article, event, index, size, text, arr }) {
  return (
    article.author && (
      <button
        className={`btn btn-sm btn-outline-primary ${
          size ? "pull-xs-right" : ""
        } ${article.favorited ? "active" : ""}`}
        onClick={() =>
          event({
            slug: article.slug,
            favorited: article.favorited,
            index: index,
            arr: arr,
          })
        }
      >
        <i className="ion-heart"></i> {text ? text : ""}
        <span className="counter"> ( {article.favoritesCount} )</span>
      </button>
    )
  );
}

export function FollowButton({ author, handler }) {
  return (
    <>
      <button
        className={`btn btn-sm action-btn ${
          author.following ? "btn-secondary" : ""
        }`}
        style={{ color: "#777" }}
        onClick={handler}
      >
        <i
          className={author.following ? "ion-minus-round" : "ion-plus-round"}
        ></i>
        {author.following ? " Unfollow " : " Follow "}
        {author.username}
        <span className="counter"> ( {author.followersCount} )</span>
      </button>{" "}
    </>
  );
}

export function ArticleButtons({ url, handler }) {
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
        <Link className="nav-link" to={url}>
          <i className="ion-edit"></i> Edit Article
        </Link>
      </button>{" "}
    </>
  );
}
