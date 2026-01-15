import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { SemanticLocator } from '../utils/element-helpers/semantic-locator';

/**
 * Login Page Object Model
 * Handles all login-related interactions with robust locators and error handling.
 * Uses SemanticLocator for auto-healing capabilities when UI changes.
 */
export class LoginPage extends BasePage {
  // ============ Semantic Locators with Auto-Healing ============
  
  /**
   * Email input field with semantic context for auto-healing
   */
  private get emailInputLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('textbox', { name: 'Email Address' }),
      {
        purpose: 'Email Address Input',
        elementType: 'input',
        ariaRole: 'textbox',
        textPatterns: ['email', 'Email Address'],
        labelPatterns: ['Email', 'Email Address', 'Work Email'],
        placeholderPatterns: ['johndoe@business.com', 'email', 'your email'],
        attributePatterns: { 'type': 'email' },
        formContext: 'login'
      },
      [this.page.locator("//input[@placeholder='johndoe@business.com']")]
    );
  }

  /**
   * Continue button with semantic context for auto-healing
   */
  private get continueButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('button', { name: 'Continue', exact: true }),
      {
        purpose: 'Continue Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Continue', 'Next', 'Proceed'],
        labelPatterns: ['Continue'],
        formContext: 'login'
      },
      [this.page.getByText('Continue', { exact: true })]
    );
  }

  /**
   * Password input field with semantic context for auto-healing
   */
  private get passwordInputLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('textbox', { name: 'Password' }),
      {
        purpose: 'Password Input',
        elementType: 'input',
        ariaRole: 'textbox',
        textPatterns: ['password', 'Password'],
        labelPatterns: ['Password', 'Enter Password'],
        placeholderPatterns: ['password', 'enter password'],
        attributePatterns: { 'type': 'password' },
        formContext: 'login'
      },
      [this.page.locator('input[type="password"]')]
    );
  }

  /**
   * Sign In button with semantic context for auto-healing
   */
  private get signInButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('button', { name: 'Sign In' }),
      {
        purpose: 'Sign In Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Sign In', 'Login', 'Log In', 'Submit'],
        labelPatterns: ['Sign In', 'Login'],
        classPatterns: ['sign-in', 'login', 'submit'],
        formContext: 'login'
      },
      [this.page.locator("//button[contains(., 'Sign In')]")]
    );
  }

  /**
   * Sign In heading with semantic context for auto-healing
   */
  private get signInHeadingLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('heading', { name: 'Sign In' }),
      {
        purpose: 'Sign In Page Heading',
        elementType: 'heading',
        ariaRole: 'heading',
        textPatterns: ['Sign In', 'Login', 'Welcome'],
        formContext: 'login'
      }
    );
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
    
    // Wait for email input to be visible using semantic locator (auto-healing enabled)
    await this.emailInputLocator.expectVisible(10000);
    
    // Additional wait for page stability
    await this.wait(500);
  }

  /**
   * Enter email and continue
   * @param email Email address to enter
   */
  async enterEmail(email: string): Promise<void> {
    // Use semantic locator with auto-healing
    await this.emailInputLocator.expectVisible();
    await this.emailInputLocator.fill(email);
    
    // Wait a moment for email to be processed
    await this.wait(500);
    
    // Click continue button using semantic locator
    await this.continueButtonLocator.click();
    
    // Wait for navigation to password page
    await this.wait(2000);
  }

  /**
   * Enter password and sign in
   * @param password Password to enter
   */
  async enterPassword(password: string): Promise<void> {
    // Wait for password field using semantic locator with auto-healing
    await this.passwordInputLocator.expectVisible(10000);
    await this.passwordInputLocator.fill(password);
    
    // Wait a moment for password to be processed
    await this.wait(500);
    
    // Click sign in button using semantic locator
    await this.signInButtonLocator.click();
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
    
    // Wait for network to settle after login
    await this.waitForNetworkIdle();
    await this.wait(2000);
  }

  /**
   * Verify email input is visible
   */
  async verifyEmailInputVisible(): Promise<void> {
    await this.emailInputLocator.expectVisible(10000);
  }

  /**
   * Verify email input has correct placeholder
   */
  async verifyEmailInputPlaceholder(): Promise<void> {
    const isVisible = await this.emailInputLocator.isVisible();
    if (isVisible) {
      await this.emailInputLocator.expectAttribute('placeholder', 'johndoe@business.com');
    }
  }

  /**
   * Verify password field is visible
   */
  async verifyPasswordFieldVisible(): Promise<void> {
    await this.passwordInputLocator.expectVisible(10000);
  }

  /**
   * Verify password field is NOT visible
   */
  async verifyPasswordFieldNotVisible(): Promise<void> {
    await this.passwordInputLocator.expectHidden(5000);
  }

  /**
   * Verify continue button is disabled
   */
  async verifyContinueButtonDisabled(): Promise<boolean> {
    const isVisible = await this.continueButtonLocator.isVisible();
    if (!isVisible) {
      return false;
    }
    return await this.continueButtonLocator.isDisabled();
  }

  /**
   * Verify sign in button is visible
   */
  async verifySignInButtonVisible(): Promise<void> {
    await this.signInButtonLocator.expectVisible(5000);
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
    const isVisible = await this.emailInputLocator.isVisible();
    if (!isVisible) {
      throw new Error('Email input not found');
    }
    return await this.emailInputLocator.getValue();
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
    await this.signInHeadingLocator.expectVisible();
  }
}
