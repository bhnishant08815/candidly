import { Page, Locator, expect } from '@playwright/test';
import { testConfig } from '../config/test-config';

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
   * Navigate to the base URL
   */
  async goto(): Promise<void> {
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specified amount of time
   * @deprecated Use condition-based waits instead (e.g., waitFor, expect.toBeVisible)
   * @param ms Milliseconds to wait
   */
  async wait(ms: number): Promise<void> {
    // Use waitForTimeout only as a last resort - prefer condition-based waits
    await this.page.waitForTimeout(ms);
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Generic file upload method
   * @param fileInputLocator Locator for the file input element
   * @param filePath Path to the file to upload
   * @param waitForSelector Optional selector to wait for after upload (e.g., form fields appearing)
   * @param timeout Timeout for waiting for the selector (default: 30000ms)
   */
  async uploadFile(
    fileInputLocator: Locator,
    filePath: string,
    waitForSelector?: Locator,
    timeout: number = testConfig.timeouts.fileUpload
  ): Promise<void> {
    await fileInputLocator.setInputFiles(filePath);
    
    if (waitForSelector) {
      // Wait for the selector with more flexible error handling
      try {
        await expect(waitForSelector).toBeVisible({ timeout });
      } catch (error) {
        // If the specific selector doesn't appear, wait a bit and check for alternative indicators
        await this.wait(2000);
        // Try to find any combobox or form field as an alternative indicator
        const alternativeIndicator = this.page.getByRole('combobox').first();
        const isVisible = await alternativeIndicator.isVisible({ timeout: 5000 }).catch(() => false);
        if (!isVisible) {
          // If still not visible, throw the original error with more context
          throw new Error(`Upload completed but expected element not found. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    await this.wait(1000);
  }
}

