import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import dateFormatter from "../helpers/dateFormatter";

export default function ArticleMeta({ article }) {
  const createdAt = dateFormatter(article.createdAt);

  return (
    <>
      {article.author && (
        <div className="article-meta">
          <Link to={`/profile/${article.author.username}`}>
            <Avatar alt="author" src={article.author.image} />
          </Link>
          <div className="info">
            <Link to={`/profile/${article.author.username}`} className="author">
              {article.author.username}
            </Link>
            <span className="date">{createdAt}</span>
          </div>
          <button className="btn btn-sm btn-outline-secondary">
            <i className="ion-plus-round"></i> Follow {article.author.username}{" "}
            <span className="counter">({/* TODO:Add followers count */})</span>
          </button>{" "}
          <button className="btn btn-sm btn-outline-primary">
            <i className="ion-heart"></i> Favorite Post{" "}
            <span className="counter">({article.favoritesCount})</span>
          </button>
        </div>
      )}
    </>
  );
}
