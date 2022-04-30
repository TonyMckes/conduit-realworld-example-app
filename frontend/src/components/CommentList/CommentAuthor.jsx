import { Link } from "react-router-dom";
import Avatar from "../Avatar";

function CommentAuthor({ bio, followersCount, following, image, username }) {
  return (
    <>
      <Link
        className="comment-author"
        state={{ bio, followersCount, following, image }}
        to={`/profile/${username}`}
      >
        <Avatar alt={username} className="comment-author-img" src={image} />
      </Link>{" "}
      <Link
        className="comment-author"
        state={{ bio, followersCount, following, image }}
        to={`/profile/${username}`}
      >
        {username}
      </Link>
    </>
  );
}
export default CommentAuthor;
