import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [tags, setTags] = useState([]);
  const [articles, setArticles] = useState([]);

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
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <Link
                    className="nav-link disabled"
                    to="/"
                    onClick={articlesFeed}
                  >
                    Your Feed
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link active"
                    to="/"
                    onClick={allArticles}
                  >
                    Global Feed
                  </Link>
                </li>
              </ul>
            </div>
            <Articles articles={articles} />
          </div>

          <PopularTags tags={tags} articleBySlug={articleBySlug} />
        </div>
      </div>
    </div>
  );
}

function Articles({ articles }) {
  return (
    <>
      {articles &&
        articles.map((item) => {
          return (
            <div key={item.slug} className="article-preview">
              <div className="article-meta">
                <Link to="/profile">
                  <img src="http://i.imgur.com/Qr71crq.jpg" alt="" />
                </Link>
                <div className="info">
                  <Link to="" className="author">
                    {item.author.username}
                  </Link>
                  <span className="date">{item.createdAt}</span>
                </div>
                <button className="btn btn-outline-primary btn-sm pull-xs-right">
                  <i className="ion-heart"></i> {item.favoritesCount}
                </button>
              </div>
              <Link to="/article" className="preview-link">
                <h1>{item.title}</h1>
                <p>{item.description}</p>
                <span>Read more...</span>
              </Link>
            </div>
          );
        })}
    </>
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
