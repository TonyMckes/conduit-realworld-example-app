import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import dateFormatter from "../helpers/dateFormatter";

export default function ArticleMeta({ article, children }) {
  const { author: { username, image } = {} } = article || {};
  const createdAt = dateFormatter(article?.createdAt);

  return (
    <div className="article-meta">
      <Link to={`/profile/${username}`}>
        <Avatar alt="author" src={image} />
      </Link>
      <div className="info">
        <Link to={`/profile/${username}`} className="author">
          {username}
        </Link>
        <span className="date">{createdAt}</span>
      </div>
      {children}
    </div>
  );
}
