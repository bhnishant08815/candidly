import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';

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
   * Schedule Interview button (confirms we're on Interviews page)
   */
  private get interviewsPageIndicator(): Locator {
    return this.page.getByRole('button', { name: 'Schedule Interview' });
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
   * Scoped to nav/header to avoid matching other buttons with initials.
   */
  private get profileButton(): Locator {
    return this.page
      .locator('nav button, header button, [role="banner"] button')
      .filter({ hasText: /^[A-Z]{1,3}$/ })
      .first();
  }

  /**
   * Logout button in dropdown menu
   */
  private get logoutDropdownButton(): Locator {
    return this.page.getByRole('button', { name: 'Logout' }).last();
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
    await expect(this.postingsHeading.or(this.addNewJobButton).first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Navigate to Applicants page
   */
  async navigateToApplicants(): Promise<void> {
    await this.closeDialogIfOpen(/Add New Applicant/i);
    await expect(this.applicantsButton).toBeVisible({ timeout: 10000 });
    await this.applicantsButton.click();
    await expect(this.applicantsHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Navigate to Interviews page
   */
  async navigateToInterviews(): Promise<void> {
    await expect(this.interviewsButton).toBeVisible();
    await this.interviewsButton.click();
    await expect(this.interviewsPageIndicator).toBeVisible({ timeout: 10000 });
  }

  /**
   * Navigate to Dashboard page
   */
  async navigateToDashboard(): Promise<void> {
    await expect(this.dashboardButton).toBeVisible({ timeout: 10000 });
    await this.dashboardButton.click();
  }


  /**
   * Close notifications popup if visible
   */
  async closeNotifications(): Promise<void> {
    try {
      const notificationsBtn = this.notificationsButton();
      if (await notificationsBtn.isVisible({ timeout: 2000 })) {
        await notificationsBtn.click();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
      }
    } catch {
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
    await expect(this.postingsButton).toBeHidden({ timeout: 5000 });
    await expect(this.applicantsButton).toBeHidden({ timeout: 5000 });
  }

  /**
   * Logout from the application
   * CRITICAL: The dropdown closes when mouse moves away, so we must click profile then immediately click logout
   */
  async logout(): Promise<void> {
    await expect(this.profileButton).toBeVisible({ timeout: 5000 });
    await this.profileButton.click();

    try {
      await expect(this.logoutDropdownButton).toBeVisible({ timeout: 2000 });
      await this.logoutDropdownButton.click({ timeout: 3000 });
    } catch {
      // Fallback: direct DOM manipulation if Playwright can't interact
      const clicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const logoutButtons = buttons.filter(
          (btn) =>
            btn.textContent?.trim().toLowerCase() === 'logout' && btn.offsetParent !== null
        );
        if (logoutButtons.length > 0) {
          logoutButtons[logoutButtons.length - 1].click();
          return true;
        }
        return false;
      });
      if (!clicked) {
        throw new Error('Logout button in dropdown not found');
      }
    }

    const logoutConfirmButton = this.page.getByRole('button', { name: 'Logout' });
    await expect(logoutConfirmButton).toBeVisible({ timeout: 5000 });
    await logoutConfirmButton.click({ timeout: 5000 });

    await this.page.waitForURL(
      (url) => !url.pathname.match(/^\/(admin|dashboard)/i),
      { timeout: 15000 }
    );
  }
}
