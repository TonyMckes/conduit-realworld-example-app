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
import Profile from "./routes/Profile";
import Settings from "./routes/Settings";
import SignIn from "./routes/SignIn";
import SignUp from "./routes/SignUp";

ReactDOM.render(
  <HashRouter>
    <AuthContextProvider>
      <React.StrictMode>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<SignIn />} />
            <Route path="register" element={<SignUp />} />

            <Route path="settings" element={<Settings />} />

            <Route path="editor" element={<ArticleEditor />} />
            <Route path="editor/:slug" element={<ArticleEditor />} />

            <Route path="article" element={<Article />} />
            <Route path="article/:slug" element={<Article />} />

            <Route path="profile" element={<Profile />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="profile/:username/favorites" element={<Profile />} />
          </Route>
        </Routes>
      </React.StrictMode>
    </AuthContextProvider>
  </HashRouter>,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
