import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthContextProvider({ children }) {
  const [authState, setAuthState] = useState({ status: false, loggedUser: {} });

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      axios
        .get("api/user", { headers: { Authorization: `Token ${token}` } })
        .then((res) => {
          if (res.data.error) return alert(res.data.error.body);

          setAuthState({ status: true, loggedUser: res.data.user });
        })
        .catch((arg) => console.log("Error", arg));
    }
  }, []);

  useEffect(() => {
    console.log("After reload?", authState);
  }, [authState]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}
