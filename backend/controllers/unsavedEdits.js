const {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} = require("../helper/customErrors");
const { Article, UnsavedEdit } = require("../models");

// Unsaved edits are only visible to, and managed by, the article's author
const findOwnArticle = async (req) => {
  const { loggedUser } = req;
  if (!loggedUser) throw new UnauthorizedError();

  const { slug } = req.params;
  const article = await Article.findOne({ where: { slug: slug } });
  if (!article) throw new NotFoundError("Article");

  if (loggedUser.id !== article.userId) {
    throw new ForbiddenError("article");
  }

  return article;
};

const findUnsavedEdit = async (req, article) => {
  const { editId } = req.params;
  const unsavedEdit = /^\d+$/.test(editId)
    ? await UnsavedEdit.findOne({
        where: { id: editId, articleId: article.id },
      })
    : null;
  if (!unsavedEdit) throw new NotFoundError("Unsaved edit");

  return unsavedEdit;
};

//? All Unsaved Edits for Article
const allUnsavedEdits = async (req, res, next) => {
  try {
    const article = await findOwnArticle(req);

    const unsavedEdits = await article.getUnsavedEdits({
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
    });

    res.json({ unsavedEdits });
  } catch (error) {
    next(error);
  }
};

//* Record what the article looked like in the editor the edit was made in
const setUnsavedEditBase = async (req, res, next) => {
  try {
    const article = await findOwnArticle(req);
    const unsavedEdit = await findUnsavedEdit(req, article);

    const { title, description, body, tagList } =
      req.body.unsavedEdit?.base || {};
    const asText = (value) => (typeof value === "string" ? value : null);
    const isTagList =
      Array.isArray(tagList) && tagList.every((tag) => typeof tag === "string");

    unsavedEdit.baseTitle = asText(title);
    unsavedEdit.baseDescription = asText(description);
    unsavedEdit.baseBody = asText(body);
    unsavedEdit.baseTagList = isTagList ? tagList : null;
    await unsavedEdit.save();

    res.json({ unsavedEdit });
  } catch (error) {
    next(error);
  }
};

//* Delete Unsaved Edit for Article
const deleteUnsavedEdit = async (req, res, next) => {
  try {
    const article = await findOwnArticle(req);
    const unsavedEdit = await findUnsavedEdit(req, article);

    await unsavedEdit.destroy();

    res.json({ message: { body: ["Unsaved edit deleted successfully"] } });
  } catch (error) {
    next(error);
  }
};

module.exports = { allUnsavedEdits, setUnsavedEditBase, deleteUnsavedEdit };
