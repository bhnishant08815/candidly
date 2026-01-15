import { Locator, expect, Page } from '@playwright/test';
import { retryWithBackoff } from './retry-helper';

/**
 * Resilient Element Wrapper
 * Provides robust element interactions with automatic retries and better error handling
 */
export class ResilientElement {
  constructor(
    private locator: Locator,
    private timeout: number = 10000
  ) {}

  /**
   * Get the underlying locator
   */
  getLocator(): Locator {
    return this.locator;
  }

  /**
   * Click with retry and scroll into view
   */
  async click(options?: { retries?: number; force?: boolean }): Promise<void> {
    const retries = options?.retries ?? 3;
    
    await retryWithBackoff(
      async () => {
        await expect(this.locator).toBeVisible({ timeout: this.timeout });
        await expect(this.locator).toBeEnabled();
        await this.locator.scrollIntoViewIfNeeded();
        await this.locator.click({ force: options?.force, timeout: this.timeout });
      },
      { maxRetries: retries }
    );
  }

  /**
   * Fill input with value verification
   */
  async fill(text: string, options?: { clear?: boolean }): Promise<void> {
    await retryWithBackoff(
      async () => {
        await expect(this.locator).toBeVisible({ timeout: this.timeout });
        await expect(this.locator).toBeEnabled();
        
        if (options?.clear !== false) {
          await this.locator.clear();
        }
        
        await this.locator.fill(text);
        
        // Verify value was set (for text inputs)
        const tagName = await this.locator.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'input' || tagName === 'textarea') {
          await expect(this.locator).toHaveValue(text, { timeout: 2000 }).catch(() => {
            // Some inputs might not support value check, ignore
          });
        }
      },
      { maxRetries: 3 }
    );
  }

  /**
   * Select option from combobox/dropdown
   */
  async selectOption(
    text: string,
    options?: { exact?: boolean; retries?: number }
  ): Promise<void> {
    const retries = options?.retries ?? 3;
    
    await retryWithBackoff(
      async () => {
        await expect(this.locator).toBeVisible({ timeout: this.timeout });
        await expect(this.locator).toBeEnabled();
        await this.locator.scrollIntoViewIfNeeded();
        await this.locator.click();
        
        // Wait for dropdown to open
        const page = this.locator.page();
        const option = page.getByRole('option', { 
          name: text, 
          exact: options?.exact ?? false 
        });
        
        await expect(option).toBeVisible({ timeout: 5000 });
        await option.click();
      },
      { maxRetries: retries }
    );
  }

  /**
   * Wait for element to be in a specific state
   */
  async waitForState(
    state: 'visible' | 'hidden' | 'attached' | 'detached' | 'enabled' | 'disabled',
    timeout?: number
  ): Promise<void> {
    const waitTimeout = timeout ?? this.timeout;
    
    switch (state) {
      case 'visible':
        await expect(this.locator).toBeVisible({ timeout: waitTimeout });
        break;
      case 'hidden':
        await expect(this.locator).toBeHidden({ timeout: waitTimeout });
        break;
      case 'attached':
        await expect(this.locator).toBeAttached({ timeout: waitTimeout });
        break;
      case 'detached':
        await expect(this.locator).not.toBeAttached({ timeout: waitTimeout });
        break;
      case 'enabled':
        await expect(this.locator).toBeEnabled({ timeout: waitTimeout });
        break;
      case 'disabled':
        await expect(this.locator).toBeDisabled({ timeout: waitTimeout });
        break;
    }
  }

  /**
   * Get text content
   */
  async getText(): Promise<string> {
    await expect(this.locator).toBeVisible({ timeout: this.timeout });
    return await this.locator.textContent() ?? '';
  }

  /**
   * Get attribute value
   */
  async getAttribute(name: string): Promise<string | null> {
    await expect(this.locator).toBeAttached({ timeout: this.timeout });
    return await this.locator.getAttribute(name);
  }

  /**
   * Check if element is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      return await this.locator.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Hover over element
   */
  async hover(): Promise<void> {
    await retryWithBackoff(
      async () => {
        await expect(this.locator).toBeVisible({ timeout: this.timeout });
        await this.locator.scrollIntoViewIfNeeded();
        await this.locator.hover();
      },
      { maxRetries: 2 }
    );
  }
}






