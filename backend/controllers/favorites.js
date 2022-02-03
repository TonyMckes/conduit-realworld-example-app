const { Article } = require("../models");
const { User } = require("../models");
const { Tag } = require("../models");

//*  Favorite/Unfavorite Article
const favoriteToggler = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const { slug } = req.params;
    console.log(req.params);
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

    if (req.method === "POST") await article.addUser(loggedUser);
    if (req.method === "DELETE") await article.removeUser(loggedUser);

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
    res.json({ errors: { body: [error.message] } });
  }
};

module.exports = { favoriteToggler };
