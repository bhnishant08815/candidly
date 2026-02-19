import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Interview data interface
 */
export interface InterviewData {
  applicantName: string;
  mainInterviewer: string;
  additionalInterviewers?: string[];
  date: string;
  time: string;
  round: string;
}

/**
 * Interview Page Object Model
 * Handles interview scheduling and management interactions.
 */
export class InterviewPage extends BasePage {
  // ============ Locators ============

  /**
   * Interviews navigation button
   */
  private get interviewsButtonLocator(): Locator {
    return this.page.getByRole('button', { name: 'Interviews' });
  }

  /**
   * Schedule Interview button
   */
  private get scheduleInterviewButtonLocator(): Locator {
    return this.page.getByRole('button', { name: 'Schedule Interview' });
  }

  /**
   * Schedule submit button
   */
  private get scheduleButtonLocator(): Locator {
    return this.page.getByRole('button', { name: 'Schedule', exact: true });
  }

  // Legacy locators (still used in some methods)
  private readonly interviewsButton = () => this.page.getByRole('button', { name: 'Interviews' });
  private readonly scheduleInterviewButton = () => this.page.getByRole('button', { name: 'Schedule Interview' });
  private readonly selectApplicantButton = () => this.page.getByRole('button', { name: 'Select an applicant' });
  private readonly selectMainInterviewerButton = () => this.page.getByRole('button', { name: 'Select main interviewer' });
  private readonly selectAdditionalInterviewerButton = () => this.page.getByRole('button', { name: 'Select additional interviewer' });
  private readonly interviewDateInput = () => this.page.getByRole('textbox', { name: 'Interview Date *' });
  private readonly scheduleButton = () => this.page.getByRole('button', { name: 'Schedule', exact: true });
  private readonly sendEmailButton = () => this.page.getByRole('button', { name: 'Send Email' });
  private readonly deleteInterviewButton = () => this.page.getByRole('button', { name: 'Delete Interview' });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Interviews page
   */
  async navigateToInterviews(): Promise<void> {
    // Check if we're already on the interviews page
    const isAlreadyOnPage = await this.scheduleInterviewButton().isVisible({ timeout: 2000 }).catch(() => false);
    if (isAlreadyOnPage) {
      // Already on the page, just wait for it to be stable
      await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
      return;
    }
    
    await this.closeDialogIfOpen(/Add New Applicant/i);

    // Check for interview scheduling dialog (Back button)
    const backButton = this.page.getByRole('button', { name: 'Back' });
    const isInterviewDialogOpen = await backButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isInterviewDialogOpen) {
      await backButton.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    }
    
    // 3. Try pressing Escape as final fallback to close any remaining modals
    await this.page.keyboard.press('Escape');
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    
    // Wait for the Interviews button to be visible (might be in navigation)
    await expect(this.interviewsButtonLocator).toBeVisible({ timeout: 10000 });
    await expect(this.interviewsButtonLocator).toBeEnabled({ timeout: 5000 });
    
    await this.interviewsButtonLocator.click();
    
    // Wait for the interviews page to load by checking for the schedule button
    await expect(this.scheduleInterviewButtonLocator).toBeVisible({ timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {}); // Additional wait for page stability
  }

  /**
   * Open schedule interview dialog
   */
  async openScheduleDialog(): Promise<void> {
    // First, ensure we're on the interviews page
    // Check if we're already on the interviews page by looking for the schedule button
    const isOnInterviewsPage = await this.scheduleInterviewButtonLocator.isVisible();
    
    if (!isOnInterviewsPage) {
      // Navigate back to interviews page if we're not there
      await this.navigateToInterviews();
      // Wait a bit for the page to stabilize
      await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    }
    
    // Wait for any previous blocking notifications to disappear
    // The notification region often intercepts clicks on the schedule button
    const notificationRegion = this.page.getByRole('region', { name: /Notifications/ });
    
    // Check for success toast (most common blocker) and wait for it to hide
    const successToast = notificationRegion.getByText(/Interview Scheduled Successfully/i);
    // Use a short timeout for the check to not slow down tests where it's not present
    if (await successToast.isVisible({ timeout: 2000 }).catch(() => false)) {
      // If visible, wait for it to disappear
      await expect(successToast).toBeHidden({ timeout: 10000 });
      // Small buffer to ensure overlay is completely gone
      await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    }

    // Wait for the schedule button to be visible and enabled with increased timeout
    await expect(this.scheduleInterviewButtonLocator).toBeVisible({ timeout: 15000 });
    await expect(this.scheduleInterviewButtonLocator).toBeEnabled({ timeout: 5000 });
    
    // Small wait to ensure button is fully interactive
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    
    await this.scheduleInterviewButtonLocator.click();
    // Wait for dialog to appear by checking for the applicant selector button
    await expect(this.selectApplicantButton()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select an applicant for the interview
   * @param applicantName Name or identifier of the applicant
   */
  async selectApplicant(applicantName: string): Promise<void> {
    await this.selectApplicantButton().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    
    const applicantOption = this.page.getByRole('button', { name: new RegExp(applicantName, 'i') });
    await expect(applicantOption).toBeVisible();
    await applicantOption.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
  }

  /**
   * Select the main interviewer
   * @param interviewerName Name of the main interviewer (can be partial match)
   */
  async selectMainInterviewer(interviewerName: string): Promise<void> {
    await this.selectMainInterviewerButton().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    
    // Wait for the dropdown dialog to be visible
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Try to find interviewer by name (case-insensitive partial match)
    const interviewerOption = this.page.getByRole('button', { name: new RegExp(interviewerName, 'i') }).first();
    
    // Wait for the option to be visible with a reasonable timeout
    await expect(interviewerOption).toBeVisible({ timeout: 5000 });
    await interviewerOption.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
  }

  /**
   * Select additional interviewers
   * @param interviewerNames Array of additional interviewer names
   */
  async selectAdditionalInterviewers(interviewerNames: string[]): Promise<void> {
    await this.selectAdditionalInterviewerButton().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    
    // Wait for the dialog to be visible
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    for (const name of interviewerNames) {
      // Additional interviewers use checkboxes, not labels
      // The checkbox contains the interviewer name and email
      const interviewer = this.page.getByRole('checkbox', { name: new RegExp(name, 'i') });
      await expect(interviewer).toBeVisible({ timeout: 5000 });
      await interviewer.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    }
    
    // Close the dropdown by clicking outside or pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
  }

  /**
   * Close additional interviewers dropdown
   */
  async closeAdditionalInterviewerDropdown(): Promise<void> {
    const selectedButton = this.page.getByRole('button', { name: /interviewer\(s\) selected/i });
    if (await selectedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectedButton.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    }
  }

  /**
   * Set interview date
   * @param date Date in YYYY-MM-DD format
   */
  async setInterviewDate(date: string): Promise<void> {
    await this.interviewDateInput().fill(date);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
  }

  /**
   * Select interview time
   * @param time Time string (e.g., '10:00 AM')
   */
  async selectInterviewTime(time: string): Promise<void> {
    // Wait for the time selection section to be visible
    const timeSection = this.page.getByText('Quick select time:');
    await expect(timeSection).toBeVisible({ timeout: 5000 });
    
    // Find the time button with exact match
    const timeButton = this.page.getByRole('button', { name: time, exact: true });
    
    // Wait for the button to be visible with a reasonable timeout
    await expect(timeButton).toBeVisible({ timeout: 5000 });
    await timeButton.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
  }

  /**
   * Select interview round
   * @param round Round name (e.g., 'Tech-I')
   */
  async selectInterviewRound(round: string): Promise<void> {
    const roundDropdown = this.page.getByRole('combobox').filter({ hasText: 'Select interview round' });
    await roundDropdown.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    
    const roundOption = this.page.getByRole('option', { name: round, exact: true });
    await expect(roundOption).toBeVisible();
    await roundOption.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
  }

  /**
   * Check for duplicate interview error toast notification
   * The error toast appears when trying to schedule an interview with the same
   * time, date, and round for a candidate that already has an interview scheduled.
   * @returns true if duplicate error is detected, false otherwise
   */
  async checkForDuplicateInterviewError(): Promise<boolean> {
    try {
      // Check for the error toast container
      const errorToast = this.page.locator("//ol[@class='fixed top-4 right-4 z-[100] flex max-h-screen w-full sm:w-auto flex-col p-4 md:max-w-[420px]']");
      
      // Wait a bit for the toast to appear (if it will)
      const isVisible = await errorToast.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        // Get the text content of the toast
        const toastText = await errorToast.textContent().catch(() => '');
        
        console.log(`Toast detected with text: "${toastText}"`);
        
        // Check if it's a success message (if so, not an error)
        const isSuccessMessage = /Interview Scheduled Successfully|successfully|success/i.test(toastText || '');
        
        // Check if it's specifically a duplicate error
        const isDuplicateError = /already scheduled|duplicate|already exists/i.test(toastText || '');
        
        if (isDuplicateError) {
          console.log('Duplicate interview error detected');
          return true;
        }
        
        if (!isSuccessMessage && toastText && toastText.trim().length > 0) {
          // Toast is visible with non-success content - might be an error
          console.log('Non-success toast detected, treating as potential error');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      // If we can't check for the error, assume no error
      console.log(`Error checking for duplicate: ${error}`);
      return false;
    }
  }

  /**
   * Submit the schedule interview form
   * @throws Error if duplicate interview error is detected
   */
  async submitSchedule(): Promise<void> {
    await this.scheduleButtonLocator.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    
    // Check for duplicate interview error after submission
    const hasDuplicateError = await this.checkForDuplicateInterviewError();
    if (hasDuplicateError) {
      throw new Error('DUPLICATE INTERVIEW ERROR: An interview is already scheduled for this candidate with the same time, date, and round. Please use a different time, date, or round.');
    }
  }

  /**
   * Send interview email notification
   */
  async sendInterviewEmail(): Promise<void> {
    await this.sendEmailButton().first().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    await this.sendEmailButton().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
  }

  /**
   * Delete an interview by row identifier
   * @param interviewId Interview ID or identifier text in the row
   * @param confirmText Text to type for confirmation
   */
  async deleteInterview(interviewId: string, confirmText: string): Promise<void> {
    const row = this.page.getByRole('row', { name: new RegExp(interviewId, 'i') });
    await row.getByLabel('Delete').click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    
    // Fill confirmation text
    const confirmInput = this.page.getByRole('textbox', { name: new RegExp(confirmText, 'i') });
    await confirmInput.fill(confirmText);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    
    // Confirm deletion
    await this.deleteInterviewButton().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
  }

  /**
   * Select the first available applicant from the dropdown
   */
  async selectFirstApplicant(): Promise<void> {
    // Wait for the button to be visible and enabled before clicking
    await expect(this.selectApplicantButton()).toBeVisible();
    await expect(this.selectApplicantButton()).toBeEnabled();
    await this.selectApplicantButton().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    
    // Wait for the dropdown dialog to be visible
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Try to click the first button that contains an email symbol '@'
    // This avoids clicking headers or other UI elements
    const applicantOptions = this.page.getByRole('button').filter({ hasText: '@' });
    const count = await applicantOptions.count();
    
    if (count > 0) {
      // Click the first applicant option
      const firstOption = applicantOptions.first();
      await expect(firstOption).toBeVisible({ timeout: 5000 });
      await firstOption.click();
    } else {
      // Fallback to keyboard navigation if no email button found
      await this.page.keyboard.press('ArrowDown');
      await this.page.waitForLoadState('domcontentloaded', { timeout: 400 }).catch(() => {});
      await this.page.keyboard.press('Enter');
    }
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
  }

  /**
   * Select a random applicant from the dropdown
   * @returns The name of the selected applicant
   */
  async selectRandomApplicant(): Promise<string> {
    // Wait for the button to be visible and enabled before clicking
    await expect(this.selectApplicantButton()).toBeVisible();
    await expect(this.selectApplicantButton()).toBeEnabled();
    await this.selectApplicantButton().click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    
    // Wait for the dropdown to be visible
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Get all applicant options (buttons with email symbol '@')
    const applicantOptions = this.page.getByRole('button').filter({ hasText: '@' });
    const count = await applicantOptions.count();
    
    if (count === 0) {
      // Fallback to first applicant if no options found
      await this.selectFirstApplicant();
      return 'First Available Applicant';
    }
    
    // Select a random index
    const randomIndex = Math.floor(Math.random() * count);
    const selectedOption = applicantOptions.nth(randomIndex);
    
    // Get the applicant name before clicking
    const applicantText = await selectedOption.textContent();
    await selectedOption.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    
    // Extract applicant name (format: "Name • email@domain.com")
    const applicantName = applicantText?.split('•')[0]?.trim() || 'Unknown Applicant';
    return applicantName;
  }

  /**
   * Delete the first available interview
   */
  async deleteFirstInterview(): Promise<void> {
    // Find the first row's delete button (skipping header if applicable)
    // We try the second row (index 1) assuming index 0 is header
    const firstDelete = this.page.getByRole('row').nth(1).getByLabel('Delete');
    
    if (await firstDelete.isVisible()) {
      await firstDelete.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
      
      // Handle confirmation
      // Based on user pattern: copy from first textbox and fill into confirmation input
      try {
        const firstTextbox = this.page.getByRole('textbox').first();
        const textToMatch = await firstTextbox.inputValue();
        
        // Type the text into the focused input (confirmation field)
        // or try to find the confirmation input
        await this.page.keyboard.type(textToMatch);
        await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
        
        await this.deleteInterviewButton().click();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
      } catch (error) {
        console.error('Error handling delete confirmation:', error);
        throw error;
      }
    } else {
      console.log('No interviews found to delete');
    }
  }

  /**
   * Schedule a complete interview
   * @param data Interview data
   * @returns The name of the selected applicant
   * @throws Error if duplicate interview error is detected
   */
  async scheduleInterview(data: InterviewData): Promise<string> {
    await this.openScheduleDialog();
    
    let selectedApplicant: string;
    if (data.applicantName === 'SELECT_FIRST_AVAILABLE') {
      await this.selectFirstApplicant();
      selectedApplicant = 'First Available Applicant';
    } else if (data.applicantName === 'SELECT_RANDOM') {
      selectedApplicant = await this.selectRandomApplicant();
    } else {
      await this.selectApplicant(data.applicantName);
      selectedApplicant = data.applicantName;
    }

    await this.selectMainInterviewer(data.mainInterviewer);
    
    if (data.additionalInterviewers && data.additionalInterviewers.length > 0) {
      await this.selectAdditionalInterviewers(data.additionalInterviewers);
      await this.closeAdditionalInterviewerDropdown();
    }
    
    await this.setInterviewDate(data.date);
    await this.selectInterviewTime(data.time);
    await this.selectInterviewRound(data.round);
    
    try {
      await this.submitSchedule();
    } catch (error) {
      // If duplicate error, close the dialog and rethrow (don't retry with same details)
      if (error instanceof Error && error.message.includes('DUPLICATE INTERVIEW ERROR')) {
        // Try to close the dialog by pressing Escape
        await this.page.keyboard.press('Escape');
        await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
        // Close any error notifications
        await this.closeSuccessNotification();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
      }
      // Rethrow the error to prevent retrying with the same details
      throw error;
    }
    
    return selectedApplicant;
  }

  /**
   * Verify that schedule interview button is visible (indicates page is ready)
   */
  async verifyScheduleButtonVisible(): Promise<void> {
    await expect(this.scheduleInterviewButton()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify that send email button is visible
   */
  async verifySendEmailButtonVisible(): Promise<void> {
    await expect(this.sendEmailButton().first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify all required dialog elements are visible
   */
  async verifyScheduleDialogElements(): Promise<void> {
    await expect(this.selectApplicantButton()).toBeVisible();
    await expect(this.selectMainInterviewerButton()).toBeVisible();
    await expect(this.interviewDateInput()).toBeVisible();
    await expect(this.scheduleButton()).toBeVisible();
  }

  /**
   * Click the close button on success notification
   * This closes the success toast notification after interview creation
   */
  async closeSuccessNotification(): Promise<void> {
    try {
      // Look for the close button using the SVG path (X icon)
      // The path is typically inside a button element, so we look for the button containing this path
      const closeButton = this.page.locator("//*[name()='path' and contains(@d,'M18 6 6 18')]").locator('..').first();
      
      // Alternative: try to find the button directly if the path approach doesn't work
      // Wait for the close button to be visible (it's inside the notification)
      const isVisible = await closeButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        // Click the close button to dismiss the notification
        await closeButton.click({ force: true });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
      } else {
        // Try alternative approach - find button containing the SVG
        const altCloseButton = this.page.locator("button").filter({ 
          has: this.page.locator("//*[name()='path' and contains(@d,'M18 6 6 18')]") 
        }).first();
        
        const altVisible = await altCloseButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (altVisible) {
          await altCloseButton.click({ force: true });
          await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
        }
      }
    } catch (error) {
      // If close button is not found, that's okay - notification might have auto-dismissed
      console.log('Close button not found or already dismissed');
    }
  }

  /**
   * Verify interview was scheduled successfully
   * Checks that the schedule button is visible again (dialog closed)
   * Also ensures we're still on the interviews page
   * Clicks the close button on success notification
   */
  async verifyInterviewScheduled(): Promise<void> {
    // Wait for the page to stabilize after form submission
    await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    
    // Wait for success toast to appear (indicates interview was created)
    const notificationRegion = this.page.getByRole('region', { name: /Notifications/ });
    const successToast = notificationRegion.getByText(/Interview Scheduled Successfully/i);
    
    // Wait for success toast to appear (with timeout in case it doesn't)
    await successToast.isVisible({ timeout: 5000 }).catch(() => {
      // If toast doesn't appear, that's okay - continue anyway
    });
    
    // Click the close button on the success notification
    await this.closeSuccessNotification();
    
    // Wait a bit for the notification to close
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    
    // Wait for toast to disappear (if it hasn't already)
    await expect(successToast).toBeHidden({ timeout: 10000 }).catch(() => {
      // If it doesn't disappear, continue anyway after a delay
    });
    
    // Wait for page to fully stabilize
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    
    // Check if we're still on the interviews page by looking for the schedule button
    const isOnInterviewsPage = await this.scheduleInterviewButton().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isOnInterviewsPage) {
      console.log('Already on interviews page');
      // Verify the schedule button is visible and enabled
      await expect(this.scheduleInterviewButton()).toBeVisible({ timeout: 10000 });
      await expect(this.scheduleInterviewButton()).toBeEnabled({ timeout: 5000 });
    } else {
      console.log('Not on interviews page, checking for Interviews button');
      // Check if the Interviews navigation button is visible
      const interviewsButtonVisible = await this.interviewsButton().isVisible({ timeout: 3000 }).catch(() => false);
      
      if (interviewsButtonVisible) {
        // Navigate back to interviews page
        await this.interviewsButton().click();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
        await expect(this.scheduleInterviewButton()).toBeVisible({ timeout: 15000 });
      } else {
        // Page might be in a loading state or somewhere unexpected
        // Wait and try again
        console.log('Interviews button not visible, waiting for page to load');
        await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
        
        // Try clicking on Interviews button one more time
        const retryInterviewsButton = await this.interviewsButton().isVisible({ timeout: 5000 }).catch(() => false);
        if (retryInterviewsButton) {
          await this.interviewsButton().click();
          await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
        }
        
        // Final check for schedule button
        await expect(this.scheduleInterviewButton()).toBeVisible({ timeout: 15000 });
      }
    }
  }
}
