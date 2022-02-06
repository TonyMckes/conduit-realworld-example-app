import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthContextProvider({ children }) {
  const [authState, setAuthState] = useState({ status: false, token: "" });

  useEffect(() => {
    const token = localStorage.getItem("Token");
    token
      ? setAuthState({ status: true, token: token })
      : setAuthState({ status: false, token: "" });
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}
