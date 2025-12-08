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
  
  // Form field locators
  private readonly fullNameInput = () => this.applicantDialog().getByRole('textbox', { name: 'Full Name *' });
  private readonly emailInput = () => this.applicantDialog().getByRole('textbox', { name: 'Email *' });
  private readonly phoneInput = () => this.applicantDialog().getByRole('textbox', { name: 'Phone *' });
  private readonly roleCombobox = () => this.applicantDialog().getByRole('combobox').filter({ hasText: 'Select position' });
  
  // Experience fields - first two spinbuttons in the form
  private readonly experienceYearsInput = () => this.applicantDialog().getByRole('spinbutton').nth(0);
  private readonly experienceMonthsInput = () => this.applicantDialog().getByRole('spinbutton').nth(1);
  
  // Notice Period fields - spinbuttons come after experience fields
  // Experience has 2 spinbuttons (index 0, 1), Notice Period has 2 (index 2, 3)
  private readonly noticePeriodMonthsInput = () => this.applicantDialog().getByRole('spinbutton').nth(2);
  private readonly noticePeriodDaysInput = () => this.applicantDialog().getByRole('spinbutton').nth(3);
  
  // Salary fields
  private readonly currencyCombobox = () => this.applicantDialog().getByRole('combobox').filter({ hasText: 'INR' });
  private readonly currentSalaryInput = () => this.applicantDialog().getByPlaceholder('e.g., 1000000');
  private readonly expectedSalaryInput = () => this.applicantDialog().getByPlaceholder('e.g., 1200000');
  
  // Additional fields
  private readonly educationInput = () => this.applicantDialog().getByRole('textbox', { name: 'Education *' });
  private readonly workExperienceInput = () => this.applicantDialog().getByRole('textbox', { name: 'Work Experience *' });
  private readonly skillsInput = () => this.applicantDialog().getByRole('textbox', { name: 'Skills *' });
  
  private readonly submitButton = () => this.applicantDialog().getByRole('button', { name: 'Add Applicant' });
  private readonly cancelButton = () => this.applicantDialog().getByRole('button', { name: 'Cancel' });

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
    
    // Wait for auto-filled fields (Full Name and Email) to be populated
    // These fields are auto-parsed from the resume
    try {
      // Wait for Full Name field to have a value (with a reasonable timeout)
      await expect(this.fullNameInput()).toHaveValue(/.+/, { timeout: 20000 }).catch(() => {
        // If Full Name is not auto-filled, that's okay - it might be filled manually
      });
      
      // Wait for Email field to have a value (with a reasonable timeout)
      await expect(this.emailInput()).toHaveValue(/.+/, { timeout: 20000 }).catch(() => {
        // If Email is not auto-filled, that's okay - it might be filled manually
      });
    } catch (error) {
      // If fields are not auto-filled, continue anyway - they might be filled manually later
    }
    
    await this.wait(500);
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
   * @param phone Phone number (must not be empty)
   */
  async fillPhone(phone: string): Promise<void> {
    if (!phone || phone.trim() === '') {
      throw new Error('Phone number cannot be empty');
    }
    await expect(this.phoneInput()).toBeVisible();
    await this.phoneInput().clear();
    await this.phoneInput().fill(phone);
  }

  /**
   * Fill in experience (years and months)
   * @param years Number of years of experience (must not be empty)
   * @param months Number of months of experience (default: '0', must not be empty)
   */
  async fillExperience(years: string, months: string = '0'): Promise<void> {
    if (!years || years.trim() === '' || years === null || years === undefined) {
      throw new Error('Experience years cannot be empty');
    }
    if (!months || months.trim() === '' || months === null || months === undefined) {
      months = '0'; // Default to 0 if not provided
    }
    
    // Fill years using ID locator
    await expect(this.experienceYearsInput()).toBeVisible();
    await this.experienceYearsInput().clear();
    await this.experienceYearsInput().fill(years);
    
    // Fill months using ID locator
    await expect(this.experienceMonthsInput()).toBeVisible();
    await this.experienceMonthsInput().clear();
    await this.experienceMonthsInput().fill(months);
  }

  /**
   * Fill in notice period (months and days)
   * @param months Number of months (must not be empty)
   * @param days Number of days (default: '0', must not be empty)
   */
  async fillNoticePeriod(months: string, days: string = '0'): Promise<void> {
    if (!months || months.trim() === '' || months === null || months === undefined) {
      throw new Error('Notice period months cannot be empty');
    }
    if (!days || days.trim() === '' || days === null || days === undefined) {
      days = '0'; // Default to 0 if not provided
    }
    
    // Fill months using placeholder-based locator
    await expect(this.noticePeriodMonthsInput()).toBeVisible();
    await this.noticePeriodMonthsInput().clear();
    await this.noticePeriodMonthsInput().fill(months);
    
    // Fill days using placeholder-based locator
    await expect(this.noticePeriodDaysInput()).toBeVisible();
    await this.noticePeriodDaysInput().clear();
    await this.noticePeriodDaysInput().fill(days);
  }

  /**
   * Fill in current salary (annual, in full amount like 1000000)
   * @param salary Current salary amount (must not be empty)
   * @param currency Currency code (default: 'INR')
   */
  async fillCurrentSalary(salary: string, currency: string = 'INR'): Promise<void> {
    if (!salary || salary.trim() === '') {
      throw new Error('Current salary cannot be empty');
    }
    
    // Currency is pre-selected as INR, change if needed
    if (currency !== 'INR') {
      await this.currencyCombobox().click();
      await this.wait(300);
      const currencyOption = this.page.getByRole('option', { name: currency });
      await currencyOption.click();
      await this.wait(300);
    }
    
    await expect(this.currentSalaryInput()).toBeVisible();
    await this.currentSalaryInput().clear();
    await this.currentSalaryInput().fill(salary);
  }

  /**
   * Fill in expected salary (annual, in full amount like 1200000)
   * @param salary Expected salary amount (must not be empty)
   */
  async fillExpectedSalary(salary: string): Promise<void> {
    if (!salary || salary.trim() === '') {
      throw new Error('Expected salary cannot be empty');
    }
    await expect(this.expectedSalaryInput()).toBeVisible();
    await this.expectedSalaryInput().clear();
    await this.expectedSalaryInput().fill(salary);
  }

  /**
   * Fill in education details
   * @param education Education details string (must not be empty)
   */
  async fillEducation(education: string): Promise<void> {
    if (!education || education.trim() === '') {
      throw new Error('Education cannot be empty');
    }
    await expect(this.educationInput()).toBeVisible();
    await this.educationInput().clear();
    await this.educationInput().fill(education);
  }

  /**
   * Fill in work experience details
   * @param workExperience Work experience details string (must not be empty)
   */
  async fillWorkExperience(workExperience: string): Promise<void> {
    if (!workExperience || workExperience.trim() === '') {
      throw new Error('Work experience cannot be empty');
    }
    await expect(this.workExperienceInput()).toBeVisible();
    await this.workExperienceInput().clear();
    await this.workExperienceInput().fill(workExperience);
  }

  /**
   * Fill in skills
   * @param skills Skills as comma-separated string (e.g., "Java, Python") (must not be empty)
   */
  async fillSkills(skills: string): Promise<void> {
    if (!skills || skills.trim() === '') {
      throw new Error('Skills cannot be empty');
    }
    await expect(this.skillsInput()).toBeVisible();
    await this.skillsInput().clear();
    await this.skillsInput().fill(skills);
  }

  /**
   * Submit the applicant form
   */
  async submitApplicant(): Promise<void> {
    // Wait for submit button to be enabled
    await expect(this.submitButton()).toBeEnabled({ timeout: 20000 });
    
    // Wait for any loading states to complete before clicking
    await this.wait(500);
    
    // Click submit and wait for network request to complete
    const submitPromise = this.submitButton().click();
    
    // Wait for network to be idle after clicking submit (form submission)
    await Promise.all([
      submitPromise,
      this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
        // If networkidle times out, continue anyway
      })
    ]);
    
    // Wait a bit for the UI to update
    await this.wait(1000);
    
    // Wait for dialog to close after successful submission
    // Increase timeout and use a more flexible check
    try {
      await expect(this.applicantDialog()).not.toBeVisible({ timeout: 30000 });
    } catch (error) {
      // If dialog is still visible, check if submit button is disabled (indicating loading state)
      const isSubmitDisabled = await this.submitButton().isDisabled().catch(() => false);
      if (isSubmitDisabled) {
        // Button is disabled, might be in loading state - wait a bit more
        await this.wait(2000);
        await expect(this.applicantDialog()).not.toBeVisible({ timeout: 20000 });
      } else {
        // Check if there are any error messages visible in the dialog
        const errorMessages = this.applicantDialog().locator('text=/error|Error|required|Required|invalid|Invalid|validation|Validation/i');
        const errorCount = await errorMessages.count();
        
        if (errorCount > 0) {
          const errorTexts: string[] = [];
          for (let i = 0; i < errorCount; i++) {
            const text = await errorMessages.nth(i).textContent().catch(() => '');
            if (text) errorTexts.push(text);
          }
          throw new Error(`Form submission failed with errors: ${errorTexts.join(', ')}`);
        }
        
        // Check if required fields are empty (Full Name and Email)
        const fullNameValue = await this.fullNameInput().inputValue().catch(() => '');
        const emailValue = await this.emailInput().inputValue().catch(() => '');
        
        if (!fullNameValue || !emailValue) {
          throw new Error(`Form submission failed: Required fields are empty. Full Name: "${fullNameValue}", Email: "${emailValue}"`);
        }
        
        // Button is enabled but dialog didn't close - likely an error
        throw new Error('Dialog did not close after form submission. Form may have validation errors or the submission may have failed.');
      }
    }
    
    await this.wait(1000);
  }

  /**
   * Cancel the applicant form
   */
  async cancelApplicant(): Promise<void> {
    // If dropdown is open, close it first by pressing Escape or clicking outside
    const dialog = this.applicantDialog();
    const isDialogVisible = await dialog.isVisible().catch(() => false);
    
    if (isDialogVisible) {
      // Check if any dropdown/combobox is open by looking for visible options
      const visibleOptions = this.page.getByRole('option');
      const optionCount = await visibleOptions.count();
      
      if (optionCount > 0) {
        // Dropdown is open, press Escape to close it
        await this.page.keyboard.press('Escape');
        await this.wait(300);
      }
      
      // Wait for cancel button to be visible and enabled
      await expect(this.cancelButton()).toBeVisible({ timeout: 10000 });
      await expect(this.cancelButton()).toBeEnabled({ timeout: 10000 });
      
      await this.cancelButton().click();
      await this.wait(500);
    }
  }

  /**
   * Add a new applicant with all required details
   * Ensures ALL fields are filled - never leaves any box empty
   * @param applicantData Object containing all applicant data
   */
  async addApplicant(applicantData: {
    resumePath: string;
    phone: string;
    role: string;
    experienceYears: string;
    experienceMonths?: string;
    noticePeriodMonths: string;
    noticePeriodDays?: string;
    currentSalary: string;
    expectedSalary: string;
    education?: string;
    workExperience?: string;
    skills?: string;
    currency?: string;
  }): Promise<void> {
    await this.clickAddApplicant();
    await this.uploadResume(applicantData.resumePath);
    
    // Wait a bit for auto-filled fields to populate
    await this.wait(1000);
    
    await this.selectRole(applicantData.role);
    
    // Fill phone - ensure it's not empty
    await this.fillPhone(applicantData.phone);
    
    // Fill experience - ensure both years and months have values
    const experienceMonths = applicantData.experienceMonths ?? '0';
    await this.fillExperience(applicantData.experienceYears, experienceMonths);
    
    // Fill notice period - ensure both months and days have values
    const noticePeriodDays = applicantData.noticePeriodDays ?? '0';
    await this.fillNoticePeriod(applicantData.noticePeriodMonths, noticePeriodDays);
    
    // Fill salary fields
    await this.fillCurrentSalary(applicantData.currentSalary, applicantData.currency);
    await this.fillExpectedSalary(applicantData.expectedSalary);
    
    // ALWAYS fill optional fields - never leave them empty
    // Check if fields are already auto-filled, if not, fill them with provided or default values
    
    // Fill Education - check if already filled, if not use provided value or default
    const educationValue = applicantData.education || 'Bachelor\'s Degree in Computer Science';
    try {
      const currentEducation = await this.educationInput().inputValue();
      if (!currentEducation || currentEducation.trim() === '') {
        await this.fillEducation(educationValue);
      }
    } catch {
      await this.fillEducation(educationValue);
    }
    
    // Fill Work Experience - check if already filled, if not use provided value or default
    const workExperienceValue = applicantData.workExperience || 'Software Developer with experience in full-stack development';
    try {
      const currentWorkExp = await this.workExperienceInput().inputValue();
      if (!currentWorkExp || currentWorkExp.trim() === '') {
        await this.fillWorkExperience(workExperienceValue);
      }
    } catch {
      await this.fillWorkExperience(workExperienceValue);
    }
    
    // Fill Skills - check if already filled, if not use provided value or default
    const skillsValue = applicantData.skills || 'JavaScript, TypeScript, React, Node.js, Python, SQL';
    try {
      const currentSkills = await this.skillsInput().inputValue();
      if (!currentSkills || currentSkills.trim() === '') {
        await this.fillSkills(skillsValue);
      }
    } catch {
      await this.fillSkills(skillsValue);
    }
    
    // Verify all fields are filled before submission
    await this.verifyAllFieldsFilled();
    
    await this.submitApplicant();
  }

  /**
   * Verify that all form fields are filled (not empty)
   * Throws an error if any required field is empty
   */
  private async verifyAllFieldsFilled(): Promise<void> {
    // Check Full Name (auto-filled from resume, but verify)
    const fullName = await this.fullNameInput().inputValue().catch(() => '');
    if (!fullName || fullName.trim() === '') {
      throw new Error('Full Name field is empty');
    }
    
    // Check Email (auto-filled from resume, but verify)
    const email = await this.emailInput().inputValue().catch(() => '');
    if (!email || email.trim() === '') {
      throw new Error('Email field is empty');
    }
    
    // Check Phone
    const phone = await this.phoneInput().inputValue().catch(() => '');
    if (!phone || phone.trim() === '') {
      throw new Error('Phone field is empty');
    }
    
    // Check Experience Years
    const expYears = await this.experienceYearsInput().inputValue().catch(() => '');
    if (expYears === '' || expYears === null || expYears === undefined) {
      throw new Error('Experience Years field is empty');
    }
    
    // Check Experience Months
    const expMonths = await this.experienceMonthsInput().inputValue().catch(() => '');
    if (expMonths === '' || expMonths === null || expMonths === undefined) {
      throw new Error('Experience Months field is empty');
    }
    
    // Check Notice Period Months
    const noticeMonths = await this.noticePeriodMonthsInput().inputValue().catch(() => '');
    if (noticeMonths === '' || noticeMonths === null || noticeMonths === undefined) {
      throw new Error('Notice Period Months field is empty');
    }
    
    // Check Notice Period Days
    const noticeDays = await this.noticePeriodDaysInput().inputValue().catch(() => '');
    if (noticeDays === '' || noticeDays === null || noticeDays === undefined) {
      throw new Error('Notice Period Days field is empty');
    }
    
    // Check Current Salary
    const currentSalary = await this.currentSalaryInput().inputValue().catch(() => '');
    if (!currentSalary || currentSalary.trim() === '') {
      throw new Error('Current Salary field is empty');
    }
    
    // Check Expected Salary
    const expectedSalary = await this.expectedSalaryInput().inputValue().catch(() => '');
    if (!expectedSalary || expectedSalary.trim() === '') {
      throw new Error('Expected Salary field is empty');
    }
    
    // Check Education
    const education = await this.educationInput().inputValue().catch(() => '');
    if (!education || education.trim() === '') {
      throw new Error('Education field is empty');
    }
    
    // Check Work Experience
    const workExperience = await this.workExperienceInput().inputValue().catch(() => '');
    if (!workExperience || workExperience.trim() === '') {
      throw new Error('Work Experience field is empty');
    }
    
    // Check Skills
    const skills = await this.skillsInput().inputValue().catch(() => '');
    if (!skills || skills.trim() === '') {
      throw new Error('Skills field is empty');
    }
  }
}

