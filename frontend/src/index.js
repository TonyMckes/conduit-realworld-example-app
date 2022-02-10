import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import { AuthContextProvider } from "./helpers/AuthContextProvider";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Article from "./routes/Article";
import ArticleEditor from "./routes/ArticleEditor";
import Home from "./routes/Home";
import Profile from "./routes/Profile/Profile";
import ProfileArticles from "./routes/Profile/ProfileArticles";
import ProfileFavArticles from "./routes/Profile/ProfileFavArticles";
import Settings from "./routes/Settings";
import SignIn from "./routes/SignIn";
import SignUp from "./routes/SignUp";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <AuthContextProvider>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<SignIn />} />
            <Route path="register" element={<SignUp />} />

            <Route path="settings" element={<Settings />} />

            <Route path="editor" element={<ArticleEditor />}>
              <Route path=":slug" element={<ArticleEditor />} />
            </Route>

            <Route path="article/:slug" element={<Article />} />

            <Route path="profile/:username" element={<Profile />}>
              <Route index element={<ProfileArticles />} />
              <Route path="favorites" element={<ProfileFavArticles />} />
            </Route>
          </Route>
        </Routes>
      </AuthContextProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
