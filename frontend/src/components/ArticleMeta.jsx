import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import dateFormatter from "../helpers/dateFormatter";

export default function ArticleMeta({ article, children }) {
  const createdAt = dateFormatter(article.createdAt);

  return (
    article.author && (
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
        {children}
      </div>
    )
  );
}
