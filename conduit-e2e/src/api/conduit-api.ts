import { APIRequestContext, APIResponse, expect } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://localhost:3001/api';

/** Shape of a user as returned by the RealWorld API. */
export interface User {
  email: string;
  username: string;
  token: string;
  bio: string | null;
  image: string | null;
}

export interface NewUser {
  username: string;
  email: string;
  password: string;
}

export interface ArticleAuthor {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: ArticleAuthor;
}

export interface NewArticle {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface Comment {
  id: number;
  body: string;
}

/**
 * Thin, typed wrapper over the Conduit REST API.
 *
 * Used both directly in API tests and as a fast setup helper for UI tests
 * (e.g. create a user via the API, then log in through the browser).
 *
 * Note the RealWorld spec uses the `Token <jwt>` auth scheme, NOT `Bearer`.
 */
export class ConduitApi {
  constructor(private readonly request: APIRequestContext) {}

  private authHeader(token: string): Record<string, string> {
    return { authorization: `Token ${token}` };
  }

  async register(user: NewUser): Promise<User> {
    const res = await this.request.post(`${API_URL}/users`, {
      data: { user },
    });
    expect(res.ok(), `register failed: ${res.status()} ${await res.text()}`).toBeTruthy();
    return (await res.json()).user as User;
  }

  async login(email: string, password: string): Promise<User> {
    const res = await this.request.post(`${API_URL}/users/login`, {
      data: { user: { email, password } },
    });
    expect(res.ok(), `login failed: ${res.status()} ${await res.text()}`).toBeTruthy();
    return (await res.json()).user as User;
  }

  /** Raw login without asserting success — for negative tests. */
  async loginRaw(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${API_URL}/users/login`, {
      data: { user: { email, password } },
    });
  }

  async currentUser(token: string): Promise<User> {
    const res = await this.request.get(`${API_URL}/user`, {
      headers: this.authHeader(token),
    });
    expect(res.ok()).toBeTruthy();
    return (await res.json()).user as User;
  }

  async createArticle(token: string, article: NewArticle): Promise<Article> {
    const res = await this.request.post(`${API_URL}/articles`, {
      headers: this.authHeader(token),
      data: { article },
    });
    expect(
      res.ok(),
      `createArticle failed: ${res.status()} ${await res.text()}`,
    ).toBeTruthy();
    return (await res.json()).article as Article;
  }

  async getArticle(slug: string): Promise<Article> {
    const res = await this.request.get(`${API_URL}/articles/${slug}`);
    expect(res.ok()).toBeTruthy();
    return (await res.json()).article as Article;
  }

  async deleteArticle(token: string, slug: string): Promise<void> {
    const res = await this.request.delete(`${API_URL}/articles/${slug}`, {
      headers: this.authHeader(token),
    });
    expect(res.ok()).toBeTruthy();
  }

  async listArticles(params: Record<string, string | number> = {}): Promise<{
    articles: Article[];
    articlesCount: number;
  }> {
    const query = new URLSearchParams(
      Object.entries(params).map(([k, value]) => [k, String(value)]),
    ).toString();
    const url = query ? `${API_URL}/articles?${query}` : `${API_URL}/articles`;
    const res = await this.request.get(url);
    expect(res.ok()).toBeTruthy();
    return res.json() as Promise<{ articles: Article[]; articlesCount: number }>;
  }

  async addComment(token: string, slug: string, body: string): Promise<Comment> {
    const res = await this.request.post(`${API_URL}/articles/${slug}/comments`, {
      headers: this.authHeader(token),
      data: { comment: { body } },
    });
    expect(
      res.ok(),
      `addComment failed: ${res.status()} ${await res.text()}`,
    ).toBeTruthy();
    return (await res.json()).comment as Comment;
  }

  async getComments(slug: string): Promise<Comment[]> {
    const res = await this.request.get(`${API_URL}/articles/${slug}/comments`);
    expect(res.ok()).toBeTruthy();
    return (await res.json()).comments as Comment[];
  }

  async deleteComment(token: string, slug: string, commentId: number): Promise<void> {
    const res = await this.request.delete(
      `${API_URL}/articles/${slug}/comments/${commentId}`,
      { headers: this.authHeader(token) },
    );
    expect(res.ok()).toBeTruthy();
  }
}
