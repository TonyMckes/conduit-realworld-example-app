for (const article of articles) {
  const tagList = [];
  for (const tag of article.dataValues.tagList) {
    tagList.push(tag.name);
  }
  article.dataValues.tagList = tagList;
}

articles.map((article) => {
  const tagList = [];
  article.dataValues.tagList.map((tag) => tagList.push(tag.dataValues.name));
  article.dataValues.tagList = tagList;
});

articles.map((article) => {
  const tagList = [];
  for (const tag of article.dataValues.tagList) {
    tagList.push(tag.name);
  }
  article.dataValues.tagList = tagList;
});
