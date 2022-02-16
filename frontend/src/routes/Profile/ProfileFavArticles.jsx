import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ArticlePagination from "../../components/ArticlePagination";
import ArticlesPreview from "../../components/ArticlesPreview";
import useAxios from "../../hooks/useAxios";

export default function AuthorFavArticles() {
  const [articlesData, setArticlesData] = useState({});
  const { articles } = articlesData || {};
  const { username } = useParams();

  const { data, loading } = useAxios({
    url: `api/articles?favorited=${username}`,
    dep: username,
  });

  useEffect(() => {
    setArticlesData(data);
  }, [data]);

  return loading ? (
    <div className="article-preview">Loading {username} favorites articles</div>
  ) : articles?.length === 0 ? (
    <div className="article-preview">{username} doesn't have favorites</div>
  ) : (
    <>
      <ArticlesPreview
        loading={loading}
        articlesData={articlesData}
        setArticlesData={setArticlesData}
      />

      <ArticlePagination
        articlesData={articlesData}
        setArticlesData={setArticlesData}
        username={username}
        location="favorites"
      />
    </>
  );
}
