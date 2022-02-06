import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ArticlesPreview from "../../components/ArticlesPreview";

export default function AuthorFavArticles() {
  const [articles, setArticles] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    axios.get(`api/articles?favorited=${username}`).then((res) => {
      if (res.data.errors) console.log(res.data.errors.body);

      setArticles(res.data.articles);
    });
  }, []);

  return (
    <>
      {articles.length !== 0 ? (
        <ArticlesPreview articles={articles} />
      ) : (
        <div className="article-preview">
          {username} doesn't have favorite articles
        </div>
      )}
    </>
  );
}
