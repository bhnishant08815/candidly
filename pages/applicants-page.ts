import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Applicants Page Object Model
 * Handles all applicant-related interactions
 */
export class ApplicantsPage extends BasePage {
  // Locators
  private readonly addApplicantButton = () => this.page.getByRole('button', { name: 'Add Applicant' });
  private readonly uploadArea = () => this.page.getByText('Click to upload or drag and');
  private readonly applicantDialog = () => this.page.getByRole('dialog', { name: 'Add New Applicant' });
  private readonly phoneInput = () => this.applicantDialog().getByRole('textbox', { name: 'Phone *' });
  private readonly roleCombobox = () => this.applicantDialog().getByRole('combobox');
  private readonly experienceInput = () => this.applicantDialog().getByRole('spinbutton', { name: 'Experience (in years) *' });
  private readonly noticePeriodInput = () => this.applicantDialog().getByRole('textbox', { name: 'Notice Period (in days) *' });
  private readonly currentCTCInput = () => this.applicantDialog().getByRole('textbox', { name: 'Current CTC (in Lakhs) *' });
  private readonly expectedCTCInput = () => this.applicantDialog().getByRole('textbox', { name: 'Expected CTC (in Lakhs) *' });
  private readonly skillsInput = () => this.applicantDialog().getByRole('textbox', { name: 'Skills *' });
  private readonly submitButton = () => this.applicantDialog().getByRole('button', { name: 'Add Applicant' });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Click on Add Applicant button
   */
  async clickAddApplicant(): Promise<void> {
    await expect(this.addApplicantButton()).toBeVisible();
    await this.addApplicantButton().click();
    await this.wait(1000);
  }

  /**
   * Upload resume file
   * @param filePath Path to the resume file (relative to project root)
   */
  async uploadResume(filePath: string): Promise<void> {
    const fileInput = this.applicantDialog().locator('input[type="file"]');
    // Wait for role combobox to appear after resume processing
    await this.uploadFile(fileInput, filePath, this.roleCombobox());
  }

  /**
   * Select role from dropdown
   * @param role Role name (e.g., "Full Stack Developer")
   */
  async selectRole(role: string): Promise<void> {
    await expect(this.roleCombobox()).toBeVisible();
    await this.roleCombobox().click();
    await this.wait(500);
    
    const roleOption = this.page.getByRole('option', { name: role });
    await expect(roleOption).toBeVisible();
    await roleOption.click();
    await this.wait(500);
  }

  /**
   * Fill in phone number
   * @param phone Phone number
   */
  async fillPhone(phone: string): Promise<void> {
    await expect(this.phoneInput()).toBeVisible();
    await this.phoneInput().fill(phone);
  }

  /**
   * Fill in experience in years
   * @param years Number of years of experience
   */
  async fillExperience(years: string): Promise<void> {
    await expect(this.experienceInput()).toBeVisible();
    await this.experienceInput().click();
    await this.experienceInput().fill(years);
  }

  /**
   * Fill in notice period in days
   * @param days Number of days
   */
  async fillNoticePeriod(days: string): Promise<void> {
    await expect(this.noticePeriodInput()).toBeVisible();
    await this.noticePeriodInput().fill(days);
  }

  /**
   * Fill in current CTC in lakhs
   * @param ctc Current CTC amount
   */
  async fillCurrentCTC(ctc: string): Promise<void> {
    await expect(this.currentCTCInput()).toBeVisible();
    await this.currentCTCInput().fill(ctc);
  }

  /**
   * Fill in expected CTC in lakhs
   * @param ctc Expected CTC amount
   */
  async fillExpectedCTC(ctc: string): Promise<void> {
    await expect(this.expectedCTCInput()).toBeVisible();
    await this.expectedCTCInput().fill(ctc);
  }

  /**
   * Fill in skills
   * @param skills Skills as comma-separated string (e.g., "Java, Python")
   */
  async fillSkills(skills: string): Promise<void> {
    await expect(this.skillsInput()).toBeVisible();
    await this.skillsInput().fill(skills);
  }

  /**
   * Submit the applicant form
   */
  async submitApplicant(): Promise<void> {
    await expect(this.submitButton()).toBeVisible();
    await this.submitButton().click();
    await this.wait(2000);
  }

  /**
   * Add a new applicant with all required details
   * @param applicantData Object containing all applicant data
   */
  async addApplicant(applicantData: {
    resumePath: string;
    phone: string;
    role: string;
    experience: string;
    noticePeriod: string;
    currentCTC: string;
    expectedCTC: string;
    skills: string;
  }): Promise<void> {
    await this.clickAddApplicant();
    await this.uploadResume(applicantData.resumePath);
    await this.selectRole(applicantData.role);
    await this.fillExperience(applicantData.experience);
    await this.fillNoticePeriod(applicantData.noticePeriod);
    await this.fillCurrentCTC(applicantData.currentCTC);
    await this.fillExpectedCTC(applicantData.expectedCTC);
    await this.fillSkills(applicantData.skills);
    await this.fillPhone(applicantData.phone);
    await this.submitApplicant();
  }
}

