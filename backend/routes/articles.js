const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authentication");
const { slugify } = require("../helper/slugify");
const { Article } = require("../models");
const { User } = require("../models");
const { Tag } = require("../models");

// All Articles - by Author/by Tag/Favorited by user
router.get("/", verifyToken, async (req, res) => {
  try {
    let articles;
    let loggedUser = req.user;

    if (loggedUser) {
      loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },
        where: { email: loggedUser.email },
      });
    }

    const { author, tag, favorited } = req.query;

    const searchOptions = {
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
    };

    if (favorited) {
      const user = await User.findOne({ where: { username: favorited } });

      articles = await user.getFavorites(searchOptions);
    } else {
      articles = await Article.findAll(searchOptions);
    }

    //* Tests failing because: https://github.com/gothinkster/realworld/issues/839
    for (let article of articles) {
      const articleTags = await article.getTagList();
      const dataValues = article.dataValues;
      const tagList = [];
      for (const {
        dataValues: { name: name },
      } of articleTags) {
        tagList.push(name);
      }

      dataValues.tagList = tagList;
      if (loggedUser) {
        dataValues.favorited = await article.hasUser(loggedUser);
        delete dataValues.Favorites;
      } else {
        dataValues.favorited = null;
      }
      dataValues.favoritesCount = await article.countUsers();
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Create Article
router.post("/", verifyToken, async (req, res) => {
  try {
    let loggedUser = req.user;

    if (loggedUser) {
      loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },

        where: { email: loggedUser.email },
      });
    } else {
      throw new Error("You need to login first!");
    }

    const data = req.body.article;

    const slug = slugify(data.title);

    const article = await Article.create({
      slug: slug,
      title: data.title,
      description: data.description,
      body: data.body,
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

    article.setAuthor(loggedUser);

    const dataValues = article.dataValues;

    dataValues.tagList = data.tagList;
    dataValues.author = loggedUser;
    if (loggedUser) {
      dataValues.favorited = await article.hasUser(loggedUser);
    } else {
      dataValues.favorited = false;
    }
    dataValues.favoritesCount = await article.countUsers();

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Single Article by slug
router.get("/:slug", async (req, res) => {
  try {
    let loggedUser = req.user;

    if (loggedUser) {
      loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },
        where: { email: loggedUser.email },
      });
    }

    const slug = req.params.slug;

    const article = await Article.findOne({
      where: { slug: slug },
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
    if (!article) throw new Error("Article not found!");

    const tagList = [];
    for (const tag of article.tagList) {
      tagList.push(tag.name);
    }

    const dataValues = article.dataValues;

    dataValues.tagList = tagList;
    if (loggedUser) {
      dataValues.favorited = await article.hasUser(loggedUser);
    } else {
      dataValues.favorited = false;
    }
    dataValues.favoritesCount = await article.countUsers();

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Update Article
router.put("/:slug", verifyToken, async (req, res) => {
  try {
    const { title, description, body } = req.body.article;
    const slug = req.params.slug;

    const article = await Article.findOne({
      where: { slug: slug },
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
    if (!article) throw new Error("Article not found!");

    const author = await article.getAuthor();
    let loggedUser = req.user;

    if (loggedUser) {
      loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },

        where: { email: loggedUser.email },
      });

      // if (loggedUser !== author) throw new Error("You are not the author!");
    } else {
      throw new Error("You need to login first!");
    }

    if (title) {
      article.title = title;
      article.slug = slugify(title);
    }
    if (description) article.description = description;
    if (body) article.body = body;
    await article.save();

    const tagList = [];
    for (const tag of article.tagList) {
      tagList.push(tag.name);
    }

    const dataValues = article.dataValues;

    dataValues.tagList = tagList;
    if (loggedUser) {
      dataValues.favorited = await article.hasUser(loggedUser);
    } else {
      dataValues.favorited = false;
    }
    dataValues.favoritesCount = await article.countUsers();

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Favorite Article TODO: Avoid code repetition
router.post("/:slug/favorite", verifyToken, async (req, res) => {
  try {
    let loggedUser = req.user;

    if (loggedUser) {
      loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },
        where: { email: loggedUser.email },
      });
    } else {
      throw new Error("You need to login first!");
    }

    const slug = req.params.slug;
    const article = await Article.findOne({
      where: { slug: slug },
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
    if (!article) throw new Error("Article not found!");

    const tagList = [];
    for (const tag of article.tagList) {
      tagList.push(tag.name);
    }

    await article.addUser(loggedUser);

    const dataValues = article.dataValues;

    dataValues.tagList = tagList;
    if (loggedUser) {
      dataValues.favorited = await article.hasUser(loggedUser);
    } else {
      dataValues.favorited = false;
    }
    dataValues.favoritesCount = await article.countUsers();

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Unfavorite Article  TODO: Avoid code repetition
router.delete("/:slug/favorite", verifyToken, async (req, res) => {
  try {
    let loggedUser = req.user;

    if (loggedUser) {
      loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },
        where: { email: loggedUser.email },
      });
    } else {
      throw new Error("You need to login first!");
    }

    const slug = req.params.slug;
    const article = await Article.findOne({
      where: { slug: slug },
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
    if (!article) throw new Error("Article not found!");

    const tagList = [];
    for (const tag of article.tagList) {
      tagList.push(tag.name);
    }

    await article.removeUser(loggedUser);

    const dataValues = article.dataValues;

    dataValues.tagList = tagList;
    if (loggedUser) {
      dataValues.favorited = await article.hasUser(loggedUser);
    } else {
      dataValues.favorited = false;
    }
    dataValues.favoritesCount = await article.countUsers();

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Create Comment for Article
router.post("/:slug/comments", verifyToken);

// All Comments for Article
router.get("/:slug/comments");

// Delete Comment for Article
router.delete("/:slug/comments/:commentId", verifyToken);

// Delete Article
router.delete("/:slug", verifyToken);

module.exports = router;
