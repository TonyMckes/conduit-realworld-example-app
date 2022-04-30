import avatar from "../../assets/smiley-cyrus.jpeg";

function Avatar({ alt, className, src }) {
  return (
    <img
      alt={alt || "placeholder"}
      className={className || ""}
      src={src || avatar}
    />
  );
}

export default Avatar;
