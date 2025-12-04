import { Page, expect } from '@playwright/test';
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
 * Handles interview scheduling and management interactions
 */
export class InterviewPage extends BasePage {
  // Locators
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
    await expect(this.interviewsButton()).toBeVisible();
    await this.interviewsButton().click();
    await this.wait(1000);
  }

  /**
   * Open schedule interview dialog
   */
  async openScheduleDialog(): Promise<void> {
    await expect(this.scheduleInterviewButton()).toBeVisible();
    await this.scheduleInterviewButton().click();
    await this.wait(500);
  }

  /**
   * Select an applicant for the interview
   * @param applicantName Name or identifier of the applicant
   */
  async selectApplicant(applicantName: string): Promise<void> {
    await this.selectApplicantButton().click();
    await this.wait(500);
    
    const applicantOption = this.page.getByRole('button', { name: new RegExp(applicantName, 'i') });
    await expect(applicantOption).toBeVisible();
    await applicantOption.click();
    await this.wait(500);
  }

  /**
   * Select the main interviewer
   * @param interviewerName Name of the main interviewer
   */
  async selectMainInterviewer(interviewerName: string): Promise<void> {
    await this.selectMainInterviewerButton().click();
    await this.wait(500);
    
    const interviewerOption = this.page.getByRole('button', { name: new RegExp(interviewerName, 'i') }).first();
    await expect(interviewerOption).toBeVisible();
    await interviewerOption.click();
    await this.wait(500);
  }

  /**
   * Select additional interviewers
   * @param interviewerNames Array of additional interviewer names
   */
  async selectAdditionalInterviewers(interviewerNames: string[]): Promise<void> {
    await this.selectAdditionalInterviewerButton().click();
    await this.wait(500);
    
    for (const name of interviewerNames) {
      const interviewer = this.page.locator('label').filter({ hasText: new RegExp(name, 'i') });
      await interviewer.click();
      await this.wait(300);
    }
    
    // Close the dropdown by clicking outside
    await this.page.locator('div').filter({ hasText: 'ParticipantsSelect candidate' }).nth(5).click();
    await this.wait(500);
  }

  /**
   * Close additional interviewers dropdown
   */
  async closeAdditionalInterviewerDropdown(): Promise<void> {
    const selectedButton = this.page.getByRole('button', { name: /interviewer\(s\) selected/i });
    if (await selectedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectedButton.click();
      await this.wait(500);
    }
  }

  /**
   * Set interview date
   * @param date Date in YYYY-MM-DD format
   */
  async setInterviewDate(date: string): Promise<void> {
    await this.interviewDateInput().fill(date);
    await this.wait(300);
  }

  /**
   * Select interview time
   * @param time Time string (e.g., '10:00 AM')
   */
  async selectInterviewTime(time: string): Promise<void> {
    const timeButton = this.page.getByRole('button', { name: time });
    await expect(timeButton).toBeVisible();
    await timeButton.click();
    await this.wait(300);
  }

  /**
   * Select interview round
   * @param round Round name (e.g., 'Tech-I')
   */
  async selectInterviewRound(round: string): Promise<void> {
    const roundDropdown = this.page.getByRole('combobox').filter({ hasText: 'Select interview round' });
    await roundDropdown.click();
    await this.wait(300);
    
    const roundOption = this.page.getByRole('option', { name: round, exact: true });
    await expect(roundOption).toBeVisible();
    await roundOption.click();
    await this.wait(300);
  }

  /**
   * Submit the schedule interview form
   */
  async submitSchedule(): Promise<void> {
    await this.scheduleButton().click();
    await this.wait(1000);
  }

  /**
   * Send interview email notification
   */
  async sendInterviewEmail(): Promise<void> {
    await this.sendEmailButton().first().click();
    await this.wait(500);
    await this.sendEmailButton().click();
    await this.wait(1000);
  }

  /**
   * Delete an interview by row identifier
   * @param interviewId Interview ID or identifier text in the row
   * @param confirmText Text to type for confirmation
   */
  async deleteInterview(interviewId: string, confirmText: string): Promise<void> {
    const row = this.page.getByRole('row', { name: new RegExp(interviewId, 'i') });
    await row.getByLabel('Delete').click();
    await this.wait(500);
    
    // Fill confirmation text
    const confirmInput = this.page.getByRole('textbox', { name: new RegExp(confirmText, 'i') });
    await confirmInput.fill(confirmText);
    await this.wait(300);
    
    // Confirm deletion
    await this.deleteInterviewButton().click();
    await this.wait(1000);
  }

  /**
   * Select the first available applicant from the dropdown
   */
  async selectFirstApplicant(): Promise<void> {
    await this.selectApplicantButton().click();
    await this.wait(500);
    
    // Try to click the first button that contains an email symbol '@'
    // This avoids clicking headers or other UI elements
    const firstOption = this.page.getByRole('button').filter({ hasText: '@' }).first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    } else {
      // Fallback to keyboard if no email button found
      await this.page.keyboard.press('ArrowDown');
      await this.wait(200);
      await this.page.keyboard.press('Enter');
    }
    await this.wait(500);
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
      await this.wait(500);
      
      // Handle confirmation
      // Based on user pattern: copy from first textbox and fill into confirmation input
      try {
        const firstTextbox = this.page.getByRole('textbox').first();
        const textToMatch = await firstTextbox.inputValue();
        
        // Type the text into the focused input (confirmation field)
        // or try to find the confirmation input
        await this.page.keyboard.type(textToMatch);
        await this.wait(300);
        
        await this.deleteInterviewButton().click();
        await this.wait(1000);
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
   */
  async scheduleInterview(data: InterviewData): Promise<void> {
    await this.openScheduleDialog();
    
    if (data.applicantName === 'SELECT_FIRST_AVAILABLE') {
      await this.selectFirstApplicant();
    } else {
      await this.selectApplicant(data.applicantName);
    }

    await this.selectMainInterviewer(data.mainInterviewer);
    
    if (data.additionalInterviewers && data.additionalInterviewers.length > 0) {
      await this.selectAdditionalInterviewers(data.additionalInterviewers);
      await this.closeAdditionalInterviewerDropdown();
    }
    
    await this.setInterviewDate(data.date);
    await this.selectInterviewTime(data.time);
    await this.selectInterviewRound(data.round);
    await this.submitSchedule();
  }
}
