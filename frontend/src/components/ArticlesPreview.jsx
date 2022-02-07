import { Link } from "react-router-dom";

export default function ArticlesPreview({ articles }) {
  return articles.map((article) => {
    const createdAt = new Date(article.createdAt).toLocaleDateString("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div className="article-preview" key={article.slug}>
        <div className="article-meta">
          <Link to={article.author.username}>
            <img src={article.author.image} alt="author" />
          </Link>

          <div className="info">
            <Link to={`profile/${article.author.username}`} className="author">
              {article.author.username}
            </Link>

            <span className="date">{createdAt}</span>
          </div>

          <button className="btn btn-outline-primary btn-sm pull-xs-right">
            <i className="ion-heart"></i> {article.favoritesCount}
          </button>
        </div>

        <Link to={`/article/${article.slug}`} className="preview-link">
          <h1>{article.title}</h1>

          <p>{article.description}</p>

          <span>Read more...</span>

          {article.tagList !== 0 && (
            <ul className="tag-list">
              {article.tagList.map((tag) => (
                <li key={tag} className="tag-default tag-pill tag-outline">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </Link>
      </div>
    );
  });
}
