import { Link } from "react-router-dom";
import ArticleTags from "../components/ArticleTags";
import ArticleMeta from "./ArticleMeta";
import FavButton from "./FavButton";

function ArticlesPreview({ articles, loading, setArticlesData }) {
  // TODO: Can be improved
  const handleFav = (article) => {
    // favorited, favoritesCount
    const items = [...articles];

    const updatedArticles = items.map((item) =>
      item.slug === article.slug ? { ...item, ...article } : item,
    );

    setArticlesData((prev) => ({ ...prev, articles: updatedArticles }));
  };

  return articles?.length > 0 ? (
    articles.map((article) => {
      const {
        author,
        createdAt,
        description,
        favorited,
        favoritesCount,
        slug,
        tagList,
        title,
      } = article;

      return (
        <div className="article-preview" key={slug}>
          <ArticleMeta author={author} createdAt={createdAt}>
            <FavButton
              favorited={favorited}
              favoritesCount={favoritesCount}
              handler={handleFav}
              right
              slug={slug}
            />
          </ArticleMeta>
          <Link
            to={`/article/${slug}`}
            state={article}
            className="preview-link"
          >
            <h1>{title}</h1>
            <p>{description}</p>
            <span>Read more...</span>
            <ArticleTags tagList={tagList} />
          </Link>
        </div>
      );
    })
  ) : loading ? (
    <div className="article-preview">Loading articles...</div>
  ) : (
    <div className="article-preview">No articles available.</div>
  );
}

export default ArticlesPreview;
