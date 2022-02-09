export function FavButton({ article, event, index, size, text, arr }) {
  return (
    article.author && (
      <button
        className={`btn btn-sm btn-outline-primary ${
          size ? "pull-xs-right" : ""
        } ${article.favorited ? "active" : ""}`}
        onClick={() =>
          event({
            slug: article.slug,
            favorited: article.favorited,
            index: index,
            arr: arr,
          })
        }
      >
        <i className="ion-heart"></i> {text ? text : ""}{" "}
        <span className="counter">{article.favoritesCount}</span>
      </button>
    )
  );
}

export function FollowButton({ article, handler }) {
  return (
    article.author && (
      <>
        <button
          className={`btn btn-sm btn-outline-secondary ${
            article.author.following ? "active" : ""
          }`}
          onClick={handler}
        >
          <i className="ion-plus-round"></i>{" "}
          {article.author.following ? " Following " : " Follow "}{" "}
          {article.author.username}{" "}
          <span className="counter">{/* TODO:Add followers count */}</span>
        </button>{" "}
      </>
    )
  );
}
