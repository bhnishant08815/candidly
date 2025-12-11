import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Login Page Object Model
 * Handles all login-related interactions
 */
export class LoginPage extends BasePage {
  // Locators
  private readonly loginButton = () => this.page.locator("//button[normalize-space()='Login']");
  private readonly emailInput = () => this.page.locator("//input[@placeholder='johndoe@business.com']");
  private readonly continueButton = () => this.page.getByText('Continue', { exact: true });
  private readonly passwordInput = () => {
    // Try multiple locator strategies for password field
    // First try: getByRole with textbox
    const roleLocator = this.page.getByRole('textbox', { name: 'Password' });
    // Fallback: input with type password
    const inputLocator = this.page.locator('input[type="password"]');
    // Return the role locator as primary, but we'll handle fallback in enterPassword
    return roleLocator;
  };
  private readonly passwordInputFallback = () => this.page.locator('input[type="password"]');
  private readonly signInButton = () => this.page.locator("//span[normalize-space()='Sign In']");

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page and click login button
   */
  async navigateToLogin(): Promise<void> {
    await this.goto();
    await expect(this.loginButton()).toBeVisible();
    await this.loginButton().click();
    await this.wait(1000);
  }

  /**
   * Enter email and continue
   * @param email Email address to enter
   */
  async enterEmail(email: string): Promise<void> {
    await expect(this.emailInput()).toBeVisible();
    await this.emailInput().fill(email);
    await expect(this.continueButton()).toBeVisible();
    await this.continueButton().click();
    // Wait for navigation to password page
    await this.wait(2000);
  }

  /**
   * Enter password and sign in
   * @param password Password to enter
   */
  async enterPassword(password: string): Promise<void> {
    // Wait for password field to appear with increased timeout
    // Try primary locator first, then fallback if needed
    let passwordField = this.passwordInput();
    
    try {
      await expect(passwordField).toBeVisible({ timeout: 10000 });
    } catch (error) {
      // Primary locator failed, try fallback
      passwordField = this.passwordInputFallback();
      await expect(passwordField).toBeVisible({ timeout: 10000 });
    }
    
    await passwordField.fill(password);
    await expect(this.signInButton()).toBeVisible();
    await this.signInButton().click();
  }

  /**
   * Complete login flow
   * @param email Email address
   * @param password Password
   */
  async login(email: string, password: string): Promise<void> {
    await this.navigateToLogin();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.waitForNetworkIdle();
    await this.wait(2000);
  }
}

