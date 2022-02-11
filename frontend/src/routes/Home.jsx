import axios from "axios";
import { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import ArticlesPreview from "../components/ArticlesPreview";
import BannerContainer from "../components/BannerContainer";
import ContainerRow from "../components/ContainerRow";
import { useAuth } from "../helpers/AuthContextProvider";
import useAxios from "../hooks/useAxios";

const initialState = { global: true };

function reducer(activeTab, action) {
  switch (action.type) {
    case "feed":
      return { feed: true };

    case "global":
      return { global: true };

    case "tag":
      return { tag: true, name: action.payload.tagName };

    default:
      return activeTab;
  }
}

function Home() {
  const [articles, setArticles] = useState([]);
  const [activeTab, dispatch] = useReducer(reducer, initialState);
  const { authState, headers } = useAuth();

  const { data } = useAxios({
    url: authState.status ? "/api/articles/feed" : "api/articles",
  });

  useEffect(() => {
    dispatch(
      authState.status
        ? { type: "feed", feed: true }
        : { type: "global", feed: true },
    );
    setArticles(data?.articles);
  }, [data]);

  const allArticles = async () => {
    const res = await axios.get("/api/articles", { headers: headers });

    dispatch({ type: "global" });
    setArticles(res.data.articles);
  };

  const articlesFeed = async () => {
    const res = await axios.get("/api/articles/feed", { headers: headers });

    dispatch({ type: "feed" });
    setArticles(res.data.articles);
  };

  const articleBySlug = async (e) => {
    const res = await axios.get(`/api/articles?tag=${e.target.innerText}`, {
      headers: headers,
    });

    dispatch({ type: "tag", payload: { tagName: e.target.innerText } });
    setArticles(res.data.articles);
  };

  return (
    <div className="home-page">
      {!authState.status && (
        <BannerContainer>
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </BannerContainer>
      )}
      <ContainerRow className="page">
        <div className="col-md-9">
          <div className="feed-toggle">
            <ul className="nav nav-pills outline-active">
              {authState.status && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${activeTab.feed ? "active" : ""}`}
                    to="#"
                    onClick={articlesFeed}
                  >
                    Your Feed
                  </Link>
                </li>
              )}

              <li className="nav-item">
                <Link
                  className={`nav-link ${activeTab.global ? "active" : ""}`}
                  to="#"
                  onClick={allArticles}
                >
                  Global Feed
                </Link>
              </li>

              {activeTab.tag && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${activeTab.tag ? "active" : ""}`}
                    to="#"
                    onClick={allArticles}
                  >
                    <i className="ion-pound"></i> {activeTab.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>
          {articles && (
            <ArticlesPreview articles={articles} setArticles={setArticles} />
          )}
        </div>

        <PopularTags articleBySlug={articleBySlug} />
      </ContainerRow>
    </div>
  );
}

function PopularTags({ articleBySlug }) {
  const [tags, setTags] = useState([]);
  const { data, loading } = useAxios({
    url: "/api/tags",
  });

  useEffect(() => {
    setTags(data?.tags);
  }, [data]);

  return (
    <div className="col-md-3">
      <div className="sidebar">
        <p>Popular Tags</p>
        {loading ? (
          <p>Tags list not available</p>
        ) : (
          <div className="tag-list">
            {tags &&
              tags.map((item) => (
                <Link
                  key={item}
                  to={"/"}
                  className="tag-pill tag-default"
                  onClick={(e) => articleBySlug(e)}
                >
                  {item}
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
