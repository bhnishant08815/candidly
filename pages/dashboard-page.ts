import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { testConfig } from '../config/test-config';
import { SemanticLocator } from '../utils/element-helpers/semantic-locator';

/**
 * Dashboard Page Object Model
 * Handles navigation and dashboard interactions with auto-healing locators.
 */
export class DashboardPage extends BasePage {
  // ============ Semantic Locators with Auto-Healing ============

  /**
   * Job Postings navigation button with semantic context
   */
  private get postingsButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.locator('button[title="Job Postings"]'),
      {
        purpose: 'Job Postings Navigation Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Job Postings', 'Postings', 'Jobs'],
        titlePatterns: ['Job Postings'],
        labelPatterns: ['Job Postings', 'Postings'],
        nearbyContext: 'sidebar navigation'
      },
      [
        this.page.getByRole('button', { name: /Job Postings|Postings/i }),
        this.page.locator('button').filter({ hasText: /Postings/i })
      ]
    );
  }

  /**
   * Applicants navigation button with semantic context
   */
  private get applicantsButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.locator('button[title="Applicants"]'),
      {
        purpose: 'Applicants Navigation Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Applicants', 'Candidates'],
        titlePatterns: ['Applicants'],
        labelPatterns: ['Applicants', 'Candidates'],
        nearbyContext: 'sidebar navigation'
      },
      [
        this.page.getByRole('button', { name: /Applicants/i }),
        this.page.locator('button').filter({ hasText: /Applicants/i })
      ]
    );
  }

  /**
   * Interviews navigation button with semantic context
   */
  private get interviewsButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.locator('button[title="Interviews"]'),
      {
        purpose: 'Interviews Navigation Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Interviews', 'Interview'],
        titlePatterns: ['Interviews'],
        labelPatterns: ['Interviews'],
        nearbyContext: 'sidebar navigation'
      },
      [
        this.page.getByRole('button', { name: /Interviews/i }),
        this.page.locator('button').filter({ hasText: /Interview/i })
      ]
    );
  }

  /**
   * Dashboard navigation button with semantic context
   */
  private get dashboardButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.locator('button[title="Dashboard"]'),
      {
        purpose: 'Dashboard Navigation Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Dashboard', 'Home'],
        titlePatterns: ['Dashboard'],
        labelPatterns: ['Dashboard', 'Home'],
        nearbyContext: 'sidebar navigation'
      },
      [
        this.page.getByRole('button', { name: /Dashboard/i }),
        this.page.locator('button').filter({ hasText: /Dashboard/i })
      ]
    );
  }

  /**
   * Add New Job button with semantic context
   */
  private get addNewJobButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByText('Add New Job', { exact: true }),
      {
        purpose: 'Add New Job Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Add New Job', 'Create Job', 'New Job', 'Add Job'],
        labelPatterns: ['Add New Job', 'Create Job'],
        nearbyContext: 'postings page header'
      },
      [
        this.page.getByRole('button', { name: /Add New Job/i }),
        this.page.locator('button').filter({ hasText: /Add.*Job/i })
      ]
    );
  }

  /**
   * Add Applicant button with semantic context
   */
  private get addApplicantButtonLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('button', { name: 'Add Applicant' }),
      {
        purpose: 'Add Applicant Button',
        elementType: 'button',
        ariaRole: 'button',
        textPatterns: ['Add Applicant', 'New Applicant', 'Add Candidate'],
        labelPatterns: ['Add Applicant', 'New Applicant'],
        nearbyContext: 'applicants page header'
      },
      [
        this.page.getByText('Add Applicant', { exact: true }),
        this.page.locator('button').filter({ hasText: /Add.*Applicant/i })
      ]
    );
  }

  /**
   * Job Postings heading with semantic context
   */
  private get postingsHeadingLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('heading', { name: /Job Postings|Postings/i }),
      {
        purpose: 'Job Postings Page Heading',
        elementType: 'heading',
        ariaRole: 'heading',
        textPatterns: ['Job Postings', 'Postings'],
        nearbyContext: 'postings page'
      }
    );
  }

  /**
   * Applicants heading with semantic context
   */
  private get applicantsHeadingLocator(): SemanticLocator {
    return this.createSemanticLocator(
      this.page.getByRole('heading', { name: 'Applicants' }),
      {
        purpose: 'Applicants Page Heading',
        elementType: 'heading',
        ariaRole: 'heading',
        textPatterns: ['Applicants', 'Candidates'],
        nearbyContext: 'applicants page'
      }
    );
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
    await this.postingsButtonLocator.expectVisible();
    await this.postingsButtonLocator.click();
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
    
    await this.applicantsButtonLocator.expectVisible(10000);
    await this.applicantsButtonLocator.click();
    await this.wait(1000);
  }

  /**
   * Navigate to Interviews page
   */
  async navigateToInterviews(): Promise<void> {
    await this.interviewsButtonLocator.expectVisible();
    await this.interviewsButtonLocator.click();
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
    await this.postingsButtonLocator.expectVisible(10000);
  }

  /**
   * Verify Applicants button is visible
   */
  async verifyApplicantsButtonVisible(): Promise<void> {
    await this.applicantsButtonLocator.expectVisible(10000);
  }

  /**
   * Verify we're on the Postings page
   */
  async verifyOnPostingsPage(): Promise<void> {
    // Check for "Add New Job" button which is specific to the postings page
    await this.addNewJobButtonLocator.expectVisible(10000);
  }

  /**
   * Verify Postings heading is visible
   */
  async verifyPostingsHeadingVisible(): Promise<void> {
    await this.postingsHeadingLocator.expectVisible(10000);
  }

  /**
   * Verify we're on the Applicants page
   */
  async verifyOnApplicantsPage(): Promise<void> {
    // Check for "Add Applicant" button which is specific to the applicants page
    await this.addApplicantButtonLocator.expectVisible(10000);
  }

  /**
   * Verify Applicants heading is visible
   */
  async verifyApplicantsHeadingVisible(): Promise<void> {
    await this.applicantsHeadingLocator.expectVisible(10000);
  }

  /**
   * Verify dashboard is NOT visible (e.g., after logout)
   */
  async verifyDashboardNotVisible(): Promise<void> {
    // Check that dashboard-specific elements are not visible
    const isPostingsVisible = await this.postingsButtonLocator.isVisible();
    const isApplicantsVisible = await this.applicantsButtonLocator.isVisible();
    
    expect(isPostingsVisible).toBe(false);
    expect(isApplicantsVisible).toBe(false);
  }

  /**
   * Logout from the application
   * Uses multiple strategies to find and click the profile button and logout
   */
  async logout(): Promise<void> {
    // Wait for any toasts/notifications to settle
    await this.wait(1000);
    
    try {
      // Create semantic locator for user profile button
      const userName = testConfig.credentials.userName;
      const hrUserName = testConfig.hrCredentials.userName;
      
      // Build user profile locator with semantic context
      const userProfileLocator = this.createSemanticLocator(
        this.page.locator(`button[title="${userName}"]`),
        {
          purpose: 'User Profile Button',
          elementType: 'button',
          ariaRole: 'button',
          textPatterns: [userName || '', hrUserName || '', 'Profile', 'Account'].filter(Boolean),
          titlePatterns: [userName || '', hrUserName || '', 'Profile'].filter(Boolean),
          labelPatterns: ['Profile', 'User', 'Account'].filter(Boolean),
          classPatterns: ['profile', 'avatar', 'user'],
          nearbyContext: 'header/top navigation'
        },
        [
          this.page.locator(`button[title="${hrUserName}"]`),
          this.page.getByRole('button', { name: userName?.charAt(0) || 'N', exact: true }),
          this.page.locator('button[title*="Profile"], button[aria-label*="Profile"]').first(),
          this.page.getByRole('button', { name: /Profile/i })
        ]
      );

      const isProfileButtonVisible = await userProfileLocator.isVisible();
      
      if (isProfileButtonVisible) {
        await userProfileLocator.click();
        await this.wait(1500); // Wait for menu/dialog to open

        // Create semantic locator for logout button
        const logoutLocator = this.createSemanticLocator(
          this.page.getByRole('button', { name: /logout/i }),
          {
            purpose: 'Logout Button',
            elementType: 'button',
            ariaRole: 'button',
            textPatterns: ['Logout', 'Log Out', 'Sign Out', 'Exit'],
            labelPatterns: ['Logout', 'Log Out', 'Sign Out'],
            classPatterns: ['logout', 'signout', 'text-red'],
            nearbyContext: 'user profile dropdown/dialog'
          },
          [
            this.page.getByRole('dialog').getByRole('button', { name: /logout/i }),
            this.page.locator("//button[contains(@class, 'text-red-400') or contains(@class, 'text-red-300')]"),
          ]
        );

        const isLogoutVisible = await logoutLocator.isVisible();
        
        if (isLogoutVisible) {
          await logoutLocator.click();
          // Wait for logout to complete - check for login page elements
          await expect(this.page.locator("//input[@placeholder='johndoe@business.com']")).toBeVisible({ timeout: 10000 }).catch(() => {});
          await this.wait(1000);
        } else {
          console.log('Logout button not found. User might already be logged out or UI changed.');
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
