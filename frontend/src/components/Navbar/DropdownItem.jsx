import { Link } from "react-router-dom";

function DropdownItem({ handler, icon, text, url }) {
  return (
    <Link className="dropdown-item" onClick={handler} to={url || "#"}>
      {icon && <i className={icon}></i>} {text}
    </Link>
  );
}
export default DropdownItem;
