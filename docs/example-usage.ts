/**
 * Example Usage of New Performance Utilities
 * This file demonstrates how to use the new dynamic and performance features
 */

import { Page } from '@playwright/test';
import { BasePage } from '../pages/base-page';
import { retryWithBackoff } from '../utils/element-helpers/retry-helper';
import { ResilientElement } from '../utils/element-helpers/element-wrapper';

/**
 * Example: Using Resilient Elements
 */
export class ExamplePage extends BasePage {
  async exampleResilientElement(page: Page) {
    // Get a resilient element wrapper
    const submitButton = this.getResilientElement('button[type="submit"]');
    
    // Click with automatic retries
    await submitButton.click({ retries: 3 });
    
    // Fill with value verification
    const emailInput = this.getResilientElement('input[type="email"]');
    await emailInput.fill('test@example.com');
    
    // Select option from dropdown
    const countrySelect = this.getResilientElement('select[name="country"]');
    await countrySelect.selectOption('USA');
  }

  /**
   * Example: Using Dynamic Wait Strategies
   */
  async exampleDynamicWaits(page: Page) {
    // Wait for element to be visible
    await this.waitForElement('button.submit', {
      state: 'visible',
      timeout: 10000,
      retries: 3,
    });
    
    // Wait for specific API response
    await this.waitForAPIResponse('/api/users', 30000, 200);
    
    // Wait for element to be enabled
    await this.waitForElement('button.submit', {
      state: 'enabled',
    });
  }

  /**
   * Example: Using Retry Helpers
   */
  async exampleRetryHelper() {
    await retryWithBackoff(
      async () => {
        // Your operation that might fail
        await this.page.click('button.submit');
        await this.page.waitForSelector('.success-message');
      },
      {
        maxRetries: 3,
        initialDelay: 500,
        maxDelay: 5000,
        backoffFactor: 2,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt}: ${error.message}`);
        },
      }
    );
  }

  /**
   * Example: Optimized Navigation
   */
  async exampleOptimizedNavigation() {
    // Uses domcontentloaded instead of networkidle
    await this.goto();
    
    // Wait for specific content instead of all network activity
    await this.waitForElement('.main-content', { state: 'visible' });
  }

  /**
   * Example: Replacing Hard-Coded Waits
   */
  async exampleReplaceHardWaits() {
    // ❌ OLD WAY - Hard-coded wait
    // await this.wait(2000);
    // await button.click();
    
    // ✅ NEW WAY - Condition-based wait
    const button = this.page.locator('button.submit');
    await this.waitForElement(button, { state: 'visible' });
    await button.click();
    
    // Or use resilient element
    const resilientButton = this.getResilientElement(button);
    await resilientButton.click();
  }
}






