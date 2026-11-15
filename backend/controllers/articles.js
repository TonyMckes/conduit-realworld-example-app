const { OptimisticLockError } = require("sequelize");
const {
  AlreadyTakenError,
  FieldRequiredError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} = require("../helper/customErrors");
const {
  appendFollowers,
  appendFavorites,
  appendTagList,
  slugify,
} = require("../helper/helpers");
const { Article, Tag, UnsavedEdit, User, sequelize } = require("../models");

const includeOptions = [
  { model: Tag, as: "tagList", attributes: ["name"] },
  { model: User, as: "author", attributes: { exclude: ["email"] } },
];

const editableFields = ["title", "description", "body"];

// Trimmed tag names, without blanks and duplicates
const normalizeTagList = (tagList) => [
  ...new Set(tagList.map((tag) => tag.trim()).filter(Boolean)),
];

const sameTagList = (a, b) =>
  a?.length === b?.length && (a || []).every((tag) => b.includes(tag));

// Same rule as for a new article: any existing tag, and new tags for names
// longer than 2 characters
const findOrCreateTags = async (tagList, transaction) => {
  const tags = [];

  for (const name of tagList) {
    if (name.length > 2) {
      const [tag] = await Tag.findOrCreate({ where: { name }, transaction });
      tags.push(tag);
    } else {
      const tag = await Tag.findByPk(name, { transaction });
      if (tag) tags.push(tag);
    }
  }

  return tags;
};

// An update that is not saved is never dropped: what was submitted is kept
// as an unsaved edit the author can bring back when editing the article.
const keepUnsavedEdit = async (article, submitted, version) => {
  // Re-submitting the same form must not pile up identical copies
  const unsavedEdits = await article.getUnsavedEdits();

  return (
    unsavedEdits.find(
      (edit) =>
        editableFields.every((field) => edit[field] === submitted[field]) &&
        sameTagList(edit.tagList, submitted.tagList),
    ) ||
    (await UnsavedEdit.create({
      articleId: article.id,
      ...submitted,
      baseVersion: version ?? null,
    }))
  );
};

// The update can't be saved without overwriting changes made from another
// editor: keep what was submitted and report the conflict.
const rejectConflictingUpdate = async (req, res, article, submitted) => {
  const { loggedUser } = req;
  const { version } = req.body.article;

  const unsavedEdit = await keepUnsavedEdit(article, submitted, version);

  appendTagList(article.tagList, article);
  await appendFollowers(loggedUser, article);
  await appendFavorites(loggedUser, article);

  res.status(409).json({
    errors: {
      body: [
        "Your changes were not saved because the article was updated from another editor. They were not lost: you can restore them by editing the article again.",
      ],
    },
    conflict: { article, unsavedEdit },
  });
};

//? All Articles - by Author/by Tag/Favorited by user
const allArticles = async (req, res, next) => {
  try {
    const { loggedUser } = req;

    const { author, tag, favorited, limit = 3, offset = 0 } = req.query;
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
      limit: parseInt(limit),
      offset: offset * limit,
      order: [["createdAt", "DESC"]],
    };

    let articles = { rows: [], count: 0 };
    if (favorited) {
      const user = await User.findOne({ where: { username: favorited } });

      articles.rows = await user.getFavorites(searchOptions);
      articles.count = await user.countFavorites();
    } else {
      articles = await Article.findAndCountAll(searchOptions);
    }

    for (let article of articles.rows) {
      const articleTags = await article.getTagList();

      appendTagList(articleTags, article);
      await appendFollowers(loggedUser, article);
      await appendFavorites(loggedUser, article);

      delete article.dataValues.Favorites;
    }

    res.json({ articles: articles.rows, articlesCount: articles.count });
  } catch (error) {
    next(error);
  }
};

//* Create Article
const createArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { title, description, body, tagList } = req.body.article;
    if (!title) throw new FieldRequiredError("A title");
    if (!description) throw new FieldRequiredError("A description");
    if (!body) throw new FieldRequiredError("An article body");

    const slug = slugify(title);
    const slugInDB = await Article.findOne({ where: { slug: slug } });
    if (slugInDB) throw new AlreadyTakenError("Title");

    const article = await Article.create({
      slug: slug,
      title: title,
      description: description,
      body: body,
    });

    for (const tag of tagList) {
      const tagInDB = await Tag.findByPk(tag.trim());

      if (tagInDB) {
        await article.addTagList(tagInDB);
      } else if (tag.length > 2) {
        const newTag = await Tag.create({ name: tag.trim() });

        await article.addTagList(newTag);
      }
    }

    delete loggedUser.dataValues.token;

    article.dataValues.tagList = tagList;
    await article.setAuthor(loggedUser);
    article.dataValues.author = loggedUser;
    await appendFollowers(loggedUser, loggedUser);
    await appendFavorites(loggedUser, article);

    res.status(201).json({ article });
  } catch (error) {
    next(error);
  }
};

//* Feed
const articlesFeed = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { limit = 3, offset = 0 } = req.query;
    const authors = await loggedUser.getFollowing();

    const articles = await Article.findAndCountAll({
      include: includeOptions,
      limit: parseInt(limit),
      offset: offset * limit,
      order: [["createdAt", "DESC"]],
      where: { userId: authors.map((author) => author.id) },
    });

    for (const article of articles.rows) {
      const articleTags = await article.getTagList();

      appendTagList(articleTags, article);
      await appendFollowers(loggedUser, article);
      await appendFavorites(loggedUser, article);
    }

    res.json({ articles: articles.rows, articlesCount: articles.count });
  } catch (error) {
    next(error);
  }
};

// Single Article by slug
const singleArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new NotFoundError("Article");

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

//* Update Article
const updateArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug } = req.params;
    const {
      id,
      title,
      description,
      body,
      tagList,
      version,
      resolvedUnsavedEdits = [],
    } = req.body.article;
    if (id !== undefined && !Number.isInteger(id)) {
      throw new ValidationError("Article id must be an integer");
    }
    if (version !== undefined && !Number.isInteger(version)) {
      throw new ValidationError("Article version must be an integer");
    }
    if (
      tagList !== undefined &&
      !(Array.isArray(tagList) && tagList.every((tag) => typeof tag === "string"))
    ) {
      throw new ValidationError("Tag list must be a list of tag names");
    }
    if (
      !Array.isArray(resolvedUnsavedEdits) ||
      !resolvedUnsavedEdits.every(Number.isInteger)
    ) {
      throw new ValidationError("Resolved unsaved edits must be a list of ids");
    }

    // The slug changes with the title, so an editor that was opened before
    // the title was changed elsewhere can only find the article by its id.
    const article = await Article.findOne({
      where: id !== undefined ? { id: id } : { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new NotFoundError("Article");

    if (loggedUser.id !== article.author.id) {
      throw new ForbiddenError("article");
    }

    // Fields that are left out are not updated
    const submitted = {
      title: title || null,
      description: description || null,
      body: body || null,
      tagList: tagList === undefined ? null : normalizeTagList(tagList),
    };
    const hasNewTags =
      submitted.tagList !== null &&
      !sameTagList(
        submitted.tagList,
        article.tagList.map((tag) => tag.name),
      );
    const hasChanges =
      hasNewTags ||
      editableFields.some(
        (field) =>
          submitted[field] !== null && submitted[field] !== article[field],
      );

    // `version` is the version of the article the editor was loaded with.
    // Without it there is no telling whether the article was saved since
    // then, in which case this update would silently discard those changes.
    if (version === undefined) {
      const unsavedEdit = hasChanges
        ? await keepUnsavedEdit(article, submitted, version)
        : undefined;

      return res.status(422).json({
        errors: {
          body: [
            `An article version is required to update an article. Your changes were not saved${
              unsavedEdit
                ? ", but they were not lost: reload the page and edit the article again to restore them."
                : "."
            }`,
          ],
        },
        unsavedEdit,
      });
    }

    const isStale = version !== article.version;
    if (isStale && hasChanges) {
      return await rejectConflictingUpdate(req, res, article, submitted);
    }

    if (title) {
      article.slug = slugify(title);
      article.title = title;
    }
    if (description) article.description = description;
    if (body) article.body = body;
    // Tags are stored apart from the article, but changing them still makes
    // a new version of it
    if (hasNewTags) article.changed("updatedAt", true);

    try {
      await sequelize.transaction(async (transaction) => {
        await article.save({ transaction });

        if (hasNewTags) {
          const tags = await findOrCreateTags(submitted.tagList, transaction);
          await article.setTagList(tags, { transaction });
        }

        // Unsaved edits the author brought into this update are now settled
        if (resolvedUnsavedEdits.length > 0) {
          await UnsavedEdit.destroy({
            where: { id: resolvedUnsavedEdits, articleId: article.id },
            transaction,
          });
        }
      });
    } catch (error) {
      // The article was saved by another request between the read and the
      // write above
      if (!(error instanceof OptimisticLockError)) throw error;

      await article.reload({ include: includeOptions });
      return await rejectConflictingUpdate(req, res, article, submitted);
    }

    if (hasNewTags) await article.reload({ include: includeOptions });

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

//* Delete Article
const deleteArticle = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug } = req.params;
    const article = await Article.findOne({
      where: { slug: slug },
      include: includeOptions,
    });
    if (!article) throw new NotFoundError("Article");

    if (loggedUser.id !== article.author.id) {
      throw new ForbiddenError("article");
    }

    await article.destroy();

    res.json({ message: { body: ["Article deleted successfully"] } });
  } catch (error) {
    next(error);
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
