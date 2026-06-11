import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, useParams } from "react-router-dom";
import Article from "./Article";
import getArticle from "../../services/getArticle";

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
  has_en_version: true,
  relatedArticleId: 2,
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
  has_en_version: false,
};

const renderArticle = (state) => {
  useParams.mockReturnValue({ slug: "test-article" });
  return render(
    <MemoryRouter initialEntries={[{ state }]}>
      <Article />
    </MemoryRouter>,
  );
};

describe("Article - Language Toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows English button when article has English version", async () => {
    renderArticle(mockArticleZh);

    await waitFor(() => {
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });

  test("does not show language toggle when article has no English version", async () => {
    const articleNoEn = { ...mockArticleZh, has_en_version: false };
    renderArticle(articleNoEn);

    await waitFor(() => {
      expect(screen.queryByText("English")).not.toBeInTheDocument();
    });
  });

  test("toggles to Chinese button after clicking English", async () => {
    getArticle.mockResolvedValue(mockArticleEn);
    renderArticle(mockArticleZh);

    await waitFor(() => {
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("English"));

    await waitFor(() => {
      expect(screen.getByText("中文")).toBeInTheDocument();
    });
  });

  test("calls getArticle with lang=en when toggling", async () => {
    getArticle.mockResolvedValue(mockArticleEn);
    renderArticle(mockArticleZh);

    await waitFor(() => {
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("English"));

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
