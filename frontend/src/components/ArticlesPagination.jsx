import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import getArticles from "../services/getArticles";

function ArticlesPagination({
  articlesCount,
  location,
  setArticlesData,
  username,
}) {
  const [activePage, setActivePage] = useState(0);
  const { headers } = useAuth();
  const total = Math.round(articlesCount / 3);

  const handlePagination = (page) => {
    if (page === -1 || page === total) return;

    getArticles({ headers, page, username, location })
      .then(setArticlesData)
      .then(setActivePage(page))
      .catch((error) => console.error(error));
  };
  // BUG: Feed pagination not working
  return (
    total > 1 &&
    location !== "feed" && (
      <ul className="pagination pagination-sm">
        <li
          className={`page-item ${activePage === 0 ? "disabled" : ""}`}
          onClick={() => handlePagination(activePage - 1)}
        >
          <button className="page-link">
            <i className="ion-arrow-left-b"></i>
          </button>
        </li>

        {[...Array(total)].splice(total.length - 3).map((_, index) => (
          <li
            key={index}
            className={`page-item ${index === activePage ? "active" : ""}`}
            onClick={(e) => handlePagination(e.currentTarget.textContent - 1)}
          >
            <button className="page-link">{++index}</button>
          </li>
        ))}

        <li
          className={`page-item ${activePage === total - 1 ? "disabled" : ""}`}
          onClick={() => handlePagination(activePage + 1)}
        >
          <button className="page-link">
            <i className="ion-arrow-right-b"></i>
          </button>
        </li>
      </ul>
    )
  );
}

export default ArticlesPagination;
