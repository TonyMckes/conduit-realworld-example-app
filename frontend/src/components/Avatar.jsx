import avatar from "../assets/demo-avatar.png";

export default function Avatar({ alt, className, src }) {
  return (
    <img
      alt={alt ? alt : ""}
      className={className ? className : ""}
      src={src ? src : avatar}
    />
  );
}
