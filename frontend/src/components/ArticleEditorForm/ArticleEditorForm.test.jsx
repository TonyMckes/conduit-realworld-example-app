import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import ArticleEditor from "../../routes/ArticleEditor";
import deleteUnsavedEdit from "../../services/deleteUnsavedEdit";
import getArticle from "../../services/getArticle";
import getUnsavedEdits from "../../services/getUnsavedEdits";
import setArticle, { ArticleConflictError } from "../../services/setArticle";
import setUnsavedEditBase from "../../services/setUnsavedEditBase";

vi.mock("../../services/deleteUnsavedEdit");
vi.mock("../../services/getArticle");
vi.mock("../../services/getUnsavedEdits");
vi.mock("../../services/setUnsavedEditBase");
vi.mock("../../services/setArticle", async (importOriginal) => ({
  ...(await importOriginal()),
  default: vi.fn(),
}));

const auth = {
  headers: { Authorization: "Token token" },
  isAuth: true,
  loggedUser: { username: "author" },
};
vi.mock("../../context/AuthContext", () => ({ useAuth: () => auth }));

const savedArticle = {
  id: 7,
  slug: "my-article",
  title: "My article",
  description: "About it",
  body: "first\nsecond\nthird",
  tagList: ["one", "two"],
  version: 3,
  author: { username: "author" },
};

const unsavedEdit = {
  id: 11,
  title: "My article",
  description: "About it",
  body: "first\nsecond\nthird (other window)",
  tagList: ["one", "two", "three"],
  baseVersion: 2,
  base: {
    title: "My article",
    description: "About it",
    body: "first\nsecond\nthird",
    tagList: ["one", "two"],
  },
  createdAt: "2026-11-15T10:00:00.000Z",
};

function ArticlePage() {
  return <p>Article page: {useParams().slug}</p>;
}

function renderEditor(entry = "/editor/my-article") {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/" element={<p>Home page</p>} />
        <Route path="editor" element={<ArticleEditor />}>
          <Route path=":slug" element={<ArticleEditor />} />
        </Route>
        <Route path="article/:slug" element={<ArticlePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const bodyInput = () =>
  screen.getByPlaceholderText("Write your article (in markdown)");
const titleInput = () => screen.getByPlaceholderText("Article Title");
const tagsInput = () => screen.getByPlaceholderText("Enter tags");
const saveButton = () => screen.getByRole("button", { name: "Update Article" });
const editorLoaded = () => waitFor(() => expect(saveButton()).toBeEnabled());

beforeEach(() => {
  vi.resetAllMocks();
  getArticle.mockResolvedValue(savedArticle);
  getUnsavedEdits.mockResolvedValue([]);
  setUnsavedEditBase.mockResolvedValue({});
  deleteUnsavedEdit.mockResolvedValue({});
});

describe("Editing an article", () => {
  test("starts from the saved article, not from a copy held by another page", async () => {
    renderEditor({
      pathname: "/editor/my-article",
      state: { title: "Old", description: "old", body: "old", tagList: [] },
    });

    // The copy is shown, but can't be edited or saved, while loading
    expect(bodyInput()).toHaveValue("old");
    expect(saveButton()).toBeDisabled();

    await editorLoaded();
    expect(titleInput()).toHaveValue("My article");
    expect(bodyInput()).toHaveValue("first\nsecond\nthird");
    expect(tagsInput()).toHaveValue("one,two");
    expect(screen.queryByText(/Unsaved changes/)).not.toBeInTheDocument();
  });

  test("saves with the id and version the editor was loaded with", async () => {
    const user = userEvent.setup();
    setArticle.mockResolvedValue("my-article");
    renderEditor();
    await editorLoaded();

    await user.type(bodyInput(), "!");
    await user.type(tagsInput(), ", new");
    await user.click(saveButton());

    expect(await screen.findByText("Article page: my-article")).toBeVisible();
    expect(setArticle).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "my-article",
        id: 7,
        version: 3,
        body: "first\nsecond\nthird!",
        tagList: ["one", "two", "new"],
        resolvedUnsavedEdits: [],
      }),
    );
  });

  test("keeps the editor closed and reports it when the article can't be loaded", async () => {
    getArticle.mockRejectedValue("Article not found");
    renderEditor();

    expect(await screen.findByText("Article not found")).toBeVisible();
    expect(saveButton()).toBeDisabled();
  });

  test("redirects when the article belongs to someone else", async () => {
    getArticle.mockResolvedValue({ ...savedArticle, author: { username: "x" } });
    renderEditor();

    expect(await screen.findByText("Home page")).toBeVisible();
    expect(getUnsavedEdits).not.toHaveBeenCalled();
  });

  test("shows other errors without leaving the editor", async () => {
    const user = userEvent.setup();
    setArticle.mockRejectedValue("The article could not be saved.");
    renderEditor();
    await editorLoaded();

    await user.type(bodyInput(), " mine");
    await user.click(saveButton());

    expect(
      await screen.findByText("The article could not be saved."),
    ).toBeVisible();
    expect(bodyInput()).toHaveValue("first\nsecond\nthird mine");
    expect(saveButton()).toBeEnabled();
  });
});

describe("Saving an article that was updated from another editor", () => {
  const newerArticle = {
    ...savedArticle,
    body: "first (other window)\nsecond\nthird",
    version: 4,
  };
  const rejectedEdit = {
    id: 12,
    title: "My article",
    description: "About it",
    body: "first\nsecond\nthird mine",
    tagList: ["one", "two"],
    baseVersion: 3,
    base: null,
    createdAt: "2026-11-15T11:00:00.000Z",
  };

  const submitConflictingChange = async (user, article = newerArticle) => {
    setArticle.mockRejectedValueOnce(
      new ArticleConflictError("Not saved", {
        article,
        unsavedEdit: rejectedEdit,
      }),
    );
    renderEditor();
    await editorLoaded();
    await user.type(bodyInput(), " mine");

    // What the editor finds once it loads the article again
    getArticle.mockResolvedValue(article);
    getUnsavedEdits.mockResolvedValue([
      { ...rejectedEdit, base: { ...savedArticle } },
    ]);
    await user.click(saveButton());
  };

  test("tells the changes were not saved and keeps them available", async () => {
    const user = userEvent.setup();
    await submitConflictingChange(user);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Your changes were not saved.");
    expect(alert).toHaveTextContent("have not been lost");
    expect(screen.queryByText(/Article page/)).not.toBeInTheDocument();

    // The editor's starting point is recorded for merging later on
    expect(setUnsavedEditBase).toHaveBeenCalledWith(
      expect.objectContaining({
        editId: 12,
        slug: "my-article",
        base: {
          title: "My article",
          description: "About it",
          body: "first\nsecond\nthird",
          tagList: ["one", "two"],
        },
      }),
    );

    // The editor shows what is saved, the rejected changes are listed
    await editorLoaded();
    expect(bodyInput()).toHaveValue("first (other window)\nsecond\nthird");
    const unsaved = screen.getByRole("region", { name: "Unsaved changes" });
    expect(within(unsaved).getByText("Just now")).toBeVisible();
    expect(within(unsaved).getByText("+ third mine")).toBeInTheDocument();
  });

  test("merging the rejected changes and saving again settles them", async () => {
    const user = userEvent.setup();
    await submitConflictingChange(user);
    await editorLoaded();

    await user.click(screen.getByRole("button", { name: "Merge" }));
    expect(bodyInput()).toHaveValue("first (other window)\nsecond\nthird mine");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "were merged with the article in the editor",
    );

    setArticle.mockResolvedValue("my-article");
    await user.click(saveButton());

    expect(await screen.findByText("Article page: my-article")).toBeVisible();
    expect(setArticle).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: 7,
        version: 4,
        body: "first (other window)\nsecond\nthird mine",
        resolvedUnsavedEdits: [12],
      }),
    );
  });

  test("follows the article when its title was changed from the other editor", async () => {
    const user = userEvent.setup();
    await submitConflictingChange(user, {
      ...newerArticle,
      slug: "renamed-article",
      title: "Renamed article",
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your changes were not saved.",
    );
    await editorLoaded();
    expect(getArticle).toHaveBeenLastCalledWith(
      expect.objectContaining({ slug: "renamed-article" }),
    );
    expect(setUnsavedEditBase).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "renamed-article" }),
    );
    expect(titleInput()).toHaveValue("Renamed article");
  });
});

describe("Reopening an editor with unsaved changes", () => {
  beforeEach(() => {
    getUnsavedEdits.mockResolvedValue([unsavedEdit]);
  });

  test("lists them without changing the article", async () => {
    renderEditor();
    await editorLoaded();

    const unsaved = screen.getByRole("region", { name: "Unsaved changes" });
    expect(within(unsaved).getByText(/Not saved on/)).toBeVisible();
    expect(within(unsaved).getByText("- third")).toBeInTheDocument();
    expect(
      within(unsaved).getByText("+ third (other window)"),
    ).toBeInTheDocument();
    expect(within(unsaved).getByText("one, two, three")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(bodyInput()).toHaveValue("first\nsecond\nthird");
  });

  test("append adds them after the article body", async () => {
    const user = userEvent.setup();
    renderEditor();
    await editorLoaded();

    await user.click(screen.getByRole("button", { name: "Append" }));

    expect(bodyInput()).toHaveValue(
      "first\nsecond\nthird\n\nfirst\nsecond\nthird (other window)",
    );
    expect(tagsInput()).toHaveValue("one,two,three");
    expect(screen.getByText("Added to the editor")).toBeVisible();
  });

  test("merge keeps both versions of what was changed in both", async () => {
    const user = userEvent.setup();
    getArticle.mockResolvedValue({ ...savedArticle, body: "first\nsecond\n3rd" });
    renderEditor();
    await editorLoaded();

    await user.click(screen.getByRole("button", { name: "Merge" }));

    const merged = bodyInput().value;
    expect(merged).toContain("3rd");
    expect(merged).toContain("third (other window)");
    expect(merged).toMatch(/^<<<<<<< /m);
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 part of the body was changed in both versions",
    );

    // Saving with the markers still in asks first
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await user.click(saveButton());
    expect(confirm).toHaveBeenCalled();
    expect(setArticle).not.toHaveBeenCalled();
  });

  test("overwrite replaces the article, undo brings it back", async () => {
    const user = userEvent.setup();
    setArticle.mockResolvedValue("my-article");
    renderEditor();
    await editorLoaded();

    await user.click(screen.getByRole("button", { name: "Overwrite" }));
    expect(bodyInput()).toHaveValue("first\nsecond\nthird (other window)");
    expect(tagsInput()).toHaveValue("one,two,three");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(bodyInput()).toHaveValue("first\nsecond\nthird");
    expect(tagsInput()).toHaveValue("one,two");
    expect(screen.queryByText("Added to the editor")).not.toBeInTheDocument();

    // Unsaved changes that were not brought in are kept on save
    await user.click(saveButton());
    await screen.findByText("Article page: my-article");
    expect(setArticle).toHaveBeenCalledWith(
      expect.objectContaining({ resolvedUnsavedEdits: [] }),
    );
  });

  test("discard deletes them after confirmation only", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderEditor();
    await editorLoaded();

    await user.click(screen.getByRole("button", { name: /Discard/ }));
    expect(deleteUnsavedEdit).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: /Discard/ }));
    expect(deleteUnsavedEdit).toHaveBeenCalledWith(
      expect.objectContaining({ editId: 11, slug: "my-article" }),
    );
    await waitFor(() =>
      expect(screen.queryByText(/Unsaved changes/)).not.toBeInTheDocument(),
    );
  });
});

describe("Creating an article", () => {
  test("publishes without loading anything", async () => {
    const user = userEvent.setup();
    setArticle.mockResolvedValue("new-article");
    renderEditor("/editor");

    await user.type(titleInput(), "New article");
    await user.type(
      screen.getByPlaceholderText("What's this article about?"),
      "About",
    );
    await user.type(bodyInput(), "Body");
    await user.click(screen.getByRole("button", { name: "Publish Article" }));

    expect(await screen.findByText("Article page: new-article")).toBeVisible();
    expect(getArticle).not.toHaveBeenCalled();
    expect(getUnsavedEdits).not.toHaveBeenCalled();
    expect(setArticle).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: undefined,
        title: "New article",
        description: "About",
        body: "Body",
        id: undefined,
        version: undefined,
      }),
    );
  });
});
