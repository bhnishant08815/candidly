/**
 * Test Cleanup Utility
 * Centralized cleanup functions for test teardown at multiple levels
 */

import { Page, BrowserContext } from '@playwright/test';
import { testConfig } from '../../config/test-config';
import { DashboardPage } from '../../pages/dashboard-page';

export interface CleanupOptions {
  /** Logout via API instead of UI (faster and more reliable) */
  logoutViaApi?: boolean;
  /** Dismiss any open notifications */
  dismissNotifications?: boolean;
  /** Close any open dialogs/modals */
  closeDialogs?: boolean;
  /** DashboardPage instance for UI-based logout */
  dashboardPage?: DashboardPage;
  /** Enable verbose logging */
  verbose?: boolean;
}

const DEFAULT_OPTIONS: CleanupOptions = {
  logoutViaApi: true,
  dismissNotifications: true,
  closeDialogs: true,
  verbose: false,
};

/**
 * Perform comprehensive test cleanup
 * Call this in afterEach or fixture teardown
 * 
 * @param page - Playwright Page instance
 * @param options - Cleanup options
 */
export async function performTestCleanup(
  page: Page,
  options: CleanupOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Step 1: Close any open dialogs
    if (opts.closeDialogs) {
      await closeDialogs(page, opts.verbose);
    }

    // Step 2: Dismiss notifications
    if (opts.dismissNotifications) {
      await dismissNotifications(page, opts.verbose);
    }

    // Step 3: Logout
    if (opts.logoutViaApi) {
      await logoutViaApiSafe(page, opts.verbose);
    } else if (opts.dashboardPage) {
      await logoutViaUISafe(opts.dashboardPage, opts.verbose);
    }
  } catch (error) {
    // Never fail the test due to cleanup errors
    if (opts.verbose) {
      console.log(`⚠️ Cleanup encountered error: ${error}`);
    }
  }
}

/**
 * Safely logout via API - won't throw on failure
 */
export async function logoutViaApiSafe(
  page: Page,
  verbose: boolean = false
): Promise<boolean> {
  try {
    const logoutConfig = testConfig.logoutApi;
    
    if (!logoutConfig || !logoutConfig.url) {
      if (verbose) {
        console.log('ℹ️ Logout API not configured, skipping API logout');
      }
      return false;
    }

    const response = await page.request.fetch(logoutConfig.url, {
      method: logoutConfig.method ?? 'GET',
    });

    if (verbose) {
      if (response.ok()) {
        console.log(`🔓 Logout API successful: ${response.status()}`);
      } else {
        console.log(`⚠️ Logout API returned: ${response.status()}`);
      }
    }

    return response.ok();
  } catch (error) {
    if (verbose) {
      console.log(`⚠️ Logout API failed: ${error}`);
    }
    return false;
  }
}

/**
 * Safely logout via UI - won't throw on failure
 */
export async function logoutViaUISafe(
  dashboardPage: DashboardPage,
  verbose: boolean = false
): Promise<boolean> {
  try {
    await dashboardPage.logout();
    if (verbose) {
      console.log('🔓 UI logout successful');
    }
    return true;
  } catch (error) {
    if (verbose) {
      console.log(`⚠️ UI logout failed: ${error}`);
    }
    return false;
  }
}

/**
 * Close any open dialogs/modals
 */
export async function closeDialogs(
  page: Page,
  verbose: boolean = false
): Promise<void> {
  try {
    // Try pressing Escape to close any modal
    await page.keyboard.press('Escape');
    
    // Wait briefly for dialog to close
    await page.waitForTimeout(300);
    
    // Check for common close buttons and click if visible
    const closeButtons = [
      page.getByRole('button', { name: 'Close' }),
      page.getByRole('button', { name: 'Cancel' }),
      page.locator('[aria-label="Close"]'),
      page.locator('[data-testid="close-button"]'),
    ];

    for (const button of closeButtons) {
      try {
        if (await button.isVisible({ timeout: 500 })) {
          await button.click();
          if (verbose) {
            console.log('✓ Closed dialog via button');
          }
          break;
        }
      } catch {
        // Button not visible or clickable, continue
      }
    }
  } catch (error) {
    if (verbose) {
      console.log(`⚠️ Close dialogs failed: ${error}`);
    }
  }
}

/**
 * Dismiss any open notifications/toasts
 */
export async function dismissNotifications(
  page: Page,
  verbose: boolean = false
): Promise<void> {
  try {
    // Common notification close selectors
    const notificationCloseSelectors = [
      '.ant-notification-notice-close',
      '.toast-close-button',
      '[data-testid="notification-close"]',
      '.notification-close',
      '[aria-label="Close notification"]',
    ];

    for (const selector of notificationCloseSelectors) {
      try {
        const closeButtons = page.locator(selector);
        const count = await closeButtons.count();
        
        for (let i = 0; i < count; i++) {
          await closeButtons.nth(i).click({ timeout: 500 });
        }
        
        if (count > 0 && verbose) {
          console.log(`✓ Dismissed ${count} notification(s)`);
        }
      } catch {
        // Selector not found or not clickable, continue
      }
    }
  } catch (error) {
    if (verbose) {
      console.log(`⚠️ Dismiss notifications failed: ${error}`);
    }
  }
}

/**
 * Clear browser context state (cookies, storage)
 * Use sparingly - typically only in global teardown
 */
export async function clearBrowserState(
  context: BrowserContext,
  verbose: boolean = false
): Promise<void> {
  try {
    await context.clearCookies();
    if (verbose) {
      console.log('✓ Cleared browser cookies');
    }
  } catch (error) {
    if (verbose) {
      console.log(`⚠️ Clear browser state failed: ${error}`);
    }
  }
}

/**
 * Cleanup helper for global teardown
 * Performs cleanup operations that should run once after all tests
 */
export async function performGlobalCleanup(verbose: boolean = true): Promise<void> {
  if (verbose) {
    console.log('\n🧹 Global Teardown: Starting cleanup...');
  }

  // Log completion
  if (verbose) {
    console.log('✅ Global Teardown: Cleanup complete\n');
  }
}
