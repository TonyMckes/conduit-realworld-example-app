import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CommentList from "./CommentList";
import getComments from "../../services/getComments";

vi.mock("../../services/getComments", () => ({
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

const mockComments = [
  {
    id: 1,
    body: "Great article!",
    createdAt: "2024-01-01T00:00:00.000Z",
    author: {
      username: "john",
      image: "https://example.com/avatar.png",
      bio: "A writer",
      following: false,
      followersCount: 10,
    },
  },
  {
    id: 2,
    body: "Thanks for sharing!",
    createdAt: "2024-01-02T00:00:00.000Z",
    author: {
      username: "jane",
      image: null,
      bio: null,
      following: true,
      followersCount: 5,
    },
  },
];

describe("CommentList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      headers: {},
      isAuth: false,
      loggedUser: { username: "" },
    });
    getComments.mockResolvedValue(mockComments);
  });

  test("renders list of comments", async () => {
    render(
      <MemoryRouter>
        <CommentList triggerUpdate={{}} updateComments={vi.fn()} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Great article!")).toBeInTheDocument();
    });
    expect(screen.getByText("Thanks for sharing!")).toBeInTheDocument();
    expect(screen.getByText("john")).toBeInTheDocument();
    expect(screen.getByText("jane")).toBeInTheDocument();
  });

  test("shows empty state when there are no comments", async () => {
    getComments.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CommentList triggerUpdate={{}} updateComments={vi.fn()} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("There are no comments yet..."),
      ).toBeInTheDocument();
    });
  });

  test("shows delete button for own comment when authenticated", async () => {
    useAuth.mockReturnValue({
      headers: {},
      isAuth: true,
      loggedUser: { username: "john" },
    });
    getComments.mockResolvedValue(mockComments);

    render(
      <MemoryRouter>
        <CommentList triggerUpdate={{}} updateComments={vi.fn()} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const deleteButtons = document.querySelectorAll(
        ".btn-outline-secondary",
      );
      expect(deleteButtons.length).toBe(1);
    });
  });

  test("does not show delete button for other users comments", async () => {
    useAuth.mockReturnValue({
      headers: {},
      isAuth: true,
      loggedUser: { username: "different-user" },
    });
    getComments.mockResolvedValue(mockComments);

    render(
      <MemoryRouter>
        <CommentList triggerUpdate={{}} updateComments={vi.fn()} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const deleteButtons = document.querySelectorAll(
        ".btn-outline-secondary",
      );
      expect(deleteButtons.length).toBe(0);
    });
  });
});
