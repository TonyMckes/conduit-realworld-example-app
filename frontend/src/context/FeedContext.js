import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const FeedContext = createContext();

export function useFeedContext() {
  return useContext(FeedContext);
}

function FeedProvider({ children }) {
  const { isAuth } = useAuth();
  const [{ tabName, tagName }, setTab] = useState({
    tabName: isAuth ? "feed" : "global",
    tagName: "",
  });

  useEffect(() => {
    setTab((tab) => ({ ...tab, tabName: isAuth ? "feed" : "global" }));
  }, [isAuth]);

  const changeTab = async (e, tabName) => {
    const tagName = e.target.innerText.trim();

    setTab({ tabName, tagName });
  };

  return (
    <FeedContext.Provider value={{ changeTab, tabName, tagName }}>
      {children}
    </FeedContext.Provider>
  );
}

export default FeedProvider;
