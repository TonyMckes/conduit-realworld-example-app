const { appendFollowers } = require("../helper/helpers");
const { Article, Comment, User } = require("../models");

//? All Comments for Article
const allComments = async (req, res) => {
  try {
    const { loggedUser } = req;
    const { slug } = req.params;

    const article = await Article.findOne({ where: { slug: slug } });
    if (!article) throw new Error("Article not found!");

    const comments = await article.getComments({
      include: [
        { model: User, as: "author", attributes: { exclude: ["email"] } },
      ],
    });

    for (const comment of comments) {
      await appendFollowers(loggedUser, comment);
    }

    res.json({ comments });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Create Comment for Article
const createComment = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const { body } = req.body.comment;
    if (!body) throw new Error(`Comment body is required`);

    const { slug } = req.params;
    const article = await Article.findOne({ where: { slug: slug } });
    if (!article) throw new Error("Article not found!");

    const comment = await Comment.create({
      body: body,
      articleId: article.id,
      userId: loggedUser.id,
    });

    delete loggedUser.dataValues.token;
    comment.dataValues.author = loggedUser;
    await appendFollowers(loggedUser, loggedUser);

    res.json({ comment });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Delete Comment for Article
const deleteComment = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const { slug, commentId } = req.params;

    const article = await Article.findOne({ where: { slug: slug } });
    if (!article) throw new Error("Article not found!");

    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new Error("Comment not found!");

    await comment.destroy();

    res.json({ message: { body: ["Comment deleted successfully"] } });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

module.exports = { allComments, createComment, deleteComment };
