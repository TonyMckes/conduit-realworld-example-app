import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";
import ArticleMeta from "./ArticleMeta";
import { FavButton } from "./Buttons";

export default function ArticlesPreview({ articles, setArticles }) {
  const { headers } = useAuth();

  const handleFav = ({ slug, favorited, index }) => {
    axios({
      url: `api/articles/${slug}/favorite`,
      method: favorited ? "delete" : "post",
      headers: headers,
    }).then((res) => {
      if (res.data.errors) return console.log(res.data.errors.body);

      const items = [...articles];

      items[index] = res.data.article;

      setArticles(items);
    });
  };

  return articles.length !== 0 ? (
    articles.map((article, index, arr) => {
      return (
        article.author && (
          <div className="article-preview" key={article.slug}>
            <ArticleMeta article={article}>
              <FavButton
                article={article}
                event={handleFav}
                index={index}
                size="compact"
                arr={arr}
              />
            </ArticleMeta>

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
        )
      );
    })
  ) : (
    <div className="article-preview">No articles available..</div>
  );
}
