const slugify = (string) => {
  return string.trim().toLowerCase().replace(/\W|_/g, "-");
};

const appendTagList = (articleTags, article) => {
  const tagList = [];
  for (const tag of articleTags) {
    tagList.push(tag.name);
  }
  if (!article) return tagList;
  article.dataValues.tagList = tagList;
};

const appendFavorites = async (loggedUser, article) => {
  if (loggedUser) {
    article.dataValues.favorited = await article.hasUser(loggedUser);
  } else {
    article.dataValues.favorited = false;
  }
  article.dataValues.favoritesCount = await article.countUsers();
};

async function appendFollowers(loggedUser, toAppend) {
  //
  if (loggedUser && toAppend?.author) {
    //
    const author = await toAppend.getAuthor();
    const hasFollower = await author.hasFollower(loggedUser);

    toAppend.author.dataValues.following = hasFollower;
    //
  } else if (loggedUser && !toAppend?.author) {
    //
    const hasFollower = await toAppend.hasFollower(loggedUser);

    toAppend.dataValues.following = hasFollower;
    //
  } else {
    //
    if (!toAppend?.author) toAppend.dataValues.following = false;
    else toAppend.author.dataValues.following = false;
  }
}

module.exports = {
  slugify,
  appendTagList,
  appendFavorites,
  appendFollowers,
};
