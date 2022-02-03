/**
 *
 * @param {string} string
 * @returns
 */
const slugify = (string) => {
  return string.trim().toLowerCase().replace(/\W|_/g, "-");
};

/**
 *
 * @param {array} articleTags
 * @param {object} dataValues
 */
const printTagList = (articleTags, dataValues) => {
  const tagList = [];
  for (const tag of articleTags) {
    tagList.push(tag.name);
  }
  dataValues.tagList = tagList;
};

/**
 *
 * @param {object} loggedUser
 * @param {object} dataValues
 * @param {object} article
 */
const printFavorites = async (loggedUser, dataValues, article) => {
  if (loggedUser) {
    dataValues.favorited = await article.hasUser(loggedUser);
  } else {
    dataValues.favorited = false;
  }
  dataValues.favoritesCount = await article.countUsers();
};

module.exports = { slugify, printTagList, printFavorites };
