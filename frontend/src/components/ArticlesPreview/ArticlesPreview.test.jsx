import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ArticlesPreview from "./ArticlesPreview";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    headers: {},
    isAuth: false,
    loggedUser: { username: "" },
  }),
}));

const baseArticle = {
  slug: "test-article",
  title: "Test Article",
  description: "Test description",
  tagList: [],
  createdAt: "2024-01-01",
  author: { username: "author", image: "", following: false },
  favorited: false,
  favoritesCount: 0,
};

const renderPreview = (articles, loading = false) => {
  return render(
    <MemoryRouter>
      <ArticlesPreview
        articles={articles}
        loading={loading}
        updateArticles={vi.fn()}
      />
    </MemoryRouter>,
  );
};

describe("ArticlesPreview - Cover Image", () => {
  test("renders cover image when article has coverImage", () => {
    const articles = [
      { ...baseArticle, coverImage: "https://example.com/cover.jpg" },
    ];
    renderPreview(articles);

    const img = screen.getByAltText("Cover");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  test("renders placeholder when article has no coverImage", () => {
    const articles = [{ ...baseArticle, coverImage: null }];
    renderPreview(articles);

    const placeholder = document.querySelector(".cover-image-placeholder");
    expect(placeholder).toBeInTheDocument();
  });

  test("renders placeholder when coverImage is empty string", () => {
    const articles = [{ ...baseArticle, coverImage: "" }];
    renderPreview(articles);

    const placeholder = document.querySelector(".cover-image-placeholder");
    expect(placeholder).toBeInTheDocument();
  });

  test("handles onerror by showing placeholder", () => {
    const articles = [
      { ...baseArticle, coverImage: "https://example.com/broken.jpg" },
    ];
    renderPreview(articles);

    const img = screen.getByAltText("Cover");
    expect(img).toBeInTheDocument();

    fireEvent.error(img);

    const placeholder = document.querySelector(".cover-image-placeholder");
    expect(placeholder).toBeInTheDocument();
  });
});
