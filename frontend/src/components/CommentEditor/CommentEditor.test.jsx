import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CommentEditor from "./CommentEditor";
import postComment from "../../services/postComment";

vi.mock("../../services/postComment", () => ({
  default: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ slug: "test-article" }),
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../context/AuthContext";

describe("CommentEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      headers: {},
      isAuth: true,
      loggedUser: { username: "testuser", image: "avatar.png" },
    });
  });

  test("renders login/signup links when user is not authenticated", () => {
    useAuth.mockReturnValue({
      headers: {},
      isAuth: false,
      loggedUser: { username: "", image: null },
    });

    render(
      <MemoryRouter>
        <CommentEditor updateComments={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  test("renders comment form when user is authenticated", () => {
    render(
      <MemoryRouter>
        <CommentEditor updateComments={vi.fn()} />
      </MemoryRouter>,
    );

    expect(
      screen.getByPlaceholderText("Write a comment..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Post Comment")).toBeInTheDocument();
  });

  test("submits comment when form is submitted", async () => {
    const updateComments = vi.fn();
    postComment.mockResolvedValue({});

    render(
      <MemoryRouter>
        <CommentEditor updateComments={updateComments} />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(textarea, { target: { value: "Great article!" } });

    fireEvent.click(screen.getByText("Post Comment"));

    await waitFor(() => {
      expect(postComment).toHaveBeenCalledWith(
        expect.objectContaining({ body: "Great article!" }),
      );
    });

    await waitFor(() => {
      expect(updateComments).toHaveBeenCalled();
    });
  });

  test("does not submit empty comment", () => {
    render(
      <MemoryRouter>
        <CommentEditor updateComments={vi.fn()} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Post Comment"));

    expect(postComment).not.toHaveBeenCalled();
  });
});
