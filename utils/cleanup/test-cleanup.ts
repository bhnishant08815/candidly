/**
 * Test Cleanup Utility
 * Centralized cleanup functions for test teardown at multiple levels
 */

import { Page, BrowserContext } from '@playwright/test';
import { logoutViaApiSafe } from '../auth/logout-api';
import { DashboardPage } from '../../pages/dashboard-page';
import { JobPostingPage } from '../../pages/job-posting-page';
import { ApplicantsPage } from '../../pages/applicants-page';
import { InterviewPage } from '../../pages/interview-page';
import { TestDataTracker, TrackedResource } from '../data/test-data-tracker';

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
  /** Delete created records during cleanup */
  deleteCreatedRecords?: boolean;
  /** JobPostingPage instance for deleting job postings */
  jobPostingPage?: JobPostingPage;
  /** ApplicantsPage instance for deleting applicants */
  applicantsPage?: ApplicantsPage;
  /** InterviewPage instance for deleting interviews */
  interviewPage?: InterviewPage;
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
 * @param testId - Optional test ID for tracking and deleting created records
 */
export async function performTestCleanup(
  page: Page,
  options: CleanupOptions = {},
  testId?: string
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Step 1: Delete created records (before logout to ensure we're authenticated)
    if (opts.deleteCreatedRecords && testId) {
      await deleteTrackedRecords(page, testId, opts);
    } else if (opts.deleteCreatedRecords && !testId) {
      // Always warn if deleteCreatedRecords is true but testId is missing
      console.warn(`⚠️ [Cleanup] deleteCreatedRecords is enabled but testId is not provided. Records will not be deleted.`);
    }

    // Step 2: Close any open dialogs
    if (opts.closeDialogs) {
      await closeDialogs(page, opts.verbose);
    }

    // Step 3: Dismiss notifications
    if (opts.dismissNotifications) {
      await dismissNotifications(page, opts.verbose);
    }

    // Step 4: Logout
    if (opts.logoutViaApi) {
      await logoutViaApiSafe(page, opts.verbose);
    } else if (opts.dashboardPage) {
      await logoutViaUISafe(opts.dashboardPage, opts.verbose);
    }
  } catch (error) {
    // Never fail the test due to cleanup errors, but always log them
    console.warn(`⚠️ [Cleanup] Encountered unexpected error during cleanup:`, error);
    if (opts.verbose && error instanceof Error) {
      console.warn(`   Error message: ${error.message}`);
      if (error.stack) {
        console.warn(`   Stack trace: ${error.stack.split('\n').slice(0, 5).join('\n')}`);
      }
    }
  }
}

/**
 * Delete all tracked records for a test
 * Deletes in reverse order (LIFO) to handle dependencies
 */
async function deleteTrackedRecords(
  page: Page,
  testId: string,
  options: CleanupOptions
): Promise<void> {
  const resources = TestDataTracker.getTrackedResources(testId);
  
  if (resources.length === 0) {
    if (options.verbose) {
      console.log(`ℹ️ No tracked resources to delete for test: ${testId}`);
    }
    return;
  }
  
  // Always log when starting deletion (even without verbose)
  console.log(`🗑️ [Cleanup] Starting deletion of ${resources.length} tracked resource(s) for test: ${testId}`);
  
  if (options.verbose) {
    console.log(`   Resources to delete:`, resources.map(r => `${r.type}(${r.identifier})`).join(', '));
  }
  
  let successCount = 0;
  let failureCount = 0;
  const failures: Array<{ type: string; identifier: string; error: any }> = [];
  
  // Delete in reverse order (LIFO) to handle dependencies
  // Order: interviews → applicants → job postings
  for (const resource of resources.reverse()) {
    try {
      const startTime = Date.now();
      
      switch (resource.type) {
        case 'jobPosting':
          if (options.jobPostingPage) {
            if (options.verbose) {
              console.log(`   → Deleting job posting: "${resource.identifier}"`);
            }
            await options.jobPostingPage.deleteJobPostingByTitle(resource.identifier);
            successCount++;
            if (options.verbose) {
              console.log(`   ✓ Successfully deleted job posting: "${resource.identifier}" (${Date.now() - startTime}ms)`);
            }
          } else {
            const error = `JobPostingPage not provided`;
            console.warn(`⚠️ [Cleanup] Cannot delete job posting "${resource.identifier}": ${error}`);
            failureCount++;
            failures.push({ type: resource.type, identifier: resource.identifier, error });
          }
          break;
        case 'applicant':
          if (options.applicantsPage) {
            if (options.verbose) {
              console.log(`   → Deleting applicant: "${resource.identifier}"`);
            }
            await options.applicantsPage.deleteApplicantByIdentifier(resource.identifier);
            successCount++;
            if (options.verbose) {
              console.log(`   ✓ Successfully deleted applicant: "${resource.identifier}" (${Date.now() - startTime}ms)`);
            }
          } else {
            const error = `ApplicantsPage not provided`;
            console.warn(`⚠️ [Cleanup] Cannot delete applicant "${resource.identifier}": ${error}`);
            failureCount++;
            failures.push({ type: resource.type, identifier: resource.identifier, error });
          }
          break;
        case 'interview':
          if (options.interviewPage) {
            if (options.verbose) {
              console.log(`   → Deleting interview: "${resource.identifier}"`);
            }
            // InterviewPage.deleteInterview requires identifier and confirmText
            // Use identifier for both if available
            await options.interviewPage.deleteInterview(resource.identifier, resource.identifier);
            successCount++;
            if (options.verbose) {
              console.log(`   ✓ Successfully deleted interview: "${resource.identifier}" (${Date.now() - startTime}ms)`);
            }
          } else {
            const error = `InterviewPage not provided`;
            console.warn(`⚠️ [Cleanup] Cannot delete interview "${resource.identifier}": ${error}`);
            failureCount++;
            failures.push({ type: resource.type, identifier: resource.identifier, error });
          }
          break;
      }
    } catch (error) {
      // Log but don't fail - cleanup errors shouldn't fail tests
      failureCount++;
      failures.push({ type: resource.type, identifier: resource.identifier, error });
      console.warn(`⚠️ [Cleanup] Failed to delete ${resource.type} "${resource.identifier}":`, error);
      if (options.verbose && error instanceof Error) {
        console.warn(`   Error details: ${error.message}`);
        if (error.stack) {
          console.warn(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
        }
      }
    }
  }
  
  // Clear tracked resources after deletion attempt
  TestDataTracker.clear(testId);
  
  // Always log summary (even without verbose)
  if (successCount > 0 && failureCount === 0) {
    console.log(`✅ [Cleanup] Successfully deleted ${successCount} resource(s) for test: ${testId}`);
  } else if (successCount > 0 && failureCount > 0) {
    console.log(`⚠️ [Cleanup] Deleted ${successCount} resource(s), failed ${failureCount} resource(s) for test: ${testId}`);
    if (options.verbose) {
      console.log(`   Failures:`, failures.map(f => `${f.type}(${f.identifier})`).join(', '));
    }
  } else if (failureCount > 0) {
    console.error(`❌ [Cleanup] Failed to delete all ${failureCount} resource(s) for test: ${testId}`);
    if (options.verbose) {
      failures.forEach(f => {
        console.error(`   - ${f.type} "${f.identifier}":`, f.error);
      });
    }
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
    
    await page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    
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
