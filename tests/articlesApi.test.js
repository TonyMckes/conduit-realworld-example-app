// @vitest-environment node
import { startTestServer } from "./support/server";

let server;
let request;
let author;
let reader;

beforeAll(async () => {
  // The API logs every error it responds with
  vi.spyOn(console, "log").mockImplementation(() => {});

  server = await startTestServer();
  request = server.request;
  author = await server.signUp();
  reader = await server.signUp();
});

afterAll(() => server.close());

let articles = 0;
const newArticle = async (fields = {}) => {
  const { data } = await request("POST", "/articles", {
    token: author.token,
    body: {
      article: {
        title: `Article ${++articles}`,
        description: "about",
        body: "one\ntwo\nthree",
        tagList: ["first", "second"],
        ...fields,
      },
    },
  });

  return data.article;
};

const getArticle = async (slug) =>
  (await request("GET", `/articles/${slug}`, { token: author.token })).data
    .article;

const update = (article, changes, token = author.token) =>
  request("PUT", `/articles/${article.slug}`, {
    token,
    body: { article: changes },
  });

const unsavedEdits = async (slug, token = author.token) =>
  request("GET", `/articles/${slug}/unsaved-edits`, { token });

describe("Updating an article", () => {
  test("an article has a version, which a new article reports correctly", async () => {
    const created = await newArticle();
    const article = await getArticle(created.slug);

    expect(Number.isInteger(article.id)).toBe(true);
    expect(Number.isInteger(article.version)).toBe(true);
    expect(created.version).toBe(article.version);
  });

  test("saves an update made to the current version", async () => {
    const article = await newArticle();

    const { status, data } = await update(article, {
      title: article.title,
      description: "about (changed)",
      body: "one\ntwo\nthree (changed)",
      version: article.version,
    });

    expect(status).toBe(200);
    expect(data.article).toMatchObject({
      description: "about (changed)",
      body: "one\ntwo\nthree (changed)",
      version: article.version + 1,
      tagList: expect.arrayContaining(["first", "second"]),
      author: { username: author.username },
    });
    expect(await getArticle(article.slug)).toMatchObject({
      body: "one\ntwo\nthree (changed)",
      version: article.version + 1,
    });
  });

  test("rejects an update without a version, and keeps what was submitted", async () => {
    const article = await newArticle();

    const { status, data } = await update(article, { body: "no version" });

    expect(status).toBe(422);
    expect(data.errors.body[0]).toMatch(/version is required/);
    expect(data.errors.body[0]).toMatch(/not lost/);
    expect(await getArticle(article.slug)).toMatchObject({
      body: article.body,
      version: article.version,
    });
    expect((await unsavedEdits(article.slug)).data.unsavedEdits).toMatchObject([
      { id: data.unsavedEdit.id, body: "no version", baseVersion: null },
    ]);
  });

  test("rejects an update without a version that changes nothing, keeping nothing", async () => {
    const article = await newArticle();

    const { status } = await update(article, { body: article.body });

    expect(status).toBe(422);
    expect((await unsavedEdits(article.slug)).data.unsavedEdits).toEqual([]);
  });

  test("rejects an update made to an older version, and keeps what was submitted", async () => {
    const article = await newArticle();
    // Two editors loaded the article; the first one saves
    await update(article, { body: "first editor", version: article.version });

    const { status, data } = await update(article, {
      title: article.title,
      description: article.description,
      body: "second editor",
      tagList: ["first", "second"],
      version: article.version,
    });

    expect(status).toBe(409);
    expect(data.errors.body[0]).toMatch(/not saved/);
    expect(data.conflict.article).toMatchObject({
      slug: article.slug,
      body: "first editor",
      version: article.version + 1,
    });
    expect(data.conflict.unsavedEdit).toMatchObject({
      title: article.title,
      description: article.description,
      body: "second editor",
      tagList: ["first", "second"],
      baseVersion: article.version,
      base: null,
    });
    expect(await getArticle(article.slug)).toMatchObject({
      body: "first editor",
      version: article.version + 1,
    });
  });

  test("keeps one copy when the same rejected update is submitted again", async () => {
    const article = await newArticle();
    await update(article, { body: "first editor", version: article.version });
    const stale = { body: "second editor", version: article.version };

    const first = await update(article, stale);
    const second = await update(article, stale);

    expect(second.status).toBe(409);
    expect(second.data.conflict.unsavedEdit.id).toBe(
      first.data.conflict.unsavedEdit.id,
    );
    expect((await unsavedEdits(article.slug)).data.unsavedEdits).toHaveLength(1);
  });

  test("accepts an update made to an older version that changes nothing", async () => {
    const article = await newArticle();
    await update(article, { body: "first editor", version: article.version });

    const { status, data } = await update(article, {
      body: "first editor",
      version: article.version,
    });

    expect(status).toBe(200);
    expect(data.article.version).toBe(article.version + 1);
    expect((await unsavedEdits(article.slug)).data.unsavedEdits).toEqual([]);
  });

  test("saves exactly one of the updates submitted at the same time, and keeps the others", async () => {
    const article = await newArticle();

    const responses = await Promise.all(
      Array.from({ length: 10 }, (_, editor) =>
        update(article, { body: `editor ${editor}`, version: article.version }),
      ),
    );

    const saved = responses.filter(({ status }) => status === 200);
    const rejected = responses.filter(({ status }) => status === 409);
    expect(saved).toHaveLength(1);
    expect(rejected).toHaveLength(9);
    expect(await getArticle(article.slug)).toMatchObject({
      body: saved[0].data.article.body,
      version: article.version + 1,
    });

    // Every submission is either the saved article or an unsaved edit
    const kept = (await unsavedEdits(article.slug)).data.unsavedEdits;
    const bodies = [saved[0].data.article.body, ...kept.map(({ body }) => body)];
    expect(bodies.sort()).toEqual(
      Array.from({ length: 10 }, (_, editor) => `editor ${editor}`),
    );
  });

  test("finds the article by id when its title, and so its slug, was changed", async () => {
    const article = await newArticle();
    const renamed = await update(article, {
      id: article.id,
      title: `${article.title} renamed`,
      version: article.version,
    });
    expect(renamed.data.article.slug).not.toBe(article.slug);

    // An editor that still has the old slug
    const withId = await update(article, {
      id: article.id,
      body: "old slug",
      version: article.version,
    });
    expect(withId.status).toBe(409);
    expect(withId.data.conflict.article.slug).toBe(renamed.data.article.slug);

    const withoutId = await update(article, {
      body: "old slug",
      version: article.version,
    });
    expect(withoutId.status).toBe(404);
  });

  test.each([
    ["a version that is not an integer", { version: "1" }],
    ["an id that is not an integer", { id: "1", version: 1 }],
    ["tags that are not a list of names", { tagList: "first", version: 1 }],
    ["resolved unsaved edits that are not ids", { resolvedUnsavedEdits: "1", version: 1 }],
  ])("rejects %s", async (_, changes) => {
    const article = await newArticle();

    const { status } = await update(article, { body: "invalid", ...changes });

    expect(status).toBe(422);
    expect((await getArticle(article.slug)).body).toBe(article.body);
  });

  test("only lets the author update", async () => {
    const article = await newArticle();
    const changes = { body: "not mine", version: article.version };

    expect((await update(article, changes, reader.token)).status).toBe(403);
    expect((await update(article, changes, null)).status).toBe(401);
    expect((await update({ slug: "missing" }, changes)).status).toBe(404);
    expect((await getArticle(article.slug)).body).toBe(article.body);
    expect((await unsavedEdits(article.slug)).data.unsavedEdits).toEqual([]);
  });
});

describe("Updating the tags of an article", () => {
  test("replaces the tags and makes a new version", async () => {
    const article = await newArticle();

    const { status, data } = await update(article, {
      tagList: ["second", " third ", "third", ""],
      version: article.version,
    });

    expect(status).toBe(200);
    expect(data.article.tagList.sort()).toEqual(["second", "third"]);
    expect(data.article.version).toBe(article.version + 1);
    expect((await getArticle(article.slug)).tagList.sort()).toEqual([
      "second",
      "third",
    ]);
    expect((await request("GET", "/tags")).data.tags).toContain("third");
    expect(
      (await request("GET", "/articles?tag=third")).data.articles.map(
        ({ slug }) => slug,
      ),
    ).toEqual([article.slug]);
  });

  test("leaves the tags alone when they are left out or the same", async () => {
    const article = await newArticle();

    const leftOut = await update(article, {
      body: "changed",
      version: article.version,
    });
    expect(leftOut.data.article.tagList.sort()).toEqual(["first", "second"]);

    const same = await update(article, {
      tagList: ["second", "first "],
      version: leftOut.data.article.version,
    });
    expect(same.status).toBe(200);
    expect(same.data.article.version).toBe(leftOut.data.article.version);
  });

  test("can remove every tag", async () => {
    const article = await newArticle();

    const { data } = await update(article, {
      tagList: [],
      version: article.version,
    });

    expect(data.article.tagList).toEqual([]);
    expect((await getArticle(article.slug)).tagList).toEqual([]);
  });

  test("only makes new tags of names longer than 2 characters, as for a new article", async () => {
    const article = await newArticle();

    const { data } = await update(article, {
      tagList: ["first", "ab"],
      version: article.version,
    });

    expect(data.article.tagList).toEqual(["first"]);
  });

  test("rejects a change of tags made to an older version, and keeps it", async () => {
    const article = await newArticle();
    await update(article, { tagList: ["first"], version: article.version });

    const { status, data } = await update(article, {
      tagList: ["first", "second", "third"],
      version: article.version,
    });

    expect(status).toBe(409);
    expect(data.conflict.article.tagList).toEqual(["first"]);
    expect(data.conflict.unsavedEdit).toMatchObject({
      title: null,
      body: null,
      tagList: ["first", "second", "third"],
    });
    expect((await getArticle(article.slug)).tagList).toEqual(["first"]);
  });
});

describe("Unsaved edits of an article", () => {
  // An article with updates of two other editors that were rejected
  const articleWithUnsavedEdits = async () => {
    const article = await newArticle();
    const saved = await update(article, {
      body: "saved",
      version: article.version,
    });
    const first = await update(article, {
      body: "unsaved 1",
      version: article.version,
    });
    const second = await update(article, {
      body: "unsaved 2",
      version: article.version,
    });

    return {
      article: saved.data.article,
      ids: [first, second].map(({ data }) => data.conflict.unsavedEdit.id),
    };
  };

  test("are listed for the author only, newest first", async () => {
    const { article, ids } = await articleWithUnsavedEdits();

    const { status, data } = await unsavedEdits(article.slug);

    expect(status).toBe(200);
    expect(data.unsavedEdits.map(({ id }) => id)).toEqual([...ids].reverse());
    expect(data.unsavedEdits[0]).toMatchObject({
      body: "unsaved 2",
      createdAt: expect.any(String),
    });
    expect((await unsavedEdits(article.slug, reader.token)).status).toBe(403);
    expect((await unsavedEdits(article.slug, null)).status).toBe(401);
    expect((await unsavedEdits("missing")).status).toBe(404);
  });

  test("can record what the article was like in the editor they were made in", async () => {
    const { article, ids } = await articleWithUnsavedEdits();
    const base = {
      title: article.title,
      description: "about",
      body: "one\ntwo\nthree",
      tagList: ["first", "second"],
    };
    const endpoint = `/articles/${article.slug}/unsaved-edits/${ids[0]}`;
    const body = { unsavedEdit: { base } };

    expect(
      (await request("PUT", endpoint, { token: reader.token, body })).status,
    ).toBe(403);

    const { status, data } = await request("PUT", endpoint, {
      token: author.token,
      body,
    });
    expect(status).toBe(200);
    expect(data.unsavedEdit.base).toEqual(base);
    expect((await unsavedEdits(article.slug)).data.unsavedEdits[1].base).toEqual(
      base,
    );
  });

  test("can be discarded by the author", async () => {
    const { article, ids } = await articleWithUnsavedEdits();
    const discard = (id, token = author.token) =>
      request("DELETE", `/articles/${article.slug}/unsaved-edits/${id}`, {
        token,
      });

    expect((await discard(ids[0], reader.token)).status).toBe(403);
    expect((await discard("abc")).status).toBe(404);
    expect((await discard(99999)).status).toBe(404);
    expect((await discard(ids[0])).status).toBe(200);
    expect(
      (await unsavedEdits(article.slug)).data.unsavedEdits.map(({ id }) => id),
    ).toEqual([ids[1]]);
  });

  test("are removed by the update that brings them in, others are kept", async () => {
    const { article, ids } = await articleWithUnsavedEdits();

    const { status } = await update(article, {
      body: "saved\nunsaved 1",
      version: article.version,
      resolvedUnsavedEdits: [ids[0]],
    });

    expect(status).toBe(200);
    expect(
      (await unsavedEdits(article.slug)).data.unsavedEdits.map(({ id }) => id),
    ).toEqual([ids[1]]);
  });

  test("are kept when the update that brings them in is rejected", async () => {
    const { article, ids } = await articleWithUnsavedEdits();

    const { status, data } = await update(article, {
      body: "saved\nunsaved 1",
      version: article.version - 1,
      resolvedUnsavedEdits: ids,
    });

    expect(status).toBe(409);
    expect(
      (await unsavedEdits(article.slug)).data.unsavedEdits.map(({ id }) => id),
    ).toEqual([data.conflict.unsavedEdit.id, ...[...ids].reverse()]);
  });

  test("are deleted with the article", async () => {
    const { article, ids } = await articleWithUnsavedEdits();

    await request("DELETE", `/articles/${article.slug}`, { token: author.token });

    expect(await server.db.UnsavedEdit.count({ where: { id: ids } })).toBe(0);
  });
});

describe("Other article endpoints still work", () => {
  test("creating, listing, favoriting, commenting and the feed", async () => {
    const article = await newArticle({ tagList: ["listed"] });
    const slugs = ({ data }) => data.articles.map(({ slug }) => slug);

    const duplicate = await request("POST", "/articles", {
      token: author.token,
      body: { article: { title: article.title, description: "d", body: "b", tagList: [] } },
    });
    expect(duplicate.status).toBe(422);

    expect(slugs(await request("GET", "/articles?limit=1"))).toEqual([
      article.slug,
    ]);
    expect(
      slugs(await request("GET", `/articles?author=${author.username}&limit=100`)),
    ).toContain(article.slug);
    expect(slugs(await request("GET", "/articles?tag=listed"))).toEqual([
      article.slug,
    ]);

    const favorite = await request("POST", `/articles/${article.slug}/favorite`, {
      token: reader.token,
    });
    expect(favorite.data.article).toMatchObject({
      favorited: true,
      favoritesCount: 1,
    });
    expect(
      slugs(await request("GET", `/articles?favorited=${reader.username}`)),
    ).toEqual([article.slug]);

    const comment = await request("POST", `/articles/${article.slug}/comments`, {
      token: reader.token,
      body: { comment: { body: "nice" } },
    });
    expect(comment.status).toBe(201);

    await request("POST", `/profiles/${author.username}/follow`, {
      token: reader.token,
    });
    const feed = await request("GET", "/articles/feed?limit=1", {
      token: reader.token,
    });
    expect(slugs(feed)).toEqual([article.slug]);

    // None of this is a new version of the article
    expect((await getArticle(article.slug)).version).toBe(article.version);
  });
});
