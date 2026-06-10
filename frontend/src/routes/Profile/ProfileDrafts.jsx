import { useParams } from "react-router-dom";
import ArticlesPagination from "../../components/ArticlesPagination";
import ArticlesPreview from "../../components/ArticlesPreview";
import useArticleList from "../../hooks/useArticles";

function ProfileDrafts() {
  const { username } = useParams();

  const { articles, articlesCount, loading, setArticlesData } = useArticleList({
    location: "drafts",
    username,
  });

  return loading ? (
    <div className="article-preview">
      <em>Loading drafts...</em>
    </div>
  ) : articles.length > 0 ? (
    <>
      <ArticlesPreview
        articles={articles}
        loading={loading}
        updateArticles={setArticlesData}
      />

      <ArticlesPagination
        articlesCount={articlesCount}
        location="drafts"
        updateArticles={setArticlesData}
        username={username}
      />
    </>
  ) : (
    <div className="article-preview">No drafts found.</div>
  );
}

export default ProfileDrafts;
