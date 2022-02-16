import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../helpers/AuthContextProvider";
import Comments from "./Comments";
import NewComment from "./NewComment";

function CommentsSection() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { headers } = useAuth();
  const { slug } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios({
          url: `api/articles/${slug}/comments`,
          headers: headers,
        });

        setComments(res.data.comments);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [slug, newComment, headers]);

  return (
    <>
      <NewComment setNewComment={setNewComment} />
      <Comments comments={comments} setNewComment={setNewComment} slug={slug} />
    </>
  );
}

export default CommentsSection;
