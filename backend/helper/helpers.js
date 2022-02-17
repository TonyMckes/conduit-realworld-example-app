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
    const followersCount = await author.countFollowers();

    toAppend.author.dataValues.following = hasFollower;
    toAppend.author.dataValues.followersCount = followersCount;
    //
  } else if (loggedUser && !toAppend?.author) {
    //
    const hasFollower = await toAppend.hasFollower(loggedUser);
    const followersCount = await toAppend.countFollowers();

    toAppend.dataValues.following = hasFollower;
    toAppend.dataValues.followersCount = followersCount;
    //
  } else {
    //
    if (!toAppend?.author) {
      const followersCount = await toAppend.countFollowers();

      toAppend.dataValues.following = false;
      toAppend.dataValues.followersCount = followersCount;
      //
    } else {
      const followersCount = await toAppend.author.countFollowers();

      toAppend.author.dataValues.following = false;
      toAppend.author.dataValues.followersCount = followersCount;
    }
  }
}

module.exports = {
  slugify,
  appendTagList,
  appendFavorites,
  appendFollowers,
};
