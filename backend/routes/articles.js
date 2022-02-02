const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authentication");
const { slugify } = require("../helper/slugify");
const { Article } = require("../models");
const { User } = require("../models");
const { Tag } = require("../models");

// All Articles - by Author/by Tag/Favorited by user
router.get("/", async (req, res) => {
  try {
    const { author, tag, favorited } = req.query;
    let articles;
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
      const tagList = [];

      for (const {
        dataValues: { name: name },
      } of articleTags) {
        tagList.push(name);
      }

      article.dataValues.tagList = tagList;

      delete article.dataValues.Favorites;
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

// Create Article
router.post("/", verifyToken, async (req, res) => {
  try {
    const userData = req.user;
    const user = await User.findOne({
      attributes: { exclude: ["email"] },
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

    article.setAuthor(user);
    article.dataValues.author = user;

    res.json({ article });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

// Single Article by slug
router.get("/:slug", async (req, res) => {
  try {
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
      article.dataValues.tagList = tagList;
    }

    res.json({ article });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

// Update Article
router.put("/:slug", verifyToken, async (req, res) => {
  try {
    const slug = req.params.slug;
    const updatedBody = req.body.article.body;

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

    article.body = updatedBody;
    await article.save();

    const tagList = [];

    for (const tag of article.tagList) {
      tagList.push(tag.name);
      article.dataValues.tagList = tagList;
    }

    res.json({ article });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

//* Favorite Article
router.post("/:slug/favorite", verifyToken, async (req, res) => {
  try {
    // const slug = req.params.slug;
    // const article = await Article.findOne({
    //   where: { slug: slug },
    //   include: [
    //     {
    //       model: Tag,
    //       as: "tagList",
    //       attributes: ["name"],
    //     },
    //     {
    //       model: User,
    //       as: "author",
    //       attributes: ["username", "bio", "image" /* "following" */],
    //     },
    //   ],
    // });
    // if (!article) throw new Error("Article not found!");
    // const tagList = [];
    // for (const tag of article.tagList) {
    //   tagList.push(tag.name);
    //   article.dataValues.tagList = tagList;
    // }
    // res.json({ article });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

// Unfavorite Article
router.delete("/:slug/favorite", verifyToken, async (req, res) => {
  try {
    // const slug = req.params.slug;
    // const article = await Article.findOne({
    //   where: { slug: slug },
    //   include: [
    //     {
    //       model: Tag,
    //       as: "tagList",
    //       attributes: ["name"],
    //     },
    //     {
    //       model: User,
    //       as: "author",
    //       attributes: ["username", "bio", "image" /* "following" */],
    //     },
    //   ],
    // });
    // if (!article) throw new Error("Article not found!");
    // const tagList = [];
    // for (const tag of article.tagList) {
    //   tagList.push(tag.name);
    //   article.dataValues.tagList = tagList;
    // }
    // res.json({ article });
  } catch (error) {
    res.json({ errors: error.message });
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
