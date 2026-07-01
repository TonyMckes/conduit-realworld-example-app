import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import type { NewArticle } from '@api/conduit-api';

export class EditorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get titleInput(): Locator {
    return this.page.getByPlaceholder('Article Title');
  }

  get descriptionInput(): Locator {
    return this.page.getByPlaceholder("What's this article about?");
  }

  get bodyInput(): Locator {
    return this.page.getByPlaceholder('Write your article (in markdown)');
  }

  get tagsInput(): Locator {
    return this.page.getByPlaceholder('Enter tags');
  }

  get publishButton(): Locator {
    return this.page.getByRole('button', { name: /Publish Article/i });
  }

  async open(): Promise<void> {
    await this.goto('/editor');
  }

  async publish(article: NewArticle): Promise<void> {
    await this.titleInput.fill(article.title);
    await this.descriptionInput.fill(article.description);
    await this.bodyInput.fill(article.body);
    for (const tag of article.tagList ?? []) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
    }
    await this.publishButton.click();
  }
}
