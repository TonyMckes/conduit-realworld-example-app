const { UnauthorizedError, NotFoundError } = require("../helper/customErrors");
const {
  appendFollowers,
  appendFavorites,
  appendTagList,
} = require("../helper/helpers");
const { Article, Tag, User } = require("../models");

//*  Favorite/Unfavorite Article
const favoriteToggler = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug } = req.params;

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
    if (!article) throw new NotFoundError("Article");

    if (req.method === "POST") await article.addUser(loggedUser);
    if (req.method === "DELETE") await article.removeUser(loggedUser);

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

module.exports = { favoriteToggler };
