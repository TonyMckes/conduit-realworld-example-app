const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authentication");
const {
  allArticles,
  createArticle,
  singleArticle,
  updateArticle,
  deleteArticle,
  articlesFeed,
} = require("../controllers/articles");

//? All Articles - by Author/by Tag/Favorited by user
router.get("/", verifyToken, allArticles);
//* Create Article
router.post("/", verifyToken, createArticle);
//* Feed
router.get("/feed", verifyToken, articlesFeed);
// Single Article by slug
router.get("/:slug", verifyToken, singleArticle);
//* Update Article
router.put("/:slug", verifyToken, updateArticle);
//* Delete Article
router.delete("/:slug", verifyToken, deleteArticle);

const favoritesRoutes = require("./articles/favorites");
const commentsRoutes = require("./articles/comments");

//> Favorites routes
router.use("/", favoritesRoutes);
//> Comments routes
router.use("/", commentsRoutes);

module.exports = router;
