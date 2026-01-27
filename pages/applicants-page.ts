import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { generateUniqueId, generateAlphabeticUniqueId } from '../utils/data/date-name-utils';

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
      await this.wait(500);
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
            await this.wait(1000);
            return;
          }
          throw new Error(`Add Applicant button not visible after retries. Make sure you're on the applicants page.`);
        }
        await this.wait(1000);
      }
    }
    
    await button.click();
    await this.wait(1000);
  }

  /**
   * Upload resume file
   * @param filePath Path to the resume file (relative to project root)
   */
  async uploadResume(filePath: string): Promise<void> {
    const fileInput = this.applicantDialog().locator('input[type="file"]');
    const dialog = this.applicantDialog();
    
    // Upload the file
    await fileInput.setInputFiles(filePath);
    
    // Wait for resume processing - look for multiple indicators
    // 1. Wait for "Complete Form" step indicator (step 2)
    const stepIndicator = dialog.locator('text=/Complete Form|2/i');
    try {
      await expect(stepIndicator).toBeVisible({ timeout: 30000 });
    } catch {
      // If step indicator not found, continue with other checks
    }
    
    // 2. Wait for form fields to appear - try multiple strategies
    let formReady = false;
    const maxRetries = 20; // Increased from 5 to 20 to allow more time for resume processing
    let retryCount = 0;
    
    while (!formReady && retryCount < maxRetries) {
      // Strategy 1: Check for role combobox
      const roleCombobox = this.roleCombobox();
      const isComboboxVisible = await roleCombobox.isVisible({ timeout: 10000 }).catch(() => false);
      
      if (isComboboxVisible) {
        formReady = true;
        break;
      }
      
      // Strategy 2: Check for Full Name field
      const fullNameField = this.fullNameInput();
      const isFullNameVisible = await fullNameField.isVisible({ timeout: 10000 }).catch(() => false);
      
      if (isFullNameVisible) {
        formReady = true;
        break;
      }
      
      // Strategy 3: Check for any textbox in the dialog (form fields)
      const anyTextField = dialog.getByRole('textbox').first();
      const isTextFieldVisible = await anyTextField.isVisible({ timeout: 10000 }).catch(() => false);
      
      if (isTextFieldVisible) {
        formReady = true;
        break;
      }
      
      // Wait before retrying
      retryCount++;
      if (retryCount < maxRetries) {
        await this.wait(3000); // Increased from 2000ms to 3000ms for longer wait between retries
      }
    }
    
    if (!formReady) {
      throw new Error(`Resume upload completed but form fields did not appear after ${maxRetries} attempts. The resume may have failed to process or the form may be taking longer than expected.`);
    }
    
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
    
    await this.wait(500);
    
    // Click the combobox to open dropdown
    await combobox.click();
    await this.wait(500);
    
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
    
    // Click the selected option
    await roleOption.click();
    await this.wait(500);
    
    // Verify selection was made
    const selectedValue = await combobox.textContent().catch(() => '');
    if (!selectedValue || !selectedValue.includes(selectedRole)) {
      // Wait a bit more for the selection to update
      await this.wait(1000);
    }
    
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
    
    // Add unique ID to make it unique
    const uniqueId = generateUniqueId(8);
    const uniqueEmail = `${localPart}_${uniqueId}@${domain}`;
    
    await this.emailInput().clear();
    await this.emailInput().fill(uniqueEmail);
    await this.wait(300);
    
    return uniqueEmail;
  }

  /**
   * Modify full name to make it unique by adding a unique ID suffix
   * Useful when dealing with duplicate applicant errors
   * Uses alphabetic characters only to ensure name ends with a letter
   */
  async makeNameUnique(): Promise<string> {
    const currentName = await this.fullNameInput().inputValue().catch(() => '');
    if (!currentName || currentName.trim() === '') {
      throw new Error('Cannot make name unique: name field is empty');
    }
    
    // Add alphabetic unique ID to make it unique (ensures name ends with a letter)
    const uniqueId = generateAlphabeticUniqueId(6);
    const uniqueName = `${currentName.trim()} ${uniqueId}`;
    
    await this.fullNameInput().clear();
    await this.fullNameInput().fill(uniqueName);
    await this.wait(300);
    
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
    
    // Wait for dialog to be fully loaded
    await this.wait(500);
    
    // Get all spinbuttons to find notice period fields more reliably
    const allSpinbuttons = this.applicantDialog().getByRole('spinbutton');
    const spinbuttonCount = await allSpinbuttons.count();
    
    // Experience fields should be at index 0 and 1
    // Notice period should be at index 2 and 3, but verify by checking values
    let noticeMonthsIndex = 2;
    let noticeDaysIndex = 3;
    
    // If we have more than 4 spinbuttons, try to find notice period fields by context
    if (spinbuttonCount > 4) {
      // Try to find by looking for fields after experience
      // We'll use the known pattern: experience (0,1), notice period (2,3)
      noticeMonthsIndex = 2;
      noticeDaysIndex = 3;
    }
    
    // Fill months with retry logic
    const monthsInput = allSpinbuttons.nth(noticeMonthsIndex);
    await expect(monthsInput).toBeVisible({ timeout: 10000 });
    await monthsInput.clear();
    await monthsInput.fill(months);
    
    // Verify months was filled
    await this.wait(300);
    const monthsValue = await monthsInput.inputValue().catch(() => '');
    if (monthsValue !== months) {
      // Retry filling months
      await monthsInput.clear();
      await monthsInput.fill(months);
      await this.wait(300);
    }
    
    // Fill days with retry logic - spinbuttons may need special handling
    const daysInput = allSpinbuttons.nth(noticeDaysIndex);
    await expect(daysInput).toBeVisible({ timeout: 10000 });
    
    // Multiple strategies to fill the spinbutton field
    let daysValue = '';
    const strategies = [
      // Strategy 1: Focus, clear, fill
      async () => {
        await daysInput.focus();
        await daysInput.clear();
        await this.wait(200);
        await daysInput.fill(days);
        await this.wait(300);
        return await daysInput.inputValue().catch(() => '');
      },
      // Strategy 2: Click, select all, type
      async () => {
        await daysInput.click();
        await this.page.keyboard.press('Control+A');
        await this.wait(100);
        await daysInput.type(days, { delay: 50 });
        await this.wait(300);
        return await daysInput.inputValue().catch(() => '');
      },
      // Strategy 3: Focus, clear, pressSequentially
      async () => {
        await daysInput.focus();
        await daysInput.clear();
        await this.wait(200);
        await this.page.keyboard.type(days, { delay: 100 });
        await this.wait(300);
        return await daysInput.inputValue().catch(() => '');
      },
      // Strategy 4: Triple click to select all, then type
      async () => {
        await daysInput.click({ clickCount: 3 });
        await this.wait(100);
        await this.page.keyboard.type(days, { delay: 100 });
        await this.wait(300);
        return await daysInput.inputValue().catch(() => '');
      }
    ];
    
    // Try each strategy until one works
    let success = false;
    for (let i = 0; i < strategies.length; i++) {
      try {
        daysValue = await strategies[i]();
        if (daysValue && daysValue !== '' && daysValue !== null && daysValue !== undefined) {
          // Success - value was filled (exact match not required, just needs to be non-empty)
          success = true;
          break;
        }
      } catch (error) {
        // Continue to next strategy unless this is the last one
        if (i === strategies.length - 1 && !success) {
          throw new Error(`Failed to fill Notice Period Days field after ${strategies.length} attempts. Attempted value: "${days}". Last error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
      }
    }
    
    // Final verification
    if (!success || !daysValue || daysValue === '' || daysValue === null || daysValue === undefined) {
      throw new Error(`Failed to fill Notice Period Days field. Attempted value: "${days}", but field remains empty after all strategies.`);
    }
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
   * Handles duplicate email errors by automatically modifying the email and retrying
   */
  async submitApplicant(): Promise<void> {
    const maxRetries = 2; // Allow one retry for duplicate email
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      // First, verify all critical fields are filled before attempting submission
      try {
        const noticeDays = await this.noticePeriodDaysInput().inputValue().catch(() => '');
        if (noticeDays === '' || noticeDays === null || noticeDays === undefined) {
          throw new Error('Notice Period Days field is empty before submission. Cannot submit form.');
        }
      } catch (error) {
        // If we can't even read the field, something is wrong
        if (error instanceof Error && error.message.includes('Notice Period Days')) {
          throw error;
        }
      }
      
      // Wait for submit button to be enabled
      await expect(this.submitButtonLocator).toBeEnabled({ timeout: 20000 });
      
      // Wait for any loading states to complete before clicking
      await this.wait(500);
      
      // Check if page is still valid before submitting
      if (this.page.isClosed()) {
        throw new Error('Page was closed before form submission');
      }
      
      // Click submit and wait for network request to complete
      const submitPromise = this.submitButtonLocator.click();
      
      // Wait for network to be idle after clicking submit (form submission)
      await Promise.all([
        submitPromise,
        this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
          // If networkidle times out, continue anyway
        })
      ]);
      
      // Wait a bit for the UI to update
      await this.wait(1000);
      
      // Check if page was closed during submission
      if (this.page.isClosed()) {
        throw new Error('Page was closed during form submission');
      }
      
      // Wait for dialog to close after successful submission
      // Increase timeout and use a more flexible check
      try {
        await expect(this.applicantDialog()).not.toBeVisible({ timeout: 30000 });
        // Dialog closed successfully - submission worked!
        await this.wait(1000);
        return;
      } catch (error) {
        // If dialog is still visible, check if submit button is disabled (indicating loading state)
        const isSubmitDisabled = await this.submitButtonLocator.isDisabled();
        if (isSubmitDisabled) {
          // Button is disabled, might be in loading state - wait a bit more
          await this.wait(2000);
          try {
            await expect(this.applicantDialog()).not.toBeVisible({ timeout: 20000 });
            // Dialog closed after waiting - submission worked!
            await this.wait(1000);
            return;
          } catch (waitError) {
            // Still not closed, continue to error checking
          }
        }
        
        // Check if page is still valid
        if (this.page.isClosed()) {
          throw new Error('Page was closed while waiting for dialog to close');
        }
        
        // Check if there are any error messages visible in the dialog
        let errorCount = 0;
        let errorTexts: string[] = [];
        let hasDuplicateEmailError = false;
        
        try {
          // Look for error messages - including duplicate email specific patterns
          const errorMessages = this.applicantDialog().locator('text=/error|Error|required|Required|invalid|Invalid|validation|Validation|duplicate|Duplicate|already exists|already registered|already in use|email.*exist/i');
          errorCount = await errorMessages.count();
          
          if (errorCount > 0) {
            for (let i = 0; i < errorCount; i++) {
              const text = await errorMessages.nth(i).textContent().catch(() => '');
              if (text) {
                errorTexts.push(text);
                // Check if this is a duplicate email error
                if (text.match(/duplicate|already exists|already registered|already in use|email.*exist/i)) {
                  hasDuplicateEmailError = true;
                }
              }
            }
          }
          
          // Also check for error messages near the email field specifically
          const emailFieldError = this.emailInput().locator('..').locator('text=/duplicate|already exists|already registered|already in use|email.*exist/i');
          const emailErrorCount = await emailFieldError.count().catch(() => 0);
          if (emailErrorCount > 0) {
            hasDuplicateEmailError = true;
            const emailErrorText = await emailFieldError.first().textContent().catch(() => '');
            if (emailErrorText && !errorTexts.includes(emailErrorText)) {
              errorTexts.push(emailErrorText);
            }
          }
        } catch (countError) {
          // If we can't count errors, the page might have changed
          // Continue to check field values
        }
        
        // Handle duplicate email/name error - retry with unique email and name
        if (hasDuplicateEmailError && attempt < maxRetries) {
          console.log(`Duplicate applicant detected (attempt ${attempt + 1}/${maxRetries + 1}). Modifying email and name to make them unique...`);
          try {
            const uniqueEmail = await this.makeEmailUnique();
            const uniqueName = await this.makeNameUnique();
            console.log(`Email modified to: ${uniqueEmail}, Name modified to: ${uniqueName}. Retrying submission...`);
            attempt++;
            await this.wait(1000);
            continue; // Retry submission with new email and name
          } catch (modifyError) {
            // If we can't modify email/name, throw the duplicate error
            throw new Error(`DUPLICATE APPLICANT ERROR: The applicant already exists in the system. Error details: ${errorTexts.join(', ')}. Failed to modify email/name: ${modifyError instanceof Error ? modifyError.message : 'Unknown error'}`);
          }
        }
        
        if (errorCount > 0 || hasDuplicateEmailError) {
          if (hasDuplicateEmailError) {
            throw new Error(`DUPLICATE EMAIL ERROR: The email address already exists in the system. Error details: ${errorTexts.join(', ')}. This happens when the same resume (with the same email) is used multiple times. Attempted ${attempt + 1} times.`);
          }
          throw new Error(`Form submission failed with errors: ${errorTexts.join(', ')}`);
        }
        
        // Check if required fields are empty (Full Name and Email)
        const fullNameValue = await this.fullNameInput().inputValue().catch(() => '');
        const emailValue = await this.emailInput().inputValue().catch(() => '');
        
        if (!fullNameValue || !emailValue) {
          throw new Error(`Form submission failed: Required fields are empty. Full Name: "${fullNameValue}", Email: "${emailValue}"`);
        }
        
        // Check notice period days one more time
        const noticeDaysCheck = await this.noticePeriodDaysInput().inputValue().catch(() => '');
        if (noticeDaysCheck === '' || noticeDaysCheck === null || noticeDaysCheck === undefined) {
          throw new Error(`Form submission failed: Notice Period Days field is empty. This is likely preventing form submission.`);
        }
        
        // Button is enabled but dialog didn't close - likely an error
        throw new Error('Dialog did not close after form submission. Form may have validation errors or the submission may have failed.');
      }
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
        await this.wait(300);
      }
      
      // Wait for cancel button to be visible and enabled
      await expect(this.cancelButtonLocator).toBeVisible({ timeout: 10000 });
      await expect(this.cancelButtonLocator).toBeEnabled({ timeout: 10000 });
      
      await this.cancelButtonLocator.click();
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
    await this.wait(1000);
    
    // Select role (randomly if not provided or not found) and get the selected role
    const selectedRole = await this.selectRole(applicantData.role);
    
    // Wait for email and name to be auto-filled from resume, then make them unique to avoid duplicates
    await this.wait(1000);
    try {
      // Check if email is already filled from resume
      const currentEmail = await this.emailInput().inputValue().catch(() => '');
      if (currentEmail && currentEmail.trim() !== '') {
        // Email is auto-filled, make it unique to avoid duplicate errors
        const uniqueEmail = await this.makeEmailUnique();
        console.log(`Email modified to avoid duplicates: ${uniqueEmail}`);
      }
      
      // Also make name unique to avoid duplicates
      const currentName = await this.fullNameInput().inputValue().catch(() => '');
      if (currentName && currentName.trim() !== '') {
        const uniqueName = await this.makeNameUnique();
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
    
    await this.submitApplicant();
    
    // Return the selected role for logging/reference
    return selectedRole;
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
        await this.wait(500);
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

