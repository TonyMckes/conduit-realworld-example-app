import { useState } from "react";
import CommentEditor from "../../components/CommentEditor";
import CommentList from "../../components/CommentList";

function CommentsSection() {
  const [comment, setComment] = useState({});

  const handleUpdates = (e) => {
    setComment(e);
  };

  return (
    <div className="row">
      <div className="col-xs-12 col-md-8 offset-md-2">
        <CommentEditor updateComments={handleUpdates} />
        <CommentList triggerUpdate={comment} updateComments={handleUpdates} />
      </div>
    </div>
  );
}

export default CommentsSection;
