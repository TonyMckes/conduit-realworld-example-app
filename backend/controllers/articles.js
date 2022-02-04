const {
  appendFollowers,
  appendFavorites,
  appendTagList,
  slugify,
} = require("../helper/helpers");
const { Article, Tag, User } = require("../models");

const includeOptions = [
  { model: Tag, as: "tagList", attributes: ["name"] },
  { model: User, as: "author", attributes: { exclude: ["email"] } },
];

//? All Articles - by Author/by Tag/Favorited by user
const allArticles = async (req, res) => {
  try {
    const { loggedUser } = req;

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
          attributes: { exclude: ["email"] },
          ...(author && { where: { username: author } }),
        },
      ],
    };

    let articles;
    if (favorited) {
      const user = await User.findOne({ where: { username: favorited } });

      articles = await user.getFavorites(searchOptions);
    } else {
      articles = await Article.findAll(searchOptions);
    }

    //* Tests failing because: https://github.com/gothinkster/realworld/issues/839
    for (let article of articles) {
      const articleTags = await article.getTagList();

      appendTagList(articleTags, article);
      await appendFollowers(loggedUser, article);
      await appendFavorites(loggedUser, article);

      delete article.dataValues.Favorites;
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Create Article
const createArticle = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const { title, description, body, tagList } = req.body.article;
    if (!title) throw new Error(`A title is required`);
    if (!description) throw new Error(`A description is required`);
    if (!body) throw new Error(`Article body is required`);

    const slug = slugify(title);

    const article = await Article.create({
      slug: slug,
      title: title,
      description: description,
      body: body,
    });

    for (const tag of tagList) {
      const checkTag = await Tag.findByPk(tag);

      if (!checkTag) {
        const tagList = await Tag.create({ name: tag });

        await article.addTagList(tagList);
      } else {
        await article.addTagList(checkTag);
      }
    }

    delete loggedUser.dataValues.token;

    article.dataValues.tagList = tagList;
    article.setAuthor(loggedUser);
    article.dataValues.author = loggedUser;
    await appendFollowers(loggedUser, loggedUser);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Feed
const articlesFeed = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const followers = await loggedUser.getFollowers();

    let articles = [];
    for (const author of followers) {
      //TODO:
      // appendTagList()
      // appendFollowers()
      // appendFavorites()
      articles.push(await author.getArticles());
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

// Single Article by slug
const singleArticle = async (req, res) => {
  try {
    const { loggedUser } = req;

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new Error("Article not found!");

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Update Article
const updateArticle = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new Error("Article not found!");

    if (loggedUser.id !== article.author.id) {
      throw new Error("You are not the author!");
    }

    const { title, description, body } = req.body.article;
    if (title) {
      article.slug = slugify(title);
      article.title = title;
    }
    if (description) article.description = description;
    if (body) article.body = body;
    await article.save();

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Delete Article
const deleteArticle = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new Error("Article not found!");

    if (loggedUser.id !== article.author.id) {
      throw new Error("You are not the author!");
    }

    await article.destroy();

    res.json({ message: { body: ["Article deleted successfully"] } });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

module.exports = {
  allArticles,
  createArticle,
  singleArticle,
  updateArticle,
  deleteArticle,
  articlesFeed,
};
