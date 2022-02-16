import axios from "axios";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ArticleMeta from "../../components/ArticleMeta";
import ArticleTags from "../../components/ArticleTags";
import BannerContainer from "../../components/BannerContainer";
import {
  ArticleButtons,
  FavButton,
  FollowButton
} from "../../components/Buttons";
import { useAuth } from "../../helpers/AuthContextProvider";
import useAxios from "../../hooks/useAxios";

export default function Article() {
  const [article, setArticle] = useState({});
  const { title, body, tagList } = article || {};
  const { authState, headers } = useAuth();
  const { slug } = useParams();

  const { data, loading } = useAxios({
    url: `api/articles/${slug}`,
    headers: headers,
  });

  useEffect(() => {
    setArticle(data.article);
  }, [data, authState.status]);

  return (
    !loading && (
      <div className="article-page">
        <BannerContainer>
          <h1>{title}</h1>
          <ArticleMeta article={article}>
            <ArticlesButtons article={article} setArticle={setArticle} />
          </ArticleMeta>
        </BannerContainer>

        <div className="container page">
          <div className="row article-content">
            <div className="col-md-12">
              <p>{body}</p>
              <ArticleTags tagList={tagList} />
            </div>
          </div>

          <hr />

          <div className="article-actions">
            <ArticleMeta article={article}>
              <ArticlesButtons article={article} setArticle={setArticle} />
            </ArticleMeta>
          </div>

          <div className="row">
            <div className="col-xs-12 col-md-8 offset-md-2">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    )
  );
}

function ArticlesButtons({ article, setArticle }) {
  const {
    author: { username, following },
    author,
  } = article;
  const { authState, headers } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  const deleteArticle = () => {
    const confirmation = window.confirm("Want to delete the article?");

    if (authState.status) {
      if (!confirmation) return;

      axios({
        url: `api/articles/${slug}/`,
        method: "DELETE",
        headers: headers,
      }).then((res) => {
        navigate("/");
      });
    } else alert("You need to login first");
  };

  const followHandler = () => {
    if (authState.status) {
      axios({
        url: `api/profiles/${username}/follow`,
        method: following ? "DELETE" : "POST",
        headers: headers,
      }).then((res) => {
        setArticle({ ...article, author: res.data.profile });
      });
    } else alert("You need to login first");
  };

  const handleFav = ({ favorited }) => {
    console.log("favorited", favorited);
    axios({
      url: `api/articles/${slug}/favorite`,
      method: favorited ? "DELETE" : "POST",
      headers: headers,
    }).then((res) => {
      if (res.data.errors) return console.log(res.data.errors.body);

      setArticle(res.data.article);
    });
  };

  return (
    <>
      {authState.loggedUser.username === username ? (
        <ArticleButtons handler={deleteArticle} slug={slug} />
      ) : (
        <FollowButton author={author} handler={followHandler} />
      )}
      <FavButton article={article} handler={handleFav} text="Favorite" />
    </>
  );
}
