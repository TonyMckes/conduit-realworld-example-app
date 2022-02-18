import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";

function ArticlePagination({
  articlesData,
  location,
  setArticlesData,
  username,
}) {
  const [activePage, setActivePage] = useState(0);
  const { articlesCount } = articlesData || 0;
  const { headerToken } = useAuth();

  const totalPages = Math.ceil(articlesCount / 3);

  const handlePagination = async (pageNumber) => {
    if (pageNumber === -1 || pageNumber === totalPages) return;

    const url = {
      articles: `api/articles?offset=${pageNumber}`,
      profile: `api/articles?author=${username}&&offset=${pageNumber}`,
      favorites: `api/articles?favorited=${username}&&offset=${pageNumber}`,
    };

    const res = await axios.get(url[location], { headers: headerToken });

    setActivePage(pageNumber);
    setArticlesData(res.data);
  };

  return (
    totalPages > 1 && (
      <ul className="pagination pagination-sm">
        <li
          className={`page-item ${activePage === 0 ? "disabled" : ""}`}
          onClick={() => handlePagination(activePage - 1)}
        >
          <Link className="page-link" to="#">
            <i className="ion-arrow-left-b"></i>
          </Link>
        </li>

        {[...Array(totalPages)].map((_, i) => {
          return (
            <li
              key={i}
              className={`page-item ${i === activePage ? "active" : ""}`}
              onClick={(e) => handlePagination(e.currentTarget.textContent - 1)}
            >
              <Link className="page-link" to="#">
                {++i}
              </Link>
            </li>
          );
        })}

        <li
          className={`page-item ${
            activePage === totalPages - 1 ? "disabled" : ""
          }`}
          onClick={() => handlePagination(activePage + 1)}
        >
          <Link className="page-link" to="#">
            <i className="ion-arrow-right-b"></i>
          </Link>
        </li>
      </ul>
    )
  );
}

export default ArticlePagination;
