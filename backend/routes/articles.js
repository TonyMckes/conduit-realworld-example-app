const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authentication");
const { slugify } = require("../helper/slugify");
const { Article } = require("../models");
const { User } = require("../models");
const { Tag } = require("../models");

router.get("/", async (req, res) => {
  try {
    const { author, tag /* TODO: favorited  */ } = req.query;

    const articleList = await Article.findAll({
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

    //* Tests failing because: https://github.com/gothinkster/realworld/issues/839
    const articles = [];
    for (let article of articleList) {
      // TODO: I need to refactor this;
      if (tag) {
        article = await Article.findOne({
          where: { id: article.id },
          include: [
            {
              model: Tag,
              as: "tagList",
              attributes: ["name"],
            },
            {
              model: User,
              as: "author",
              attributes: ["username", "bio", "image" /* "following" */],
            },
          ],
        });
      }

      const tagList = [];
      if (tag) {
        for (const tag of article.dataValues.tagList) {
          tagList.push(tag.name);
          article.dataValues.tagList = tagList;
        }
      } else {
        for (const tag of article.dataValues.tagList) {
          tagList.push(tag.name);
          article.dataValues.tagList = tagList;
        }
      }
      articles.push(article);
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const userData = req.user;
    const user = await User.findOne({
      attributes: ["id", "username", "bio", "image" /* "following" */],
      where: { email: userData.email },
    });
    if (!user) throw new Error("You need to login first!");

    const data = req.body.article;

    const slug = slugify(data.title);

    const article = await Article.create({
      slug: slug,
      title: data.title,
      description: data.description,
      body: data.body,
      userId: user.id,
    });

    for (const tag of data.tagList) {
      const checkTag = await Tag.findByPk(tag);

      if (!checkTag) {
        const tagList = await Tag.create({ name: tag });

        await article.addTagList(tagList);
      } else {
        await article.addTagList(checkTag);
      }
    }

    article.dataValues.tagList = data.tagList;

    article.dataValues.author = user;

    res.json({ article });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

module.exports = router;
