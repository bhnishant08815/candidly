import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { testConfig } from '../config/test-config';

/**
 * Dashboard Page Object Model
 * Handles navigation and dashboard interactions
 */
export class DashboardPage extends BasePage {
  // Locators
  private readonly postingsButton = () => this.page.getByRole('button', { name: 'Postings' });
  private readonly applicantsButton = () => this.page.getByRole('button', { name: 'Applicants' });
  private readonly notificationsButton = () => this.page.getByRole('region', { name: /Notifications/i }).getByRole('button');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Postings page
   */
  async navigateToPostings(): Promise<void> {
    await expect(this.postingsButton()).toBeVisible();
    await this.postingsButton().click();
    await this.wait(1000);
  }

  /**
   * Navigate to Applicants page
   */
  async navigateToApplicants(): Promise<void> {
    await expect(this.applicantsButton()).toBeVisible();
    await this.applicantsButton().click();
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
   * Logout from the application
   */
  async logout(): Promise<void> {
    // Wait for any toasts/notifications to settle
    await this.wait(1000);
    
    // Click on user profile button (uses the logged-in user's name)
    // Use regex for flexible matching (case-insensitive, partial match)
    const userNameRegex = new RegExp(testConfig.credentials.userName, 'i');
    const userButton = this.page.getByRole('button', { name: userNameRegex });
    
    try {
      if (await userButton.isVisible({ timeout: 5000 })) {
        await userButton.click();
        await this.wait(500);

        // Click on logout button
        const logoutButton = this.page.getByRole('button', { name: 'Logout' });
        if (await logoutButton.isVisible({ timeout: 5000 })) {
          await logoutButton.click();
          await this.wait(1000);
        }
      } else {
        console.log('Logout skipped: User profile button not visible (already logged out?)');
      }
    } catch (error) {
      console.log(`Logout failed gracefully: ${error}`);
      // Do not throw to verify test passed
    }
  }
}

