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
    // Use waitForTimeout only as a last resort - prefer condition-based waits
    await this.page.waitForTimeout(ms);
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
        await this.page.waitForTimeout(500);
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
   * @param useCache Whether to use cached response (default: true)
   */
  async waitForAPIResponse(
    urlPattern: string | RegExp,
    timeout: number = testConfig.timeouts.networkIdle,
    statusCode?: number,
    useCache: boolean = true
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
      // Wait for upload to complete (check for any loading indicator to disappear)
      await this.page.waitForTimeout(500); // Minimal wait for file processing
    }
  }

}

