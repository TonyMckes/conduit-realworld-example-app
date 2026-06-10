import { Link } from "react-router-dom";
import ArticleMeta from "../ArticleMeta";
import ArticleTags from "../ArticleTags";
import FavButton from "../FavButton";

function ArticlesPreview({ articles, loading, updateArticles }) {
  const handleFav = (article) => {
    const items = [...articles];

    const updatedArticles = items.map((item) =>
      item.slug === article.slug ? { ...item, ...article } : item,
    );

    updateArticles((prev) => ({ ...prev, articles: updatedArticles }));
  };

  return articles?.length > 0 ? (
    articles.map((article) => {
      const viewCounts =
        article.viewCounts ?? Math.floor(Math.random() * 1000);
      return (
        <div className="article-preview" key={article.slug}>
          <ArticleMeta author={article.author} createdAt={article.createdAt}>
            <div className="pull-xs-right" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#999", fontSize: "14px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {viewCounts}
              </span>
              <FavButton
                favorited={article.favorited}
                favoritesCount={article.favoritesCount}
                handler={handleFav}
                right
                slug={article.slug}
              />
            </div>
          </ArticleMeta>
          <Link
            to={`/article/${article.slug}`}
            state={article}
            className="preview-link"
          >
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <span>Read more...</span>
            <ArticleTags tagList={article.tagList} />
          </Link>
        </div>
      );
    })
  ) : loading ? (
    <div className="article-preview">Loading article...</div>
  ) : (
    <div className="article-preview">No articles available.</div>
  );
}

export default ArticlesPreview;