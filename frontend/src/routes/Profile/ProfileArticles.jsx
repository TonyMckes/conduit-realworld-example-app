import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ArticlePagination from "../../components/ArticlePagination";
import ArticlesPreview from "../../components/ArticlesPreview";
import useAxios from "../../hooks/useAxios";

export default function AuthorFavArticles() {
  const [articles, setArticles] = useState([]);
  const { username } = useParams();

  const { data } = useAxios({
    url: `api/articles?author=${username}`,
    dep: username,
  });

  useEffect(() => {
    setArticles(data);
  }, [data]);

  return articles && articles.length !== 0 ? (
    <>
      <ArticlesPreview articles={articles} setArticles={setArticles} />

      <ArticlePagination
        articles={articles}
        setArticles={setArticles}
        username={username}
      />
    </>
  ) : (
    <div className="article-preview">{username} doesn't have articles</div>
  );
}
