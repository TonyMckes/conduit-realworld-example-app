import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArticleMeta from "../components/ArticleMeta";
import Avatar from "../components/Avatar";
import BannerContainer from "../components/BannerContainer";
import { FavButton, FollowButton } from "../components/Buttons";
import { useAuth } from "../helpers/AuthContextProvider";
import dateFormatter from "../helpers/dateFormatter";

export default function Article() {
  const [article, setArticle] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { slug } = useParams();
  const { authState, headers } = useAuth();

  useEffect(() => {
    axios.get(`api/articles/${slug}`, { headers: headers }).then((res) => {
      if (res.data.errors) return console.log(res.data.errors.body);

      setArticle(res.data.article);
    });
  }, [authState.status]);

  useEffect(() => {
    axios
      .get(`api/articles/${slug}/comments`, { headers: headers })
      .then((res) => {
        if (res.data.errors) return console.log(res.data.errors.body);

        setComments(res.data.comments);
      });
  }, [article, slug, newComment]);

  const handleFav = ({ favorited }) => {
    axios({
      url: `api/articles/${slug}/favorite`,
      method: favorited ? "delete" : "post",
      headers: headers,
    }).then((res) => {
      if (res.data.errors) return console.log(res.data.errors.body);

      setArticle(res.data.article);
    });
  };

  const followHandler = () => {
    if (authState.status) {
      axios({
        url: `api/profiles/${article.author.username}/follow`,
        method: article.author.following ? "DELETE" : "POST",
        headers: headers,
      }).then((res) => {
        setArticle({ ...article, author: res.data.profile });
      });
    } else alert("You need to login first");
  };

  return (
    <>
      {article?.tagList && (
        <div className="article-page">
          <BannerContainer>
            <h1>{article.title}</h1>
            <ArticleMeta article={article}>
              <FollowButton author={article.author} handler={followHandler} />
              <FavButton article={article} event={handleFav} text="Favorite" />
            </ArticleMeta>
          </BannerContainer>
          <div className="container page">
            <ArticleContent article={article} />
            <hr />
            <div className="article-actions">
              <ArticleMeta article={article}>
                <FollowButton author={article.author} handler={followHandler} />
                <FavButton
                  article={article}
                  event={handleFav}
                  text="Favorite"
                />
              </ArticleMeta>
            </div>
            <div className="row">
              <div className="col-xs-12 col-md-8 offset-md-2">
                <NewComment refresh={setNewComment} />
                <Comments
                  comments={comments}
                  slug={slug}
                  refresh={setNewComment}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ArticleContent({ article }) {
  return (
    article.tagList && (
      <div className="row article-content">
        <div className="col-md-12">
          <p>{article.body}</p>
          <ul>
            {article.tagList.map((tag) => (
              <li className="tag-default tag-pill tag-outline" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
}

function NewComment({ refresh }) {
  const [form, setForm] = useState({ body: "" });
  const { authState } = useAuth();
  const { slug } = useParams();

  const handleSubmit = () => {
    axios
      .post(
        `api/articles/${slug}/comments`,
        { comment: { body: form.body } },
        { headers: { Authorization: `Token ${authState.loggedUser.token}` } },
      )
      .then((res) => {
        if (res.data.errors) return console.log(res.data.errors.body);

        setForm({ body: "" });
        refresh(res.data.comment);
      });
  };

  const handleForm = (e) => {
    setForm({ body: e.target.value });
  };

  return (
    <>
      {authState.status ? (
        <form className="card comment-form" onSubmit={handleSubmit}>
          <div className="card-block">
            <textarea
              className="form-control"
              placeholder="Write a comment..."
              rows="3"
              value={form.body}
              onChange={handleForm}
            ></textarea>
          </div>
          <div className="card-footer">
            <Avatar
              alt="author"
              src={authState.loggedUser.image}
              className="comment-author-img"
            />
            <button className="btn btn-sm btn-primary">Post Comment</button>
          </div>
        </form>
      ) : (
        <span>
          <Link to="/login">Sign in</Link> or{" "}
          <Link to="/register">Sign up</Link> to add comments on this article.
        </span>
      )}
    </>
  );
}

function Comments({ comments, slug, refresh }) {
  const { authState } = useAuth();

  const handleDelete = (commentId) => {
    axios
      .delete(`api/articles/${slug}/comments/${commentId}`, {
        headers: { Authorization: `Token ${authState.loggedUser.token}` },
      })
      .then((res) => {
        if (res.data.errors) return console.log(res.data.errors.body);

        refresh(res.data.message.body);
      });
  };

  return (
    comments &&
    comments.map((comment) => {
      const createdAt = dateFormatter(comment.createdAt);

      return (
        <div className="card" key={comment.id}>
          <div className="card-block">
            <p className="card-text">{comment.body}</p>
          </div>
          <div className="card-footer">
            <Link
              to={`/profile/${comment.author.username}`}
              className="comment-author"
            >
              <Avatar
                alt="author"
                src={comment.author.image}
                className="comment-author-img"
              />
            </Link>
            &nbsp;
            <Link
              to={`/profile/${comment.author.username}`}
              className="comment-author"
            >
              {comment.author.username}
            </Link>
            <span className="date-posted">{createdAt}</span>
            {authState.status &&
              comment.author.username === authState.loggedUser.username && (
                <button
                  className="btn btn-sm btn-outline-secondary pull-xs-right"
                  onClick={(e) => handleDelete(comment.id)}
                >
                  <i className="ion-trash-a"></i>
                </button>
              )}
          </div>
        </div>
      );
    })
  );
}
