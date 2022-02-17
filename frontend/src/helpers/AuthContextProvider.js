import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const token = localStorage.getItem("Token");

export function AuthContextProvider({ children }) {
  const [{ headerToken, loggedUser, isAuth }, setAuthState] = useState({
    headerToken: token ? { Authorization: `Token ${token}` } : null,
    isAuth: token ? true : false,
    loggedUser: {},
  });

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const res = await axios.get("api/user", { headers: headerToken });

          if (res.data.errors) return console.log(res.data.errors.body);

          setAuthState((authState) => ({
            ...authState,
            loggedUser: res.data.user,
          }));
        } catch (error) {
          console.log(error.response);
        }
      })();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ headerToken, isAuth, loggedUser, setAuthState }}
    >
      {children}
    </AuthContext.Provider>
  );
}
