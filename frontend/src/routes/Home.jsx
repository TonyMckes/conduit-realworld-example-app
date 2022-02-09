import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArticlesPreview from "../components/ArticlesPreview";
import BannerContainer from "../components/BannerContainer";
import ContainerRow from "../components/ContainerRow";
import { useAuth } from "../helpers/AuthContextProvider";
import useAxios from "../hooks/useAxios";

function Home() {
  const [articles, setArticles] = useState([]);
  const { authState, headers } = useAuth();

  const { data } = useAxios({
    url: "api/articles",
  });

  useEffect(() => {
    setArticles(data?.articles);
  }, [data]);

  const allArticles = async () => {
    const res = await axios.get("/api/articles", { headers: headers });

    setArticles(res.data.articles);
  };

  const articlesFeed = async () => {
    const res = await axios.get("/api/articles/feed", { headers: headers });
    console.log(res.data);
    setArticles(res.data.articles);
  };

  const articleBySlug = async (e) => {
    const res = await axios.get(`/api/articles?tag=${e.target.innerText}`, {
      headers: headers,
    });

    setArticles(res.data.articles);
    // TODO: open "tab"
  };

  return (
    <div className="home-page">
      <BannerContainer>
        <h1 className="logo-font">conduit</h1>
        <p>A place to share your knowledge.</p>
      </BannerContainer>
      <ContainerRow className="page">
        <div className="col-md-9">
          <div className="feed-toggle">
            <ul className="nav nav-pills outline-active">
              <li className="nav-item">
                {authState.status && (
                  <Link
                    className="nav-link disabled"
                    to="/"
                    onClick={articlesFeed}
                  >
                    Your Feed
                  </Link>
                )}
              </li>

              <li className="nav-item">
                <Link className="nav-link active" to="/" onClick={allArticles}>
                  Global Feed
                </Link>
              </li>
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
