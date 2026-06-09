import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import getArticles from "../services/getArticles";

function hashReadCount(slug) {
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 9000) + 100; // mock range: 100 - 9099
}

function useArticles({ location, tabName, tagName, username }) {
  const [{ articles, articlesCount }, setArticlesData] = useState({
    articles: [],
    articlesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { headers } = useAuth();

  useEffect(() => {
    if (!headers && tabName === "feed") return;

    setLoading(true);

    getArticles({ headers, location, tabName, tagName, username })
      .then((data) => ({
        ...data,
        articles: (data.articles || []).map((article) => ({
          ...article,
          readCount: hashReadCount(article.slug),
        })),
      }))
      .then(setArticlesData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [headers, location, tabName, tagName, username]);

  return { articles, articlesCount, loading, setArticlesData };
}

export default useArticles;
