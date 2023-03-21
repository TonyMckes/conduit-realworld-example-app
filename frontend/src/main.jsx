import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/AuthContext";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Article from "./routes/Article/Article";
import CommentsSection from "./routes/Article/CommentsSection";
import ArticleEditor from "./routes/ArticleEditor";
import Home from "./routes/Home";
import HomeArticles from "./routes/HomeArticles";
import Login from "./routes/Login";
import NotFound from "./routes/NotFound";
import Profile from "./routes/Profile/Profile";
import ProfileArticles from "./routes/Profile/ProfileArticles";
import ProfileFavArticles from "./routes/Profile/ProfileFavArticles";
import Settings from "./routes/Settings";
import SignUp from "./routes/SignUp";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Home />}>
              <Route index element={<HomeArticles />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="register" element={<SignUp />} />

            <Route path="settings" element={<Settings />} />

            <Route path="editor" element={<ArticleEditor />}>
              <Route path=":slug" element={<ArticleEditor />} />
            </Route>

            <Route path="article/:slug" element={<Article />}>
              <Route index element={<CommentsSection />} />
            </Route>

            <Route path="profile/:username" element={<Profile />}>
              <Route index element={<ProfileArticles />} />
              <Route path="favorites" element={<ProfileFavArticles />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
  );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
