import { test, expect } from '@fixtures/test-options';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '@pages/login.page';
import { EditorPage } from '@pages/editor.page';
import { HomePage } from '@pages/home.page';
import { makeArticle } from '@data/user.factory';

test.describe('UI: Article flow', () => {
  // The user is created via the API (fast), then we log in through the browser.
  test('a logged-in user can publish an article', async ({ page, registeredUser }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(registeredUser.email, registeredUser.password);

    // After login the username should appear in the navbar.
    const home = new HomePage(page);
    await expect(home.userNav(registeredUser.username)).toBeVisible();

    const article = makeArticle();
    const editor = new EditorPage(page);
    await editor.open();
    await editor.publish(article);

    // The published article's title should render on the article page.
    await expect(page.getByRole('heading', { name: article.title })).toBeVisible();
  });

  test('home page has no critical accessibility violations', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await expect(home.banner).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Start by asserting on the most serious issues so the check is useful
    // without being blocked by minor cosmetic findings on a demo app.
    const serious = results.violations.filter((value) =>
      ['critical', 'serious'].includes(value.impact ?? ''),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
