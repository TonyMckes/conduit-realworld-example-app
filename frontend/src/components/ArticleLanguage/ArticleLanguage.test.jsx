import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import ArticleLanguage from "./ArticleLanguage";

describe("ArticleLanguage", () => {
  test("renders Chinese label and icon for zh language", () => {
    render(<ArticleLanguage language="zh" />);
    expect(screen.getByText("中文")).toBeInTheDocument();
  });

  test("renders English label and icon for en language", () => {
    render(<ArticleLanguage language="en" />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  test("returns null when language is not provided", () => {
    const { container } = render(<ArticleLanguage />);
    expect(container.firstChild).toBeNull();
  });

  test("returns null when language is empty", () => {
    const { container } = render(<ArticleLanguage language="" />);
    expect(container.firstChild).toBeNull();
  });

  test("renders language code for unknown languages", () => {
    render(<ArticleLanguage language="fr" />);
    expect(screen.getByText("fr")).toBeInTheDocument();
  });
});
