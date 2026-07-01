import { test, expect } from '@fixtures/test-options';

import { makeArticle } from '@data/user.factory';

test.describe('API: Comments', () => {
  test('user can read all comments', async ({ api, registeredUser }) => {
    const article = await api.createArticle(registeredUser.token, makeArticle());
    await api.addComment(registeredUser.token, article.slug, 'Hello world');
    const comments = await api.getComments(article.slug);
    expect (comments.length).toBeGreaterThan(0)
    expect (comments[0].body).toBe('Hello world')
  });
});
