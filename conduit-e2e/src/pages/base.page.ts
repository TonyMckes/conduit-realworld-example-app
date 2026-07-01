import { Page, Locator } from '@playwright/test';

/**
 * Base class for all page objects. Holds the Page and common navbar locators.
 *
 * Locators favour role/text-based selectors over CSS so they survive markup
 * changes. If a selector doesn't match your running instance, use
 * `npm run codegen` to inspect the actual DOM and adjust here in ONE place.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  get navbar(): Locator {
    return this.page.locator('nav.navbar');
  }

  get signInLink(): Locator {
    return this.navbar.getByRole('link', { name: 'Sign in' });
  }

  get signUpLink(): Locator {
    return this.navbar.getByRole('link', { name: 'Sign up' });
  }

  get newArticleLink(): Locator {
    return this.navbar.getByRole('link', { name: /New Article/i });
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
