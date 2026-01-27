import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { testConfig } from '../config/test-config';

/**
 * Dashboard Page Object Model
 * Handles navigation and dashboard interactions.
 */
export class DashboardPage extends BasePage {
  // ============ Locators ============

  /**
   * Job Postings navigation button
   */
  private get postingsButton(): Locator {
    return this.page.locator('button[title="Job Postings"]');
  }

  /**
   * Applicants navigation button
   */
  private get applicantsButton(): Locator {
    return this.page.locator('button[title="Applicants"]');
  }

  /**
   * Interviews navigation button
   */
  private get interviewsButton(): Locator {
    return this.page.locator('button[title="Interviews"]');
  }

  /**
   * Dashboard navigation button
   */
  private get dashboardButton(): Locator {
    return this.page.locator('button[title="Dashboard"]');
  }

  /**
   * Add New Job button
   */
  private get addNewJobButton(): Locator {
    return this.page.getByText('Add New Job', { exact: true });
  }

  /**
   * Add Applicant button
   */
  private get addApplicantButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Applicant' });
  }

  /**
   * Job Postings heading
   */
  private get postingsHeading(): Locator {
    return this.page.getByRole('heading', { name: /Job Postings|Postings/i });
  }

  /**
   * Applicants heading
   */
  private get applicantsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Applicants' });
  }

  /**
   * Profile button (displays user initials, e.g., "NB", "AB")
   */
  private get profileButton(): Locator {
    // Profile button with 1-3 uppercase letters (e.g., "NB", "AB")
    return this.page.locator('button').filter({ hasText: /^[A-Z]{1,3}$/ }).first();
  }

  /**
   * Logout button in dropdown menu
   */
  private get logoutDropdownButton(): Locator {
    // Logout button within dropdown/menu context
    return this.page.getByRole('button', { name: 'Logout' }).first();
  }

  // Legacy locators for backward compatibility with notifications
  private readonly notificationsButton = () => this.page.getByRole('region', { name: /Notifications/i }).getByRole('button');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Postings page
   */
  async navigateToPostings(): Promise<void> {
    await expect(this.postingsButton).toBeVisible();
    await this.postingsButton.click();
    await this.wait(1000);
  }

  /**
   * Navigate to Applicants page
   */
  async navigateToApplicants(): Promise<void> {
    // Check for and close any open dialogs that might block navigation
    const addApplicantDialog = this.page.getByRole('dialog', { name: /Add New Applicant/i });
    const isAddApplicantDialogOpen = await addApplicantDialog.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isAddApplicantDialogOpen) {
      // Try to close using Cancel or Close button
      const cancelButton = this.page.getByRole('button', { name: 'Cancel' });
      const closeButton = this.page.getByRole('button', { name: 'Close' });
      
      if (await cancelButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cancelButton.click();
        await this.wait(500);
      } else if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click();
        await this.wait(500);
      } else {
        // Fallback: press Escape
        await this.page.keyboard.press('Escape');
        await this.wait(500);
      }
    }
    
    // Try pressing Escape as fallback to close any remaining modals
    await this.page.keyboard.press('Escape');
    await this.wait(300);
    
    await expect(this.applicantsButton).toBeVisible({ timeout: 10000 });
    await this.applicantsButton.click();
    await this.wait(1000);
  }

  /**
   * Navigate to Interviews page
   */
  async navigateToInterviews(): Promise<void> {
    await expect(this.interviewsButton).toBeVisible();
    await this.interviewsButton.click();
    await this.wait(1000);
  }

  /**
   * Close notifications popup if visible
   */
  async closeNotifications(): Promise<void> {
    try {
      const notificationsBtn = this.notificationsButton();
      if (await notificationsBtn.isVisible({ timeout: 2000 })) {
        await notificationsBtn.click();
        await this.wait(500);
      }
    } catch (error) {
      // Notifications button not visible, continue
    }
  }

  /**
   * Verify Postings button is visible
   */
  async verifyPostingsButtonVisible(): Promise<void> {
    await expect(this.postingsButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify Applicants button is visible
   */
  async verifyApplicantsButtonVisible(): Promise<void> {
    await expect(this.applicantsButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify we're on the Postings page
   */
  async verifyOnPostingsPage(): Promise<void> {
    // Check for "Add New Job" button which is specific to the postings page
    await expect(this.addNewJobButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify Postings heading is visible
   */
  async verifyPostingsHeadingVisible(): Promise<void> {
    await expect(this.postingsHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify we're on the Applicants page
   */
  async verifyOnApplicantsPage(): Promise<void> {
    // Check for "Add Applicant" button which is specific to the applicants page
    await expect(this.addApplicantButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify Applicants heading is visible
   */
  async verifyApplicantsHeadingVisible(): Promise<void> {
    await expect(this.applicantsHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify dashboard is NOT visible (e.g., after logout)
   */
  async verifyDashboardNotVisible(): Promise<void> {
    // Check that dashboard-specific elements are not visible
    const isPostingsVisible = await this.postingsButton.isVisible();
    const isApplicantsVisible = await this.applicantsButton.isVisible();
    
    expect(isPostingsVisible).toBe(false);
    expect(isApplicantsVisible).toBe(false);
  }

  /**
   * Logout from the application
   * CRITICAL: The dropdown closes when mouse moves away, so we must click profile then immediately click logout
   */
  async logout(): Promise<void> {
    // Wait for any toasts/notifications to settle
    await this.wait(1000);
    
    // Step 1: Click the profile button to open dropdown
    await this.profileButton.click();
    
    // Step 2: Wait for dropdown to appear and immediately click Logout button
    // The dropdown contains: Profile, Support, Logout (in that order)
    // We need to click the Logout button (last button in dropdown) without moving mouse away
    
    try {
      // Wait for ANY Logout button to appear (dropdown or otherwise)
      await this.page.waitForSelector('button:has-text("Logout")', { 
        state: 'visible',
        timeout: 2000 
      });
      
      // Get all visible Logout buttons and click the LAST one (the one in dropdown)
      await this.page.locator('button').filter({ hasText: 'Logout' }).last().click({ timeout: 3000 });
      
    } catch (error) {
      // If Playwright can't find it, try direct DOM manipulation
      const clicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const logoutButtons = buttons.filter(btn => 
          btn.textContent?.trim().toLowerCase() === 'logout' &&
          btn.offsetParent !== null
        );
        
        if (logoutButtons.length > 0) {
          const lastBtn = logoutButtons[logoutButtons.length - 1];
          lastBtn.click();
          return true;
        }
        return false;
      });
      
      if (!clicked) {
        throw new Error('Logout button in dropdown not found');
      }
    }
    
    // Step 3: Wait for confirmation dialog and click the Logout button in it
    await this.wait(1000);
    const logoutConfirmButton = this.page.getByRole('button', { name: 'Logout' });
    await logoutConfirmButton.click({ timeout: 5000 });
    
    // Step 4: Wait for logout to complete
    await this.page.waitForURL(
      (url) => !url.pathname.match(/^\/(admin|dashboard)/i),
      { timeout: 15000 }
    );
    
    await this.wait(1000);
  }
}
