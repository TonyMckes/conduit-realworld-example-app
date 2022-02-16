import axios from "axios";
import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../helpers/AuthContextProvider";
import dateFormatter from "../../helpers/dateFormatter";

function Comments({ comments, setNewComment, slug }) {
  const { authState, headers } = useAuth();

  const handleDelete = (commentId) => {
    const confirmation = window.confirm("Want to delete the comment?");

    if (authState.status) {
      if (!confirmation) return;

      axios
        .delete(`api/articles/${slug}/comments/${commentId}`, {
          headers: headers,
        })
        .then((res) => {
          if (res.data.errors) return console.log(res.data.errors.body);

          setNewComment(res.data.message.body);
        });
    } else alert("You need to login first");
  };

  return comments.length === 0 ? (
    <div>There are no comments yet...</div>
  ) : (
    comments.map(({ id, body, author: { username, image }, createdAt }) => (
      <div className="card" key={id}>
        <div className="card-block">
          <p className="card-text">{body}</p>
        </div>

        <div className="card-footer">
          <Link to={`/profile/${username}`} className="comment-author">
            <Avatar alt="author" src={image} className="comment-author-img" />
          </Link>{" "}
          <Link to={`/profile/${username}`} className="comment-author">
            {username}
          </Link>
          <span className="date-posted">{dateFormatter(createdAt)}</span>
          {authState.status && username === authState.loggedUser.username && (
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
  );
}

export default Comments;
