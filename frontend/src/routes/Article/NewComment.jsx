import axios from "axios";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../context/AuthContext";

function NewComment({ setNewComment }) {
  const [form, setForm] = useState({ body: "" });
  const { headers, isAuth, loggedUser } = useAuth();
  const { slug } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `api/articles/${slug}/comments`,
        { comment: { body: form.body } },
        { headers },
      );

      setNewComment(res.data.comment);
      setForm({ body: "" });
    } catch (error) {
      console.log(error);
    }
  };

  const handleForm = (e) => {
    setForm({ body: e.target.value });
  };

  return isAuth ? (
    <form className="card comment-form" onSubmit={(e) => handleSubmit(e)}>
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
          alt={loggedUser.username}
          src={loggedUser.image}
          className="comment-author-img"
        />
        <button className="btn btn-sm btn-primary">Post Comment</button>
      </div>
    </form>
  ) : (
    <span>
      <Link to="/login">Sign in</Link> or <Link to="/register">Sign up</Link> to
      add comments on this article.
    </span>
  );
}

export default NewComment;
