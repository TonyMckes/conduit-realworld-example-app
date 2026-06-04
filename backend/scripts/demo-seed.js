const { Article, Tag, User, sequelize } = require("../models");
const { bcryptHash } = require("../helper/bcrypt");
const { slugify } = require("../helper/helpers");

const demoUser = {
  username: "mvpuser",
  email: "mvpuser@example.com",
  password: "12345678",
  bio: "Local MVP demo account",
  image: null,
};

const wordSeries = (count) =>
  Array.from({ length: count }, (_, index) => `word${index + 1}`).join(" ");

const demoArticles = [
  {
    title: "AI MVP Word Count 10",
    description: "10-word article for MVP word-count verification.",
    body: "one two three four five six seven eight nine ten",
    expected: "本文共 10 字，预计阅读 1 分钟",
  },
  {
    title: "AI MVP Word Count 300",
    description: "300-word article for MVP reading-time boundary verification.",
    body: wordSeries(300),
    expected: "本文共 300 字，预计阅读 1 分钟",
  },
  {
    title: "AI MVP Word Count 301",
    description: "301-word article for MVP reading-time rounding verification.",
    body: wordSeries(301),
    expected: "本文共 301 字，预计阅读 2 分钟",
  },
  {
    title: "AI MVP Word Count Different Body",
    description: "Different body for dynamic article.body verification.",
    body: "alpha beta gamma delta epsilon",
    expected: "本文共 5 字，预计阅读 1 分钟",
  },
];

async function upsertDemoUser() {
  const password = await bcryptHash(demoUser.password);

  let user = await User.findOne({ where: { email: demoUser.email } });
  if (!user) {
    user = await User.create({
      username: demoUser.username,
      email: demoUser.email,
      password,
      bio: demoUser.bio,
      image: demoUser.image,
    });
  }

  await user.update({
    username: demoUser.username,
    password,
    bio: demoUser.bio,
    image: demoUser.image,
  });

  return user;
}

async function upsertDemoTag() {
  let tag = await Tag.findByPk("ai-mvp-test");
  if (!tag) tag = await Tag.create({ name: "ai-mvp-test" });
  return tag;
}

function upsertArticle(user, tag) {
  return async (demoArticle) => {
    const slug = slugify(demoArticle.title);
    const values = {
      slug,
      title: demoArticle.title,
      description: demoArticle.description,
      body: demoArticle.body,
      userId: user.id,
    };

    let article = await Article.findOne({ where: { slug } });
    if (!article) article = await Article.create(values);

    await article.update(values);
    await article.setAuthor(user);
    await article.setTagList([tag]);

    return {
      title: demoArticle.title,
      slug,
      expected: demoArticle.expected,
    };
  };
}

async function main() {
  await sequelize.sync();
  const user = await upsertDemoUser();
  const tag = await upsertDemoTag();
  const articles = await Promise.all(demoArticles.map(upsertArticle(user, tag)));

  console.log("Demo data is ready.");
  console.log(`Login: ${demoUser.email} / ${demoUser.password}`);
  for (const article of articles) {
    console.log(`${article.slug} -> ${article.expected}`);
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed MVP demo data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
