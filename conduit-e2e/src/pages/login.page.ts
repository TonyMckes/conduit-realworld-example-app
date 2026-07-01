import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get emailInput(): Locator {
    return this.page.getByPlaceholder('Email');
  }

  get passwordInput(): Locator {
    return this.page.getByPlaceholder('Password');
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /Sign in/i });
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
