import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../helpers/AuthContextProvider";

export default function ArticlePagination({ articles, setArticles, username }) {
  const [activePage, setActivePage] = useState(0);
  const { headers } = useAuth();

  const totalPages = Math.ceil(articles.articlesCount / 3);

  const handlePagination = async (pageNumber) => {
    if (pageNumber === -1 || pageNumber === totalPages) return;

    const res = await axios({
      url: username
        ? `api/articles?author=${username}&&offset=${pageNumber}`
        : `api/articles?offset=${pageNumber}`,
      method: "GET",
      headers: headers,
    });

    setActivePage(pageNumber);
    setArticles(res.data);
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
