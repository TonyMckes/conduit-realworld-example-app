import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get banner(): Locator {
    return this.page.locator('.banner');
  }

  get articlePreviews(): Locator {
    return this.page.locator('.article-preview');
  }

  /** The current logged-in user's link in the navbar (their username). */
  userNav(username: string): Locator {
    return this.navbar.getByRole('link', { name: username });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }
}
