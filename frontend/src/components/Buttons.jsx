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

export function FollowButton({ article }) {
  return (
    article.author && (
      <>
        <button className="btn btn-sm btn-outline-secondary">
          <i className="ion-plus-round"></i> Follow {article.author.username}{" "}
          <span className="counter">{/* TODO:Add followers count */}</span>
        </button>{" "}
      </>
    )
  );
}
