import { Page, Locator, expect } from '@playwright/test';
import { testConfig } from '../config/test-config';
import { ResilientElement } from '../utils/element-helpers/element-wrapper';

/**
 * Base Page Object Model class
 * Contains common functionality shared across all page objects
 */
export class BasePage {
  readonly page: Page;
  readonly baseURL: string = testConfig.baseURL;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the base URL with optimized loading strategy
   */
  async goto(): Promise<void> {
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.page.goto(this.baseURL, {
          waitUntil: 'domcontentloaded', // Faster than networkidle
          timeout: testConfig.timeouts.navigation,
        });
        // Verify navigation succeeded by checking URL
        const currentURL = this.page.url();
        if (currentURL.includes(this.baseURL.replace(/\/$/, '')) || currentURL === this.baseURL) {
          return; // Navigation successful
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff) - use condition-based wait
          // Wait for page to be in a stable state before retrying
          await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 * (attempt + 1) }).catch(() => {
            // If load state times out, just wait a minimal amount
          });
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError || new Error('Navigation failed after retries');
  }

  /**
   * Wait for a specified amount of time
   * @deprecated Use condition-based waits instead (e.g., waitForElement, expect.toBeVisible)
   * @param ms Milliseconds to wait
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Wait for an element to be visible and ready for interaction (condition-based).
   * Prefer this over wait(ms) to reduce test execution time.
   */
  async waitForElementReady(
    locator: Locator,
    timeout: number = testConfig.timeouts.default
  ): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
    await expect(locator).toBeEnabled({ timeout: Math.min(timeout, 5000) }).catch(() => {});
  }

  /**
   * Wait for network to be idle
   * @deprecated Use waitForAPIResponse or waitForElement instead for better performance
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: testConfig.timeouts.networkIdle });
  }

  /**
   * Wait for element with multiple strategies and retries
   * @param selector Element selector or locator
   * @param options Wait options
   * @returns The locator
   */
  async waitForElement(
    selector: string | Locator,
    options: {
      timeout?: number;
      state?: 'visible' | 'attached' | 'hidden' | 'enabled' | 'disabled';
      retries?: number;
    } = {}
  ): Promise<Locator> {
    const { timeout = testConfig.timeouts.default, state = 'visible', retries = 3 } = options;
    const locator = typeof selector === 'string' 
      ? this.page.locator(selector) 
      : selector;

    for (let i = 0; i < retries; i++) {
      try {
        switch (state) {
          case 'visible':
            await expect(locator).toBeVisible({ timeout });
            break;
          case 'attached':
            await expect(locator).toBeAttached({ timeout });
            break;
          case 'hidden':
            await expect(locator).toBeHidden({ timeout });
            break;
          case 'enabled':
            await expect(locator).toBeEnabled({ timeout });
            break;
          case 'disabled':
            await expect(locator).toBeDisabled({ timeout });
            break;
        }
        return locator;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return locator;
  }

  // Cache for API responses to avoid waiting for same API twice
  private static apiResponseCache = new Map<string, { timestamp: number; status: number }>();
  private static readonly CACHE_TTL = 5000; // 5 seconds

  /**
   * Wait for API response instead of network idle (more performant)
   * @param urlPattern URL pattern to match (string or RegExp)
   * @param timeout Timeout in milliseconds
   * @param statusCode Optional status code to wait for
   * @param useCache Whether to use cached response (default: false to avoid cross-test staleness)
   */
  async waitForAPIResponse(
    urlPattern: string | RegExp,
    timeout: number = testConfig.timeouts.networkIdle,
    statusCode?: number,
    useCache: boolean = false
  ): Promise<void> {
    const patternKey = typeof urlPattern === 'string' ? urlPattern : urlPattern.toString();
    const cacheKey = `${patternKey}_${statusCode ?? 'any'}`;
    
    // Check cache first
    if (useCache) {
      const cached = BasePage.apiResponseCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < BasePage.CACHE_TTL) {
        if (statusCode === undefined || cached.status === statusCode) {
          return; // Use cached response
        }
      }
    }
    
    const response = await this.page.waitForResponse(
      response => {
        const url = response.url();
        const matches = typeof urlPattern === 'string' 
          ? url.includes(urlPattern)
          : urlPattern.test(url);
        
        if (statusCode !== undefined) {
          return matches && response.status() === statusCode;
        }
        return matches;
      },
      { timeout }
    );
    
    // Cache the response
    if (useCache) {
      BasePage.apiResponseCache.set(cacheKey, {
        timestamp: Date.now(),
        status: response.status()
      });
    }
  }

  /**
   * Wait for multiple API responses (useful for complex flows)
   * @param urlPatterns Array of URL patterns to wait for
   * @param timeout Timeout in milliseconds
   * @param allRequired If true, waits for all patterns. If false, waits for any pattern.
   */
  async waitForMultipleAPIResponses(
    urlPatterns: (string | RegExp)[],
    timeout: number = testConfig.timeouts.networkIdle,
    allRequired: boolean = false
  ): Promise<void> {
    if (allRequired) {
      // Wait for all patterns
      await Promise.all(
        urlPatterns.map(pattern => this.waitForAPIResponse(pattern, timeout))
      );
    } else {
      // Wait for any pattern (race condition)
      await Promise.race(
        urlPatterns.map(pattern => this.waitForAPIResponse(pattern, timeout))
      );
    }
  }

  /**
   * Clear API response cache (useful after navigation or state changes)
   */
  static clearAPIResponseCache(): void {
    BasePage.apiResponseCache.clear();
  }

  /**
   * Click delete on a row and handle confirmation dialog if present.
   * @param rowLocator Locator for the table row containing the delete button
   * @param confirmText Optional text to type in confirmation input (e.g. title or identifier)
   */
  async deleteRowWithConfirmation(rowLocator: Locator, confirmText?: string): Promise<void> {
    const deleteButton = rowLocator.getByLabel('Delete').or(rowLocator.getByRole('button', { name: /delete/i }));
    const isDeleteVisible = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isDeleteVisible) {
      const altDelete = rowLocator.locator('button[aria-label*="delete" i], button[title*="delete" i]').first();
      if (await altDelete.isVisible({ timeout: 2000 }).catch(() => false)) {
        await altDelete.click();
      } else {
        throw new Error('Delete button not found in row');
      }
    } else {
      await deleteButton.click();
    }
    const confirmDialog = this.page.getByRole('dialog').filter({ hasText: /delete|confirm/i });
    const hasConfirmDialog = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasConfirmDialog) {
      const confirmInput = confirmDialog.getByRole('textbox').first();
      if (confirmText && (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false))) {
        const inputValue = await confirmInput.inputValue().catch(() => '');
        if (!inputValue) await confirmInput.fill(confirmText);
      }
      const confirmButton = confirmDialog.getByRole('button', { name: /delete|confirm|yes/i }).first();
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      } else {
        await this.page.keyboard.press('Enter');
      }
    }
    await expect(rowLocator).toBeHidden({ timeout: 10000 }).catch(() => {});
  }

  /**
   * Close a dialog/modal if it is open. Tries Cancel, then Close, then Escape.
   * @param dialogName Optional dialog name (role name, e.g. /Add New Applicant/i). If omitted, closes any visible dialog.
   * @param timeoutMs Timeout for checking visibility (default 2000)
   */
  async closeDialogIfOpen(dialogName?: string | RegExp, timeoutMs: number = 2000): Promise<void> {
    const dialog = dialogName
      ? this.page.getByRole('dialog', typeof dialogName === 'string' ? { name: dialogName } : { name: dialogName })
      : this.page.getByRole('dialog').first();
    const isOpen = await dialog.isVisible({ timeout: timeoutMs }).catch(() => false);
    if (!isOpen) return;

    const cancelButton = this.page.getByRole('button', { name: 'Cancel' });
    const closeButton = this.page.getByRole('button', { name: 'Close' });
    if (await cancelButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cancelButton.click();
      await expect(dialog).toBeHidden({ timeout: 5000 }).catch(() => {});
      return;
    }
    if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeButton.click();
      await expect(dialog).toBeHidden({ timeout: 5000 }).catch(() => {});
      return;
    }
    await this.page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 3000 }).catch(() => {});
  }

  /**
   * Fill a spinbutton (number input) with retry strategies for flaky UIs.
   * @param spinbuttonLocator Locator for the spinbutton
   * @param value Value to set
   */
  async fillSpinbuttonWithRetry(spinbuttonLocator: Locator, value: string): Promise<void> {
    await expect(spinbuttonLocator).toBeVisible({ timeout: 10000 });
    const strategies = [
      async () => {
        await spinbuttonLocator.focus();
        await spinbuttonLocator.clear();
        await spinbuttonLocator.fill(value);
        return await spinbuttonLocator.inputValue().catch(() => '');
      },
      async () => {
        await spinbuttonLocator.click();
        await this.page.keyboard.press('Control+A');
        await spinbuttonLocator.type(value, { delay: 50 });
        return await spinbuttonLocator.inputValue().catch(() => '');
      },
      async () => {
        await spinbuttonLocator.focus();
        await spinbuttonLocator.clear();
        await this.page.keyboard.type(value, { delay: 100 });
        return await spinbuttonLocator.inputValue().catch(() => '');
      },
      async () => {
        await spinbuttonLocator.click({ clickCount: 3 });
        await this.page.keyboard.type(value, { delay: 100 });
        return await spinbuttonLocator.inputValue().catch(() => '');
      },
    ];
    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await strategies[i]();
        if (result != null && result !== '') return;
      } catch {
        if (i === strategies.length - 1) {
          throw new Error(`Failed to fill spinbutton with "${value}" after ${strategies.length} strategies.`);
        }
      }
    }
    throw new Error(`Failed to fill spinbutton with "${value}". Field remained empty.`);
  }

  /**
   * Wait until at least one of the indicator checks returns true (for form ready, step loaded, etc.).
   * @param indicators Array of async functions that return true when the condition is met
   * @param options maxRetries and retryDelayMs
   * @returns true when one indicator succeeded
   */
  async waitForFormFieldsReady(
    indicators: Array<() => Promise<boolean>>,
    options: { maxRetries?: number; retryDelayMs?: number } = {}
  ): Promise<boolean> {
    const { maxRetries = 8, retryDelayMs = 2000 } = options;
    for (let retry = 0; retry < maxRetries; retry++) {
      for (const check of indicators) {
        try {
          if (await check()) return true;
        } catch {
          continue;
        }
      }
      if (retry < maxRetries - 1) {
        await this.page.waitForLoadState('domcontentloaded', { timeout: retryDelayMs }).catch(() => {});
      }
    }
    return false;
  }

  /**
   * Create a resilient element wrapper for better interactions
   * @param selector Element selector or locator
   * @param timeout Optional timeout override
   * @returns ResilientElement instance
   */
  getResilientElement(selector: string | Locator, timeout?: number): ResilientElement {
    const locator = typeof selector === 'string' 
      ? this.page.locator(selector) 
      : selector;
    return new ResilientElement(locator, timeout ?? testConfig.timeouts.default);
  }

  /**
   * Generic file upload method with optimized waiting
   * @param fileInputLocator Locator for the file input element
   * @param filePath Path to the file to upload
   * @param waitForSelector Optional selector to wait for after upload (e.g., form fields appearing)
   * @param timeout Timeout for waiting for the selector (default: from config)
   */
  async uploadFile(
    fileInputLocator: Locator,
    filePath: string,
    waitForSelector?: Locator,
    timeout: number = testConfig.timeouts.fileUpload
  ): Promise<void> {
    // Wait for file input to be attached to DOM (file inputs are often hidden for styling)
    // Playwright can interact with hidden file inputs, so we check for attachment rather than visibility
    await expect(fileInputLocator).toBeAttached({ timeout: 5000 });
    await fileInputLocator.setInputFiles(filePath);
    
    if (waitForSelector) {
      // Use waitForElement for better retry logic
      try {
        await this.waitForElement(waitForSelector, { timeout, state: 'visible', retries: 3 });
      } catch (error) {
        // Fallback: check for any form field as alternative indicator
        const alternativeIndicator = this.page.getByRole('combobox').first();
        const isVisible = await alternativeIndicator.isVisible({ timeout: 5000 }).catch(() => false);
        if (!isVisible) {
          throw new Error(
            `Upload completed but expected element not found. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    } else {
      // Minimal wait for file processing (no DOM indicator available)
      await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    }
  }

}

