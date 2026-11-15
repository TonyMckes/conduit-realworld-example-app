// The article editor open in several windows at once: the real pages, each
// "window" rendered on its own, talking to the real API.
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import Article from "../frontend/src/routes/Article/Article";
import ArticleEditor from "../frontend/src/routes/ArticleEditor";
import { startTestServer } from "./support/server";

const auth = vi.hoisted(() => ({ isAuth: true }));
vi.mock("../frontend/src/context/AuthContext", () => ({ useAuth: () => auth }));

vi.setConfig({ testTimeout: 20000 });

let server;

beforeAll(async () => {
  // The API and the app log every error response
  vi.spyOn(console, "log").mockImplementation(() => {});

  server = await startTestServer();
  axios.defaults.adapter = "http";
  axios.defaults.baseURL = `${server.url}/`;

  const { headers, username } = await server.signUp();
  Object.assign(auth, { headers, loggedUser: { username } });
});

afterAll(() => server.close());

let confirm;

beforeEach(() => {
  confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
});

const api = (method, endpoint, body) =>
  server.request(method, endpoint, {
    body,
    token: auth.headers.Authorization.split(" ")[1],
  });

let articles = 0;
const newArticle = async () => {
  const { data } = await api("POST", "/articles", {
    article: {
      title: `Article ${++articles}`,
      description: "about",
      body: "para one\n\npara two\n\npara three",
      tagList: ["alpha", "beta"],
    },
  });

  return data.article;
};

const savedArticle = async (slug) =>
  (await api("GET", `/articles/${slug}`)).data.article;

const unsavedEdits = async (slug) =>
  (await api("GET", `/articles/${slug}/unsaved-edits`)).data.unsavedEdits;

function openWindow(path) {
  const { container, unmount } = render(
    <MemoryRouter initialEntries={[path]}>
      <Link to="/editor">New Article</Link>
      <Routes>
        <Route path="editor" element={<ArticleEditor />}>
          <Route path=":slug" element={<ArticleEditor />} />
        </Route>
        <Route path="article/:slug" element={<Article />} />
      </Routes>
    </MemoryRouter>,
  );
  const page = within(container);
  const field = (placeholder) => page.getByPlaceholderText(placeholder);
  const button = (name) => page.getByRole("button", { name });

  const win = {
    page,
    title: () => field("Article Title"),
    description: () => field("What's this article about?"),
    body: () => field("Write your article (in markdown)"),
    tags: () => field("Enter tags"),
    button,
    click: (name) => fireEvent.click(button(name)),
    type: (input, value) => fireEvent.change(input, { target: { value } }),
    // The editor can be used once it has loaded the saved article
    editorLoaded: () =>
      waitFor(() => expect(button("Update Article")).toBeEnabled()),
    // Saving takes the window to the article, which then loads it
    articleShown: () =>
      waitFor(() =>
        expect(container.querySelector(".article-page h1")).not.toBeEmptyDOMElement(),
      ),
    notSavedAlert: () => page.findByRole("alert"),
    unsavedChanges: () =>
      within(page.getByRole("region", { name: "Unsaved changes" })),
    close: unmount,
  };

  return win;
}

const openEditor = async (slug) => {
  const win = openWindow(`/editor/${slug}`);
  await win.editorLoaded();

  return win;
};

// Two windows edit the article, the first one saves and the second one's
// update is rejected. Returns the second win, back on the saved article.
const rejectedUpdate = async (article, { first, second }) => {
  const windowA = await openEditor(article.slug);
  const windowB = await openEditor(article.slug);

  first(windowA);
  windowA.click("Update Article");
  await windowA.articleShown();
  windowA.close();

  second(windowB);
  windowB.click("Update Article");
  await windowB.notSavedAlert();
  await windowB.editorLoaded();

  return windowB;
};

const changeBodies = {
  first: (win) =>
    win.type(win.body(), "para one (A)\n\npara two\n\npara three"),
  second: (win) =>
    win.type(win.body(), "para one\n\npara two\n\npara three (B)"),
};

describe("Saving from a win after another win saved the article", () => {
  test("is not saved, tells so, and overwrites nothing", async () => {
    const article = await newArticle();
    const windowA = await openEditor(article.slug);
    const windowB = await openEditor(article.slug);
    expect(windowB.body()).toHaveValue(windowA.body().value);
    expect(windowB.page.queryByText(/Unsaved changes/)).not.toBeInTheDocument();

    changeBodies.first(windowA);
    windowA.click("Update Article");
    await windowA.articleShown();
    expect(await windowA.page.findByText("para one (A)")).toBeVisible();

    changeBodies.second(windowB);
    windowB.click("Update Article");

    const alert = await windowB.notSavedAlert();
    expect(alert).toHaveTextContent("Your changes were not saved.");
    expect(alert).toHaveTextContent("have not been lost");

    // What the first win saved is still there
    expect(await savedArticle(article.slug)).toMatchObject({
      body: "para one (A)\n\npara two\n\npara three",
      version: article.version + 1,
    });
    // and so is everything the second win submitted
    expect(await unsavedEdits(article.slug)).toMatchObject([
      {
        title: article.title,
        description: "about",
        body: "para one\n\npara two\n\npara three (B)",
        tagList: ["alpha", "beta"],
        base: {
          title: article.title,
          description: "about",
          body: "para one\n\npara two\n\npara three",
          tagList: ["alpha", "beta"],
        },
      },
    ]);

    // The second window stays on the editor, now on the saved article
    await windowB.editorLoaded();
    expect(windowB.body()).toHaveValue("para one (A)\n\npara two\n\npara three");
    const unsaved = windowB.unsavedChanges();
    expect(unsaved.getByText("Unsaved changes (1)")).toBeVisible();
    expect(unsaved.getByText("Just now")).toBeVisible();
    expect(unsaved.getByText("- para one (A)")).toBeInTheDocument();
    expect(unsaved.getByText("+ para three (B)")).toBeInTheDocument();
  });

  test("is not saved when both windows save at the same time", async () => {
    const article = await newArticle();
    const windows = [
      await openEditor(article.slug),
      await openEditor(article.slug),
    ];
    windows[0].type(windows[0].body(), `${article.body}\n\nwindow 1`);
    windows[1].type(windows[1].body(), `win 2\n\n${article.body}`);

    windows.forEach((win) => win.click("Update Article"));
    await waitFor(() =>
      expect(
        windows.filter(({ page }) => page.queryByRole("alert")).length +
          windows.filter(({ page }) => !page.queryByPlaceholderText("Article Title")).length,
      ).toBe(2),
    );

    // One window saved, the other one was told it didn't
    const rejected = windows.filter(({ page }) => page.queryByRole("alert"));
    expect(rejected).toHaveLength(1);
    const [win] = rejected;
    await win.editorLoaded();
    expect(await unsavedEdits(article.slug)).toHaveLength(1);

    // Merging the rejected changes saves the changes of both windows
    win.click("Merge");
    win.click("Update Article");
    await win.articleShown();
    expect((await savedArticle(article.slug)).body).toBe(
      `win 2\n\n${article.body}\n\nwindow 1`,
    );
  });

  test("follows the article when the other win changed its title", async () => {
    const article = await newArticle();
    const win = await rejectedUpdate(article, {
      first: (windowA) => {
        windowA.type(windowA.title(), `${article.title} renamed`);
        windowA.type(windowA.body(), "para one\n\npara two (A)\n\npara three");
      },
      second: (windowB) =>
        windowB.type(
          windowB.body(),
          "para one\n\npara two (B)\n\npara three\n\npara four (B)",
        ),
    });

    const renamed = `${article.slug}-renamed`;
    expect(win.title()).toHaveValue(`${article.title} renamed`);
    expect(win.body()).toHaveValue("para one\n\npara two (A)\n\npara three");
    expect(await unsavedEdits(renamed)).toHaveLength(1);

    // The paragraph both changed is kept twice, to be settled by the author
    win.click("Merge");
    expect(win.body().value).toMatch(
      /^para one\n\n<<<<<<< .*\npara two \(A\)\n=======\npara two \(B\)\n>>>>>>> .*\n\npara three\n\npara four \(B\)$/,
    );
    expect(win.title()).toHaveValue(`${article.title} renamed`);
    expect(win.page.getByRole("status")).toHaveTextContent(
      "1 part of the body was changed in both versions",
    );

    // Saving it like that asks first
    confirm.mockReturnValue(false);
    win.click("Update Article");
    expect(confirm).toHaveBeenCalledWith(
      expect.stringContaining("merge markers"),
    );

    confirm.mockReturnValue(true);
    win.type(
      win.body(),
      "para one\n\npara two (A+B)\n\npara three\n\npara four (B)",
    );
    win.click("Update Article");
    await win.articleShown();
    expect(await savedArticle(renamed)).toMatchObject({
      title: `${article.title} renamed`,
      body: "para one\n\npara two (A+B)\n\npara three\n\npara four (B)",
    });
    expect(await unsavedEdits(renamed)).toEqual([]);
  });
});

describe("Reopening the editor of an article with unsaved changes", () => {
  // Reopened from the article page, like the author would
  const reopenEditor = async (article) => {
    const win = openWindow(`/article/${article.slug}`);
    await win.articleShown();
    fireEvent.click(
      (await win.page.findAllByRole("link", { name: /Edit Article/ }))[0],
    );
    await win.editorLoaded();

    return win;
  };

  const articleWithUnsavedChanges = async (changes = changeBodies) => {
    const article = await newArticle();
    (await rejectedUpdate(article, changes)).close();

    return article;
  };

  test("lists them, with the article as it was last saved", async () => {
    const article = await articleWithUnsavedChanges();
    const win = await reopenEditor(article);

    expect(win.body()).toHaveValue("para one (A)\n\npara two\n\npara three");
    expect(win.page.queryByRole("alert")).not.toBeInTheDocument();
    const unsaved = win.unsavedChanges();
    expect(unsaved.getByText("Unsaved changes (1)")).toBeVisible();
    expect(unsaved.getByText(/^Not saved on /)).toBeVisible();
    expect(unsaved.queryByText("Just now")).not.toBeInTheDocument();
    expect(unsaved.getByText("+ para three (B)")).toBeInTheDocument();
  });

  test("merge combines them with the saved article, and saving settles them", async () => {
    const article = await articleWithUnsavedChanges();
    const win = await reopenEditor(article);

    win.click("Merge");
    expect(win.body()).toHaveValue(
      "para one (A)\n\npara two\n\npara three (B)",
    );
    expect(win.page.getByRole("status")).toHaveTextContent(
      "were merged with the article in the editor",
    );
    expect(win.unsavedChanges().getByText("Added to the editor")).toBeVisible();

    win.click("Update Article");
    await win.articleShown();
    expect(await savedArticle(article.slug)).toMatchObject({
      body: "para one (A)\n\npara two\n\npara three (B)",
      tagList: expect.arrayContaining(["alpha", "beta"]),
      version: article.version + 2,
    });
    expect(await unsavedEdits(article.slug)).toEqual([]);
  });

  test("append adds them after the saved article", async () => {
    const article = await articleWithUnsavedChanges();
    const win = await reopenEditor(article);

    win.click("Append");
    expect(win.body()).toHaveValue(
      "para one (A)\n\npara two\n\npara three\n\npara one\n\npara two\n\npara three (B)",
    );

    win.click("Update Article");
    await win.articleShown();
    expect((await savedArticle(article.slug)).body).toBe(
      "para one (A)\n\npara two\n\npara three\n\npara one\n\npara two\n\npara three (B)",
    );
    expect(await unsavedEdits(article.slug)).toEqual([]);
  });

  test("overwrite replaces the saved article with them", async () => {
    const article = await articleWithUnsavedChanges();
    const win = await reopenEditor(article);

    win.click("Overwrite");
    expect(win.body()).toHaveValue("para one\n\npara two\n\npara three (B)");

    win.click("Update Article");
    await win.articleShown();
    expect((await savedArticle(article.slug)).body).toBe(
      "para one\n\npara two\n\npara three (B)",
    );
    expect(await unsavedEdits(article.slug)).toEqual([]);
  });

  test("undo takes them out of the editor again, and saving keeps them", async () => {
    const article = await articleWithUnsavedChanges();
    const win = await reopenEditor(article);

    win.click("Overwrite");
    win.click("Undo");
    expect(win.body()).toHaveValue("para one (A)\n\npara two\n\npara three");
    expect(win.page.queryByText("Added to the editor")).not.toBeInTheDocument();

    win.type(win.description(), "about (changed)");
    win.click("Update Article");
    await win.articleShown();
    expect(await savedArticle(article.slug)).toMatchObject({
      description: "about (changed)",
      body: "para one (A)\n\npara two\n\npara three",
    });
    expect(await unsavedEdits(article.slug)).toHaveLength(1);
  });

  test("discard deletes them, after confirmation only", async () => {
    const article = await articleWithUnsavedChanges();
    const win = await reopenEditor(article);

    confirm.mockReturnValue(false);
    win.click(/Discard/);
    expect(await unsavedEdits(article.slug)).toHaveLength(1);

    confirm.mockReturnValue(true);
    win.click(/Discard/);
    await waitFor(() =>
      expect(win.page.queryByText(/Unsaved changes/)).not.toBeInTheDocument(),
    );
    expect(await unsavedEdits(article.slug)).toEqual([]);
    expect(win.body()).toHaveValue("para one (A)\n\npara two\n\npara three");
  });

  test("starting a new article from there gives an empty editor", async () => {
    const article = await articleWithUnsavedChanges();
    const win = await reopenEditor(article);

    fireEvent.click(win.page.getByRole("link", { name: "New Article" }));

    expect(win.button("Publish Article")).toBeEnabled();
    expect(win.title()).toHaveValue("");
    expect(win.body()).toHaveValue("");
    expect(win.tags()).toHaveValue("");
    expect(win.page.queryByText(/Unsaved changes/)).not.toBeInTheDocument();
  });
});

describe("Tags of an article edited in several windows", () => {
  test("are saved with the article", async () => {
    const article = await newArticle();
    const win = await openEditor(article.slug);
    expect(win.tags()).toHaveValue("alpha,beta");

    win.type(win.tags(), "alpha, gamma");
    win.click("Update Article");
    await win.articleShown();

    expect((await savedArticle(article.slug)).tagList.sort()).toEqual([
      "alpha",
      "gamma",
    ]);
  });

  const changeTags = {
    // Replaces "beta" by "gamma"
    first: (win) => win.type(win.tags(), "alpha,gamma"),
    // Adds "delta", and changes the text
    second: (win) => {
      win.type(win.tags(), "alpha,beta,delta");
      win.type(win.body(), "para one\n\npara two\n\npara three (B)");
    },
  };

  test("are not overwritten, and are kept with the unsaved changes", async () => {
    const article = await newArticle();
    const win = await rejectedUpdate(article, changeTags);

    expect((await savedArticle(article.slug)).tagList.sort()).toEqual([
      "alpha",
      "gamma",
    ]);
    expect(await unsavedEdits(article.slug)).toMatchObject([
      {
        tagList: ["alpha", "beta", "delta"],
        base: { tagList: ["alpha", "beta"] },
      },
    ]);
    expect(win.tags()).toHaveValue("alpha,gamma");
    expect(win.unsavedChanges().getByText("alpha, beta, delta")).toBeInTheDocument();
  });

  test("merge keeps the tags added and removed in both windows", async () => {
    const article = await newArticle();
    const win = await rejectedUpdate(article, changeTags);

    win.click("Merge");
    expect(win.tags()).toHaveValue("alpha,gamma,delta");
    expect(win.body()).toHaveValue("para one\n\npara two\n\npara three (B)");

    win.click("Update Article");
    await win.articleShown();
    expect(await savedArticle(article.slug)).toMatchObject({
      body: "para one\n\npara two\n\npara three (B)",
      tagList: expect.arrayContaining(["alpha", "gamma", "delta"]),
    });
    expect((await savedArticle(article.slug)).tagList).toHaveLength(3);
    expect(await unsavedEdits(article.slug)).toEqual([]);
  });

  test("append adds the unsaved tags, overwrite replaces the tags by them", async () => {
    const article = await newArticle();
    const win = await rejectedUpdate(article, changeTags);

    win.click("Append");
    expect(win.tags()).toHaveValue("alpha,gamma,beta,delta");
    win.click("Undo");

    win.click("Overwrite");
    expect(win.tags()).toHaveValue("alpha,beta,delta");

    win.click("Update Article");
    await win.articleShown();
    expect((await savedArticle(article.slug)).tagList.sort()).toEqual([
      "alpha",
      "beta",
      "delta",
    ]);
  });

  test("changed alone are not overwritten either", async () => {
    const article = await newArticle();
    const win = await rejectedUpdate(article, {
      first: changeTags.first,
      second: (windowB) => windowB.type(windowB.tags(), "alpha,beta,delta"),
    });

    expect((await savedArticle(article.slug)).tagList.sort()).toEqual([
      "alpha",
      "gamma",
    ]);
    expect(win.body()).toHaveValue(article.body);
    expect(await unsavedEdits(article.slug)).toMatchObject([
      { tagList: ["alpha", "beta", "delta"] },
    ]);
  });
});
