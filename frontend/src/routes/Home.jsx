import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArticlePagination from "../components/ArticlePagination";
import ArticlesPreview from "../components/ArticlesPreview";
import BannerContainer from "../components/BannerContainer";
import ContainerRow from "../components/ContainerRow";
import { useAuth } from "../helpers/AuthContextProvider";
import useAxios from "../hooks/useAxios";

const FeedContext = createContext();

function Home() {
  const [articlesData, setArticlesData] = useState({});
  const [{ selectedFeed, selectedTagName }, setSelectedFeed] = useState({
    selectedFeed: "",
    selectedTagName: "",
  });
  const { headerToken, isAuth } = useAuth();

  const { data, loading } = useAxios({
    url: isAuth ? "api/articles/feed" : "api/articles",
  });

  useEffect(() => {
    setArticlesData(data);
    setSelectedFeed(
      isAuth
        ? { selectedFeed: "feed", ...selectedTagName }
        : { selectedFeed: "global", ...selectedTagName },
    );
  }, [data, isAuth]);

  const feedHandler = async (e, feedName) => {
    const tagName = e.target.innerText.trim();
    const url = {
      feed: "/api/articles/feed",
      global: "/api/articles",
      tag: `/api/articles?tag=${tagName}`,
    };

    const res = await axios.get(url[feedName], { headers: headerToken });

    setArticlesData(res.data);
    setSelectedFeed({
      selectedFeed: feedName,
      selectedTagName: tagName,
    });
  };

  return (
    <div className="home-page">
      {!isAuth && (
        <BannerContainer>
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </BannerContainer>
      )}
      <ContainerRow className="page">
        <FeedContext.Provider value={{ feedHandler, selectedFeed }}>
          <div className="col-md-9">
            <FeedToggler
              isAuth={isAuth}
              selectedFeed={selectedFeed}
              selectedTagName={selectedTagName}
            />

            <ArticlesPreview
              loading={loading}
              articlesData={articlesData}
              setArticlesData={setArticlesData}
            />

            <ArticlePagination
              loading={loading}
              articlesData={articlesData}
              setArticlesData={setArticlesData}
              location="articles"
            />
          </div>

          <PopularTags feedHandler={feedHandler} />
        </FeedContext.Provider>
      </ContainerRow>
    </div>
  );
}

function FeedToggler({ isAuth, selectedFeed, selectedTagName }) {
  return (
    <div className="feed-toggle">
      <ul className="nav nav-pills outline-active">
        {isAuth && <FeedNavLink tabName="feed" text="YourFeed" />}

        <FeedNavLink tabName="global" text="Global Feed" />

        {selectedFeed === "tag" && (
          <FeedNavLink icon tabName="tag" text={selectedTagName} />
        )}
      </ul>
    </div>
  );
}

function FeedNavLink({ icon, tabName, text }) {
  const { feedHandler, selectedFeed } = useContext(FeedContext);

  return (
    <li className="nav-item">
      <Link
        className={`nav-link ${selectedFeed === tabName ? "active" : ""}`}
        onClick={(e) => feedHandler(e, tabName)}
        to="#"
      >
        {icon && <i className="ion-pound"></i>} {text}
      </Link>
    </li>
  );
}

function PopularTags({ feedHandler }) {
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
          <p>Loading tags...</p>
        ) : tags?.length > 0 ? (
          <div className="tag-list">
            {tags.map((item) => (
              <Link
                key={item}
                to={"/"}
                className="tag-pill tag-default"
                onClick={(e) => feedHandler(e, "tag")}
              >
                {item}
              </Link>
            ))}
          </div>
        ) : (
          <p>Tags list not available</p>
        )}
      </div>
    </div>
  );
}

export default Home;
