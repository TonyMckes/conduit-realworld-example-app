import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toggleFav from "../../services/toggleFav";

function FavButton({ favorited, favoritesCount, handler, right, slug, text }) {
  const [loading, setLoading] = useState(false);
  const { headers, isAuth } = useAuth();

  const buttonPosition = right ? "pull-xs-right" : "";
  const buttonStyle = favorited ? "active" : "";
  const buttonText = text ? "Favorite" : !isAuth ? "" : "";

  const handleClick = () => {
    if (!isAuth) return alert("You need to login first");

    setLoading(true);

    toggleFav({ slug, favorited, headers })
      .then(handler)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <button
      className={`btn btn-sm btn-outline-primary ${buttonPosition} ${buttonStyle}`}
      disabled={loading}
      onClick={handleClick}
    >
      <i className="ion-heart"></i> {buttonText}
      <span className="counter"> ( {favoritesCount} )</span>
    </button>
  );
}

export default FavButton;
