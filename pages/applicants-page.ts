import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { getReadableEmailSuffix, getReadableShortDateSuffix } from '../utils/data/date-name-utils';

/**
 * Applicants Page Object Model
 * Handles all applicant-related interactions.
 */
export class ApplicantsPage extends BasePage {
  // ============ Locators ============

  /**
   * Add Applicant button
   */
  private get addApplicantButtonLocator(): Locator {
    return this.page.getByRole('button', { name: 'Add Applicant' });
  }

  /**
   * Submit button
   */
  private get submitButtonLocator(): Locator {
    return this.applicantDialog().getByRole('button', { name: 'Add Applicant' });
  }

  /**
   * Cancel button
   */
  private get cancelButtonLocator(): Locator {
    return this.applicantDialog().getByRole('button', { name: 'Cancel' });
  }

  // Legacy locators for form fields (still using traditional approach for complex forms)
  private readonly addApplicantButton = () => this.page.getByRole('button', { name: 'Add Applicant' });
  private readonly uploadArea = () => this.page.getByText('Click to upload or drag and');
  private readonly applicantDialog = () => this.page.getByRole('dialog', { name: 'Add New Applicant' });
  
  // Form field locators
  private readonly fullNameInput = () => this.applicantDialog().getByRole('textbox', { name: 'Full Name *' });
  private readonly emailInput = () => this.applicantDialog().getByRole('textbox', { name: 'Email *' });
  private readonly phoneInput = () => this.applicantDialog().getByRole('textbox', { name: 'Phone *' });
  private readonly roleCombobox = () => {
    // Find the role combobox - it's the first combobox in the form (before currency combobox)
    // Located near "Applied For Position" label
    const dialog = this.applicantDialog();
    // The role combobox is the first combobox in the dialog (currency is second)
    return dialog.getByRole('combobox').first();
  };
  
  // Experience fields - first two spinbuttons in the form
  private readonly experienceYearsInput = () => this.applicantDialog().getByRole('spinbutton').nth(0);
  private readonly experienceMonthsInput = () => this.applicantDialog().getByRole('spinbutton').nth(1);
  
  // Notice Period fields - use nth() but with better error handling in fillNoticePeriod
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
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // Continue even if networkidle times out
    });
    
    // Verify we're on the applicants page by checking for page heading
    // This is more reliable than URL checking
    const applicantsHeading = this.page.getByRole('heading', { name: 'Applicants' });
    await expect(applicantsHeading).toBeVisible({ timeout: 10000 }).catch(() => {
      throw new Error('Not on applicants page: "Applicants" heading not found');
    });
    
    // Wait for any dialogs to close if they're open
    const dialog = this.applicantDialog();
    const isDialogOpen = await dialog.isVisible().catch(() => false);
    if (isDialogOpen) {
      // Dialog is already open, close it first
      await this.cancelApplicant();
      await expect(dialog).toBeHidden({ timeout: 5000 }).catch(() => {});
    }
    
    // Find the button on the main page (not in dialog)
    // Use locator that finds button outside of dialog
    const allAddButtons = this.page.getByRole('button', { name: 'Add Applicant' });
    const buttonCount = await allAddButtons.count();
    
    let button;
    if (buttonCount > 1) {
      // Multiple buttons found - get the one that's not in the dialog
      // The first one should be the main page button
      button = allAddButtons.first();
    } else {
      button = allAddButtons;
    }
    
    // Wait for button to be visible with retry
    let retries = 3;
    while (retries > 0) {
      try {
        await expect(button).toBeVisible({ timeout: 5000 });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          // Try alternative locator strategy - look for button with icon and text
          const altButton = this.page.locator('button').filter({ hasText: 'Add Applicant' }).first();
          const isAltVisible = await altButton.isVisible({ timeout: 2000 }).catch(() => false);
          if (isAltVisible) {
            await altButton.click();
            await expect(this.applicantDialog()).toBeVisible({ timeout: 10000 }).catch(() => {});
            return;
          }
          throw new Error(`Add Applicant button not visible after retries. Make sure you're on the applicants page.`);
        }
        await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
      }
    }

    await button.click();
    await expect(this.applicantDialog()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Upload resume file and wait for form to be ready.
   * @param filePath Path to the resume file (relative to project root)
   */
  async uploadResume(filePath: string): Promise<void> {
    const fileInput = this.applicantDialog().locator('input[type="file"]');
    const dialog = this.applicantDialog();

    await fileInput.setInputFiles(filePath);

    const stepIndicator = dialog.locator('text=/Complete Form|2/i');
    try {
      await expect(stepIndicator).toBeVisible({ timeout: 30000 });
    } catch {
      // step indicator optional
    }

    const formReady = await this.waitForFormFieldsReady(
      [
        () => this.roleCombobox().isVisible({ timeout: 10000 }).then(() => true).catch(() => false),
        () => this.fullNameInput().isVisible({ timeout: 10000 }).then(() => true).catch(() => false),
        () => dialog.getByRole('textbox').first().isVisible({ timeout: 10000 }).then(() => true).catch(() => false),
      ],
      { maxRetries: 8, retryDelayMs: 2000 }
    );

    if (!formReady) {
      throw new Error('Resume upload completed but form fields did not appear after 8 attempts. The resume may have failed to process or the form may be taking longer than expected.');
    }

    try {
      await expect(this.fullNameInput()).toHaveValue(/.+/, { timeout: 20000 }).catch(() => {});
      await expect(this.emailInput()).toHaveValue(/.+/, { timeout: 20000 }).catch(() => {});
    } catch {
      // auto-filled fields optional
    }
  }

  /**
   * Select role from dropdown
   * If role is not provided or not found, randomly selects any available role
   * @param role Optional role name (e.g., "Full Stack Developer"). If not provided or not found, selects a random role
   * @returns The selected role name
   */
  async selectRole(role?: string): Promise<string> {
    // Wait for dialog to be fully ready
    await expect(this.applicantDialog()).toBeVisible({ timeout: 10000 });
    
    // Wait for combobox to be visible and ready - try multiple locator strategies
    let combobox = this.roleCombobox();
    let isVisible = await combobox.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!isVisible) {
      // Try alternative: find combobox by label context
      const dialog = this.applicantDialog();
      const labelDiv = dialog.locator('div').filter({ hasText: /Applied For Position/i });
      combobox = labelDiv.getByRole('combobox').first();
      isVisible = await combobox.isVisible({ timeout: 5000 }).catch(() => false);
    }
    
    if (!isVisible) {
      throw new Error('Role combobox not found after resume upload');
    }

    await combobox.click();

    // Wait for listbox to be visible before searching for options
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible({ timeout: 10000 });
    
    // Wait for at least one option to be visible (ensures dropdown is fully loaded)
    const firstOption = listbox.getByRole('option').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    
    // Get all available options
    const allOptions = listbox.getByRole('option');
    const optionCount = await allOptions.count();
    
    if (optionCount === 0) {
      throw new Error('No roles available in dropdown');
    }
    
    let selectedRole: string;
    let roleOption;
    
    // If role is provided, try to find it
    if (role) {
      roleOption = listbox.getByRole('option', { name: role, exact: false });
      const optionExists = await roleOption.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (optionExists) {
        // Role found, use it
        selectedRole = role;
      } else {
        // Role not found, select random role
        const randomIndex = Math.floor(Math.random() * optionCount);
        roleOption = allOptions.nth(randomIndex);
        const roleText = await roleOption.textContent();
        selectedRole = roleText ? roleText.trim() : '';
        console.log(`Role "${role}" not found. Randomly selected: "${selectedRole}"`);
      }
    } else {
      // No role provided, select random role
      const randomIndex = Math.floor(Math.random() * optionCount);
      roleOption = allOptions.nth(randomIndex);
      const roleText = await roleOption.textContent();
      selectedRole = roleText ? roleText.trim() : '';
      console.log(`No role specified. Randomly selected: "${selectedRole}"`);
    }
    
    if (!selectedRole) {
      throw new Error('Failed to get role text from selected option');
    }
    
    await roleOption.click();
    await expect(combobox).toContainText(selectedRole, { timeout: 5000 }).catch(() => {});

    return selectedRole;
  }

  /**
   * Fill in phone number
   * @param phone Phone number (must not be empty)
   */
  async fillPhone(phone: string): Promise<void> {
    if (!phone || phone.trim() === '') {
      throw new Error('Phone number cannot be empty');
    }
    
    // Check if page is still valid
    if (this.page.isClosed()) {
      throw new Error('Page was closed before filling phone number');
    }
    
    // Wait for dialog to be visible first
    await expect(this.applicantDialog()).toBeVisible({ timeout: 10000 });
    
    await expect(this.phoneInput()).toBeVisible({ timeout: 10000 });
    await this.phoneInput().clear();
    await this.phoneInput().fill(phone);
  }

  /**
   * Fill or modify email address
   * If email is auto-filled from resume and might be duplicate, this can modify it
   * @param email Email address (optional - if not provided, will use auto-filled value)
   */
  async fillEmail(email?: string): Promise<void> {
    await expect(this.emailInput()).toBeVisible();
    
    if (email) {
      // If email is provided, use it
      await this.emailInput().clear();
      await this.emailInput().fill(email);
    } else {
      // If no email provided, check if field is already filled (from resume)
      const currentEmail = await this.emailInput().inputValue().catch(() => '');
      if (!currentEmail || currentEmail.trim() === '') {
        throw new Error('Email field is empty and no email was provided');
      }
      // Email is already filled from resume, keep it
    }
  }

  /**
   * Modify email to make it unique by adding a timestamp suffix
   * Useful when dealing with duplicate email errors
   */
  async makeEmailUnique(): Promise<string> {
    const currentEmail = await this.emailInput().inputValue().catch(() => '');
    if (!currentEmail || currentEmail.trim() === '') {
      throw new Error('Cannot make email unique: email field is empty');
    }
    
    // Extract email parts
    const [localPart, domain] = currentEmail.split('@');
    if (!domain) {
      throw new Error(`Invalid email format: ${currentEmail}`);
    }
    
    // Add presentable plus-addressing suffix to make it unique
    const suffix = getReadableEmailSuffix();
    const uniqueEmail = `${localPart}${suffix}@${domain}`;
    
    await this.emailInput().clear();
    await this.emailInput().fill(uniqueEmail);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    
    return uniqueEmail;
  }

  /**
   * Modify full name to make it unique by adding a presentable date suffix
   * Useful when dealing with duplicate applicant errors
   */
  async makeNameUnique(): Promise<string> {
    const currentName = await this.fullNameInput().inputValue().catch(() => '');
    if (!currentName || currentName.trim() === '') {
      throw new Error('Cannot make name unique: name field is empty');
    }
    
    const dateSuffix = getReadableShortDateSuffix();
    const uniqueName = `${currentName.trim()} (${dateSuffix})`;
    
    await this.fullNameInput().clear();
    await this.fullNameInput().fill(uniqueName);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
    
    return uniqueName;
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
    
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});

    const allSpinbuttons = this.applicantDialog().getByRole('spinbutton');
    const noticeMonthsIndex = 2;
    const noticeDaysIndex = 3;

    const monthsInput = allSpinbuttons.nth(noticeMonthsIndex);
    await expect(monthsInput).toBeVisible({ timeout: 10000 });
    await monthsInput.clear();
    await monthsInput.fill(months);
    const monthsValue = await monthsInput.inputValue().catch(() => '');
    if (monthsValue !== months) {
      await monthsInput.clear();
      await monthsInput.fill(months);
    }

    const daysInput = allSpinbuttons.nth(noticeDaysIndex);
    await this.fillSpinbuttonWithRetry(daysInput, days);
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
      await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
      const currencyOption = this.page.getByRole('option', { name: currency });
      await currencyOption.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
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

  /** Verify notice period and page state before submit. */
  private async verifyFormFieldsBeforeSubmit(): Promise<void> {
    const noticeDays = await this.noticePeriodDaysInput().inputValue().catch(() => '');
    if (noticeDays === '' || noticeDays === null || noticeDays === undefined) {
      throw new Error('Notice Period Days field is empty before submission. Cannot submit form.');
    }
    if (this.page.isClosed()) {
      throw new Error('Page was closed before form submission');
    }
  }

  /** Click submit and wait for dialog to close or loading state. Returns true if dialog closed. */
  private async waitForSubmissionComplete(): Promise<boolean> {
    await expect(this.submitButtonLocator).toBeEnabled({ timeout: 20000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    const submitPromise = this.submitButtonLocator.click();
    await Promise.all([
      submitPromise,
      this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {})
    ]);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    if (this.page.isClosed()) throw new Error('Page was closed during form submission');
    try {
      await expect(this.applicantDialog()).not.toBeVisible({ timeout: 30000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
      return true;
    } catch {
      const isSubmitDisabled = await this.submitButtonLocator.isDisabled();
      if (isSubmitDisabled) {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
        try {
          await expect(this.applicantDialog()).not.toBeVisible({ timeout: 20000 });
          await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
          return true;
        } catch {
          // fall through to error detection
        }
      }
      return false;
    }
  }

  /** Detect duplicate-email/validation errors and return { hasDuplicateEmailError, errorTexts, errorCount }. */
  private async getSubmissionErrors(): Promise<{ hasDuplicateEmailError: boolean; errorTexts: string[]; errorCount: number }> {
    let errorCount = 0;
    const errorTexts: string[] = [];
    let hasDuplicateEmailError = false;
    try {
      const errorMessages = this.applicantDialog().locator('text=/error|Error|required|Required|invalid|Invalid|validation|Validation|duplicate|Duplicate|already exists|already registered|already in use|email.*exist/i');
      errorCount = await errorMessages.count();
      for (let i = 0; i < errorCount; i++) {
        const text = await errorMessages.nth(i).textContent().catch(() => '');
        if (text) {
          errorTexts.push(text);
          if (text.match(/duplicate|already exists|already registered|already in use|email.*exist/i)) hasDuplicateEmailError = true;
        }
      }
      const emailFieldError = this.emailInput().locator('..').locator('text=/duplicate|already exists|already registered|already in use|email.*exist/i');
      if ((await emailFieldError.count().catch(() => 0)) > 0) {
        hasDuplicateEmailError = true;
        const t = await emailFieldError.first().textContent().catch(() => '');
        if (t && !errorTexts.includes(t)) errorTexts.push(t);
      }
    } catch {
      // ignore
    }
    return { hasDuplicateEmailError, errorTexts, errorCount };
  }

  /**
   * Submit the applicant form
   * Handles duplicate email errors by automatically modifying the email and retrying
   */
  async submitApplicant(): Promise<void> {
    const maxRetries = 2;
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        await this.verifyFormFieldsBeforeSubmit();
      } catch (err) {
        if (err instanceof Error && err.message.includes('Notice Period Days')) throw err;
      }
      const closed = await this.waitForSubmissionComplete();
      if (closed) return;
      if (this.page.isClosed()) throw new Error('Page was closed while waiting for dialog to close');
      const { hasDuplicateEmailError, errorTexts, errorCount } = await this.getSubmissionErrors();
      if (hasDuplicateEmailError && attempt < maxRetries) {
        console.log(`Duplicate applicant detected (attempt ${attempt + 1}/${maxRetries + 1}). Modifying email and name...`);
        try {
          await this.makeEmailUnique();
          await this.makeNameUnique();
          attempt++;
          await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
          continue;
        } catch (modifyError) {
          throw new Error(`DUPLICATE APPLICANT ERROR: ${errorTexts.join(', ')}. Failed to modify: ${modifyError instanceof Error ? modifyError.message : 'Unknown'}`);
        }
      }
      if (errorCount > 0 || hasDuplicateEmailError) {
        if (hasDuplicateEmailError) throw new Error(`DUPLICATE EMAIL ERROR: ${errorTexts.join(', ')}. Attempted ${attempt + 1} times.`);
        throw new Error(`Form submission failed: ${errorTexts.join(', ')}`);
      }
      const fullNameValue = await this.fullNameInput().inputValue().catch(() => '');
      const emailValue = await this.emailInput().inputValue().catch(() => '');
      if (!fullNameValue || !emailValue) {
        throw new Error(`Form submission failed: Required fields empty. Full Name: "${fullNameValue}", Email: "${emailValue}"`);
      }
      const noticeDaysCheck = await this.noticePeriodDaysInput().inputValue().catch(() => '');
      if (noticeDaysCheck === '' || noticeDaysCheck === null || noticeDaysCheck === undefined) {
        throw new Error('Form submission failed: Notice Period Days field is empty.');
      }
      throw new Error('Dialog did not close after form submission. Form may have validation errors or the submission may have failed.');
    }
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
        await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
      }
      
      // Wait for cancel button to be visible and enabled
      await expect(this.cancelButtonLocator).toBeVisible({ timeout: 10000 });
      await expect(this.cancelButtonLocator).toBeEnabled({ timeout: 10000 });
      
      await this.cancelButtonLocator.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
    }
  }

  /**
   * Get the email of the last created applicant
   * Returns email from the form before it closes
   */
  async getLastCreatedApplicantEmail(): Promise<string | null> {
    try {
      // Try to get email from the form before dialog closes
      const email = await this.emailInput().inputValue().catch(() => null);
      if (email && email.trim() !== '') {
        return email.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Delete an applicant by name or email
   * Navigates to applicants list, finds the applicant by identifier, and deletes it
   */
  async deleteApplicantByIdentifier(identifier: string): Promise<void> {
    try {
      // Ensure we're on the applicants page
      const applicantsHeading = this.page.getByRole('heading', { name: 'Applicants' });
      const isOnApplicantsPage = await applicantsHeading.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!isOnApplicantsPage) {
        // Navigate to applicants page - try to find the applicants button
        const applicantsButton = this.page.locator('button[title="Applicants"]');
        if (await applicantsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await applicantsButton.click();
          await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
        }
      }
      
      // Wait for the list to load
      await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
      
      // Find the row containing the applicant (by name or email)
      // Try multiple strategies to find the row
      let applicantRow = this.page.getByRole('row').filter({ hasText: new RegExp(identifier, 'i') }).first();
      
      // If not found by row, try finding by text and then locating the row
      if (!(await applicantRow.isVisible({ timeout: 2000 }).catch(() => false))) {
        const identifierElement = this.page.getByText(new RegExp(identifier, 'i')).first();
        if (await identifierElement.isVisible({ timeout: 2000 }).catch(() => false)) {
          applicantRow = identifierElement.locator('..').locator('..').getByRole('row').first();
        }
      }
      
      const isRowVisible = await applicantRow.isVisible({ timeout: 3000 }).catch(() => false);
      if (!isRowVisible) {
        console.warn(`Applicant with identifier "${identifier}" not found for deletion`);
        return;
      }
      await this.deleteRowWithConfirmation(applicantRow, identifier);
      console.log(`Successfully deleted applicant: "${identifier}"`);
    } catch (error) {
      console.warn(`Failed to delete applicant "${identifier}":`, error);
      // Don't throw - cleanup failures shouldn't fail tests
    }
  }

  /**
   * Add a new applicant with all required details
   * Ensures ALL fields are filled - never leaves any box empty
   * @param applicantData Object containing all applicant data
   * @returns Identifier (email if available, otherwise name) for tracking and cleanup
   */
  async addApplicant(applicantData: {
    resumePath: string;
    phone: string;
    role?: string;
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
  }): Promise<string> {
    await this.clickAddApplicant();
    await this.uploadResume(applicantData.resumePath);
    
    // Wait a bit for auto-filled fields to populate
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    
    // Select role (randomly if not provided or not found) and get the selected role
    const selectedRole = await this.selectRole(applicantData.role);
    
    // Wait for email and name to be auto-filled from resume, then make them unique to avoid duplicates
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});
    let finalEmail: string | null = null;
    let finalName: string | null = null;
    
    try {
      // Check if email is already filled from resume
      const currentEmail = await this.emailInput().inputValue().catch(() => '');
      if (currentEmail && currentEmail.trim() !== '') {
        // Email is auto-filled, make it unique to avoid duplicate errors
        const uniqueEmail = await this.makeEmailUnique();
        finalEmail = uniqueEmail;
        console.log(`Email modified to avoid duplicates: ${uniqueEmail}`);
      }
      
      // Also make name unique to avoid duplicates
      const currentName = await this.fullNameInput().inputValue().catch(() => '');
      if (currentName && currentName.trim() !== '') {
        const uniqueName = await this.makeNameUnique();
        finalName = uniqueName;
        console.log(`Name modified to avoid duplicates: ${uniqueName}`);
      }
    } catch (error) {
      // If we can't modify email/name, continue - it might work anyway
      console.log('Could not modify email/name for uniqueness, continuing...');
    }
    
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
    
    // Get email and name before submission (for tracking)
    if (!finalEmail) {
      finalEmail = await this.emailInput().inputValue().catch(() => null);
    }
    if (!finalName) {
      finalName = await this.fullNameInput().inputValue().catch(() => null);
    }
    
    await this.submitApplicant();
    
    // Return email if available, otherwise name, otherwise fallback
    return finalEmail || finalName || 'Unknown Applicant';
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
    
    // Check Notice Period Days - with retry logic
    let noticeDays = '';
    let retries = 3;
    while (retries > 0 && (noticeDays === '' || noticeDays === null || noticeDays === undefined)) {
      try {
        // Try to get all spinbuttons and find the notice period days field
        const allSpinbuttons = this.applicantDialog().getByRole('spinbutton');
        const spinbuttonCount = await allSpinbuttons.count();
        
        if (spinbuttonCount >= 4) {
          // Notice period days should be at index 3
          noticeDays = await allSpinbuttons.nth(3).inputValue().catch(() => '');
        } else {
          // Fallback to original locator
          noticeDays = await this.noticePeriodDaysInput().inputValue().catch(() => '');
        }
        
        if (noticeDays !== '' && noticeDays !== null && noticeDays !== undefined) {
          break;
        }
      } catch (error) {
        // Continue to retry
      }
      
      retries--;
      if (retries > 0) {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
      }
    }
    
    if (noticeDays === '' || noticeDays === null || noticeDays === undefined) {
      throw new Error('Notice Period Days field is empty after retries. The field may not be properly filled or the locator is incorrect.');
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

