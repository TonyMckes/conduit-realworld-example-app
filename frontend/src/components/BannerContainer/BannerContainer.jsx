function BannerContainer({ children }) {
  return (
    <div className="banner">
      <div className="container">
        {children}
      </div>
    </div>
  );
}

export default BannerContainer;