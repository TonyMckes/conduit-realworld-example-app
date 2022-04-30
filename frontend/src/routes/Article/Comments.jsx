import axios from "axios";
import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../context/AuthContext";
import dateFormatter from "../../helpers/dateFormatter";

function Comments({ comments, setNewComment, slug }) {
  const { headers, isAuth, loggedUser } = useAuth();

  const handleDelete = (commentId) => {
    const confirmation = window.confirm("Want to delete the comment?");

    if (isAuth) {
      if (!confirmation) return;
      console.log(slug, commentId);
      axios
        .delete(`api/articles/${slug}/comments/${commentId}`, {
          headers,
        })
        .then((res) => {
          if (res.data.errors) return console.log(res.data.errors.body);

          setNewComment(res.data.message.body);
        });
    } else alert("You need to login first");
  };

  return comments?.length > 0 ? (
    comments.map(({ id, body, author: { username, image }, createdAt }) => (
      <div className="card" key={id}>
        <div className="card-block">
          <p className="card-text">{body}</p>
        </div>

        <div className="card-footer">
          <Link
            to={`/profile/${username}`}
            // state={{ bio, followersCount, following, image }}
            className="comment-author"
          >
            <Avatar alt={username} src={image} className="comment-author-img" />
          </Link>{" "}
          <Link
            to={`/profile/${username}`}
            // state={{ bio, followersCount, following, image }}
            className="comment-author"
          >
            {username}
          </Link>
          <span className="date-posted">{dateFormatter(createdAt)}</span>
          {isAuth && username === loggedUser.username && (
            <button
              className="btn btn-sm btn-outline-secondary pull-xs-right"
              onClick={() => handleDelete(id)}
            >
              <i className="ion-trash-a"></i>
            </button>
          )}
        </div>
      </div>
    ))
  ) : (
    <div>There are no comments yet...</div>
  );
}

export default Comments;
