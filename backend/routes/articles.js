const express = require("express");
const router = express.Router();
const { Article } = require("../models");
const { User } = require("../models");

router.get("/", async (req, res) => {
  try {
    await Article.findAll();
    const articles = await Article.findAll({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username", "bio", "image" /* "following" */],
        },
      ],
    });

    res.json({ articles });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body.article;

    // TODO: slug from data.title

    const article = await Article.create({
      // slug: ,
      title: data.title,
      description: data.description,
      body: data.body,
    });

    res.json(article);
  } catch (error) {
    res.json({ errors: error.message });
  }
});

module.exports = router;
