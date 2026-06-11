import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, useParams } from "react-router-dom";
import Article from "./Article";
import getArticle from "../../services/getArticle";
import { I18nProvider } from "../../context/I18nContext";

vi.mock("../../services/getArticle", () => ({
  default: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    headers: {},
    isAuth: false,
    loggedUser: { username: "" },
  }),
}));

const mockArticleZh = {
  title: "中文标题",
  body: "中文内容",
  slug: "test-article",
  description: "中文描述",
  tagList: [],
  createdAt: "2024-01-01",
  author: { username: "author", image: "", following: false },
  language: "zh",
  availableLanguages: ["zh", "en"],
  title_en: "English Title",
  content_en: "English content",
  summary_en: "English description",
};

const mockArticleEn = {
  title: "English Title",
  body: "English content",
  slug: "test-article",
  description: "English description",
  tagList: [],
  createdAt: "2024-01-01",
  author: { username: "author", image: "", following: false },
  language: "en",
  availableLanguages: ["zh", "en"],
  title_en: "English Title",
  content_en: "English content",
  summary_en: "English description",
};

const renderArticle = (state) => {
  useParams.mockReturnValue({ slug: "test-article" });
  return render(
    <MemoryRouter initialEntries={[{ state }]}>
      <I18nProvider>
        <Article />
      </I18nProvider>
    </MemoryRouter>,
  );
};

describe("Article - Language Toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("shows English version button when article has English version", async () => {
    renderArticle(mockArticleZh);

    await waitFor(() => {
      expect(screen.getByText("英文版")).toBeInTheDocument();
    });
  });

  test("does not show language toggle when article has no English version", async () => {
    const articleNoEn = { ...mockArticleZh, availableLanguages: ["zh"] };
    renderArticle(articleNoEn);

    await waitFor(() => {
      expect(screen.queryByText("英文版")).not.toBeInTheDocument();
    });
  });

  test("toggles to Chinese button after clicking English version", async () => {
    getArticle.mockResolvedValue(mockArticleEn);
    renderArticle(mockArticleZh);

    const englishBtn = await screen.findByText("英文版");
    fireEvent.click(englishBtn);

    expect(await screen.findByText("中文")).toBeInTheDocument();
  });

  test("calls getArticle with lang=en when toggling", async () => {
    getArticle.mockResolvedValue(mockArticleEn);
    renderArticle(mockArticleZh);

    const englishBtn = await screen.findByText("英文版");
    fireEvent.click(englishBtn);

    await waitFor(() => {
      expect(getArticle).toHaveBeenCalledWith(
        expect.objectContaining({ lang: "en" }),
      );
    });
  });
});

describe("Article - Language Display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("renders language info at bottom of article page", async () => {
    renderArticle(mockArticleZh);

    await waitFor(() => {
      expect(screen.getByText("中文")).toBeInTheDocument();
    });
  });

  test("renders English language info for English articles", async () => {
    renderArticle(mockArticleEn);

    await waitFor(() => {
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });
});

describe("Article - Cover Image", () => {
  test("renders cover image when article has coverImage", async () => {
    const articleWithCover = {
      ...mockArticleZh,
      coverImage: "https://example.com/cover.jpg",
    };
    renderArticle(articleWithCover);

    await waitFor(() => {
      const img = screen.getByAltText("Cover");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });

  test("renders default placeholder when article has no coverImage", async () => {
    const articleNoCover = { ...mockArticleZh, coverImage: null };
    renderArticle(articleNoCover);

    await waitFor(() => {
      const placeholder = document.querySelector(".cover-image-placeholder");
      expect(placeholder).toBeInTheDocument();
    });
  });

  test("renders default placeholder when coverImage is empty string", async () => {
    const articleEmptyCover = { ...mockArticleZh, coverImage: "" };
    renderArticle(articleEmptyCover);

    await waitFor(() => {
      const placeholder = document.querySelector(".cover-image-placeholder");
      expect(placeholder).toBeInTheDocument();
    });
  });
});
