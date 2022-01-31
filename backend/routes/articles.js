const express = require("express");
const router = express.Router();
const { slugify } = require("../helper/slugify");
const { Article } = require("../models");
const { User } = require("../models");
const { Tag } = require("../models");

router.get("/", async (req, res) => {
  try {
    const { author, tag /* TODO: favorited  */ } = req.query;

    const articles = await Article.findAll({
      include: [
        {
          model: Tag,
          as: "tagList",
          attributes: ["name"],
          ...(tag && { where: { name: tag } }),
        },
        {
          model: User,
          as: "author",
          attributes: ["username", "bio", "image" /* "following" */],
          ...(author && { where: { username: author } }),
        },
      ],
    });

    for (const article of articles) {
      const tagList = [];
      for (const tag of article.dataValues.tagList) {
        tagList.push(tag.name);
      }
      article.dataValues.tagList = tagList;
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body.article;

    const slug = slugify(data.title);

    const article = await Article.create({
      slug: slug,
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
