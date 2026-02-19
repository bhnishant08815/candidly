import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Login Page Object Model
 * Handles all login-related interactions with robust locators and error handling.
 */
export class LoginPage extends BasePage {
  // ============ Locators ============
  
  /**
   * Email input field
   */
  private get emailInput(): Locator {
    return this.page.locator('#email');
  }

  /**
   * Continue button
   */
  private get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue', exact: true });
  }

  /**
   * Password input field
   */
  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  /**
   * Sign In button
   */
  private get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  /**
   * Sign In heading
   */
  private get signInHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Sign In' });
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   * Waits for email input to be visible to confirm page is loaded
   */
  async navigateToLogin(): Promise<void> {
    await this.goto();
    
    // Wait for page to load
    await this.page.waitForLoadState('domcontentloaded');
    
    await expect(this.emailInput).toBeVisible({ timeout: 10000 });
  }

  /**
   * Enter email and continue
   * @param email Email address to enter
   */
  async enterEmail(email: string): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(email);
    await this.continueButton.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Enter password and sign in
   * @param password Password to enter
   */
  async enterPassword(password: string): Promise<void> {
    await expect(this.passwordInput).toBeVisible({ timeout: 10000 });
    await this.passwordInput.fill(password);
    await this.signInButton.click();
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
    await this.page.waitForURL((url) => /^\/(admin|dashboard)/i.test(new URL(url).pathname), { timeout: 15000 });
  }

  /**
   * Verify email input is visible
   */
  async verifyEmailInputVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify email input has correct placeholder
   */
  async verifyEmailInputPlaceholder(): Promise<void> {
    const isVisible = await this.emailInput.isVisible();
    if (isVisible) {
      await expect(this.emailInput).toHaveAttribute('placeholder', 'johndoe@business.com');
    }
  }

  /**
   * Verify password field is visible
   */
  async verifyPasswordFieldVisible(): Promise<void> {
    await expect(this.passwordInput).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify password field is NOT visible
   */
  async verifyPasswordFieldNotVisible(): Promise<void> {
    await expect(this.passwordInput).toBeHidden({ timeout: 5000 });
  }

  /**
   * Verify continue button is disabled
   */
  async verifyContinueButtonDisabled(): Promise<boolean> {
    const isVisible = await this.continueButton.isVisible();
    if (!isVisible) {
      return false;
    }
    return await this.continueButton.isDisabled();
  }

  /**
   * Verify sign in button is visible
   */
  async verifySignInButtonVisible(): Promise<void> {
    await expect(this.signInButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify we're on login page by checking URL and elements
   */
  async verifyOnLoginPage(): Promise<void> {
    const currentURL = this.page.url();
    expect(currentURL).toContain(this.baseURL);
    await this.verifyEmailInputVisible();
  }

  /**
   * Verify login was successful by checking URL path
   */
  async verifyLoginSuccessful(): Promise<void> {
    const currentURL = this.page.url();
    const urlPath = new URL(currentURL).pathname;
    expect(urlPath).not.toBe('/login');
    expect(urlPath).toMatch(/^\/(admin|dashboard)?/i);
  }

  /**
   * Verify logout was successful by checking URL path
   * Waits for URL to change from /admin or /dashboard to /login
   */
  async verifyLogoutSuccessful(): Promise<void> {
    // Use Playwright's waitForURL to wait for navigation to login page
    try {
      await this.page.waitForURL(
        (url) => {
          const pathname = new URL(url).pathname;
          // Wait for URL to be /login or / (not /admin or /dashboard)
          const isNotAdminDashboard = !pathname.match(/^\/(admin|dashboard)/i);
          const isLoginPage = !!pathname.match(/^\/(login)?$/i);
          return isNotAdminDashboard && isLoginPage;
        },
        { timeout: 15000 }
      );
    } catch (error) {
      // If waitForURL times out, check current state and provide clear error
      const currentURL = this.page.url();
      const urlPath = new URL(currentURL).pathname;
      
      if (urlPath.match(/^\/(admin|dashboard)/i)) {
        throw new Error(
          `Logout verification failed: Still on ${urlPath} after logout. ` +
          `The logout action may not have completed successfully.`
        );
      }
      // Re-throw original error if it's not a timeout
      throw error;
    }
    
    // Verify we're not on admin/dashboard (double-check)
    const currentURL = this.page.url();
    const urlPath = new URL(currentURL).pathname;
    expect(urlPath).not.toMatch(/^\/(admin|dashboard)/i);
    
    // Verify we're on login page (path should be /login or /)
    expect(urlPath).toMatch(/^\/(login)?$/i);
    
    // Verify email input is visible (confirms we're on login page)
    await this.verifyEmailInputVisible();
  }

  /**
   * Get email input value
   */
  async getEmailValue(): Promise<string> {
    const isVisible = await this.emailInput.isVisible();
    if (!isVisible) {
      throw new Error('Email input not found');
    }
    return await this.emailInput.inputValue();
  }

  /**
   * Verify page title contains expected text
   */
  async verifyPageTitle(expectedText: string): Promise<void> {
    const pageTitle = await this.page.title();
    expect(pageTitle).toContain(expectedText);
  }

  /**
   * Verify sign in heading is visible
   */
  async verifySignInHeadingVisible(): Promise<void> {
    await expect(this.signInHeading).toBeVisible();
  }
}
