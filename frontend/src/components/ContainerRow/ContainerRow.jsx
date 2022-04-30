function ContainerRow({ children, type }) {
  return (
    <div className={`container ${type || ""}`}>
      <div className="row">
        {children}
      </div>
    </div>
  );
}

export default ContainerRow;
