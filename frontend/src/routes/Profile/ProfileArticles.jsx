import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    setArticles(data?.articles);
  }, [data]);

  return articles ? (
    <ArticlesPreview articles={articles} setArticles={setArticles} />
  ) : (
    <div className="article-preview">{username} doesn't have any articles</div>
  );
}
