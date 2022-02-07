export default function ContainerRow({ children, className }) {
  return (
    <div className={`container ${className ? className : ""}`}>
      <div className="row">{children}</div>
    </div>
  );
}
