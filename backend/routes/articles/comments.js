const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/authentication");
const {} = require("../../controllers/comments");

//? All Comments for Article
router.get("/:slug/comments", verifyToken);
//* Create Comment for Article
router.post("/:slug/comments", verifyToken);
//* Delete Comment for Article
router.delete("/:slug/comments/:commentId", verifyToken);

module.exports = router;
