import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArticlesPreview from "../components/ArticlesPreview";
import ContainerRow from "../components/ContainerRow";
import BannerContainer from "../components/BannerContainer";
import { useAuth } from "../helpers/AuthContextProvider";

function Home() {
  const [tags, setTags] = useState([]);
  const [articles, setArticles] = useState([]);
  const { authState } = useAuth();

  useEffect(() => {
    axios.get("/api/articles").then((res) => setArticles(res.data.articles));
    axios.get("/api/tags").then((res) => setTags(res.data.tags));
  }, []);

  const allArticles = (e) => {
    axios.get("/api/articles").then((res) => setArticles(res.data.articles));
  };

  const articlesFeed = (e) => {
    axios
      .get("/api/articles/feed")
      .then((res) => setArticles(res.data.articles));
  };

  const articleBySlug = (e) => {
    axios
      .get(`/api/articles?tag=${e.target.textContent}`)
      .then((res) => setArticles(res.data.articles));
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
          {articles && <ArticlesPreview articles={articles} />}
        </div>

        <PopularTags tags={tags} articleBySlug={articleBySlug} />
      </ContainerRow>
    </div>
  );
}

function PopularTags({ tags, articleBySlug }) {
  return (
    <div className="col-md-3">
      <div className="sidebar">
        <p>Popular Tags</p>

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
      </div>
    </div>
  );
}

export default Home;
