import { test, expect } from '@fixtures/test-options';
import { makeUser } from '@data/user.factory';

test.describe('API: Authentication', () => {
  test('registers a new user and returns a token', async ({ api }) => {
    const creds = makeUser();

    const user = await api.register(creds);

    expect(user.username).toBe(creds.username);
    expect(user.email).toBe(creds.email);
    expect(user.token).toBeTruthy();
  });

  test('logs in with valid credentials', async ({ api }) => {
    const creds = makeUser();
    await api.register(creds);

    const user = await api.login(creds.email, creds.password);

    expect(user.token).toBeTruthy();
    expect(user.email).toBe(creds.email);
  });

  test('rejects login with a wrong password', async ({ api }) => {
    const creds = makeUser();
    await api.register(creds);

    const res = await api.loginRaw(creds.email, 'definitely-wrong');

    // RealWorld returns 401 or 403 for bad credentials depending on impl.
    expect(res.ok()).toBeFalsy();
    expect([401, 403, 422]).toContain(res.status());
  });

  test('returns the current user when given a valid token', async ({ api, registeredUser }) => {
    const me = await api.currentUser(registeredUser.token);

    expect(me.username).toBe(registeredUser.username);
  });
});
