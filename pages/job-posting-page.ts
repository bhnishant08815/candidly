import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Job Posting Page Object Model
 * Handles all job posting creation and management interactions
 */
export class JobPostingPage extends BasePage {
  // Locators
  private readonly addNewJobButton = () => this.page.getByText('Add New Job', { exact: true });
  private readonly jobTitleInput = () => this.page.getByRole('textbox', { name: 'Job Title *' });
  private readonly openPositionsInput = () => this.page.getByRole('spinbutton', { name: 'Open Positions Count *' });
  private readonly roleSummaryInput = () => this.page.getByRole('textbox', { name: 'Role Summary *' });
  private readonly responsibilityInput = () => this.page.getByRole('textbox', { name: 'Add a responsibility' });
  private readonly qualificationInput = () => this.page.getByRole('textbox', { name: 'Add a qualification' });
  private readonly skillInput = () => this.page.getByRole('textbox', { name: 'Add a skill' });
  private readonly compensationInput = () => this.page.getByRole('textbox', { name: 'Compensation and Benefits *' });
  private readonly continueButton = () => this.page.getByRole('button', { name: 'Continue' });
  private readonly reviewButton = () => this.page.getByRole('button', { name: 'Review' });
  private readonly saveAsDraftButton = () => this.page.getByText(/Save as Draft/i);
  private readonly aiPoweredButton = () => this.page.getByRole('button', { name: /AI-Powered/i });
  private readonly documentUploadExtractButton = () => this.page.getByRole('button', { name: /Document Upload/i });
  private readonly manualEntryButton = () => this.page.getByRole('button', { name: /Manual Entry/i });

  // Complex locators
  private readonly addResponsibilityButton = () => this.page.locator("//body/div[@role='dialog']/div/div/div/div/div/div/button[1]");
  private readonly addQualificationButton = () => this.page.locator("//body//div[@role='dialog']//div//div//div//div[1]//div[1]//div[1]//button[1]");
  private readonly addSkillButton = () => this.page.locator("//body/div[@role='dialog']/div/div/div/div/div[2]/div[1]/div[1]/button[1]");
  private readonly complexButton = () => this.page.locator("//button[@class='group relative p-3 rounded-lg border-2 transition-all duration-300 text-left overflow-hidden border-border hover:border-amber-500/50 hover:bg-gradient-to-br hover:from-amber-500/5 hover:to-orange-500/5 hover:shadow-md hover:transform hover:scale-101']//div[@class='relative flex flex-col items-center text-center space-y-2']");

  constructor(page: Page) {
    super(page);
  }

  /**
   * Click on Add New Job button
   */
  async clickAddNewJob(): Promise<void> {
    const button = this.addNewJobButton();
    await expect(button).toBeVisible({ timeout: 10000 });
    await expect(button).toBeEnabled();
    await button.click();
    // Wait for the dialog to appear
    const dialog = this.page.getByRole('dialog', { name: 'Add New Job Posting' });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await this.wait(500);
  }

  /**
   * Fill in job title
   * @param title Job title
   */
  async fillJobTitle(title: string): Promise<void> {
    await expect(this.jobTitleInput()).toBeVisible();
    await this.jobTitleInput().fill(title);
  }

  /**
   * Generic method to select an option from a combobox in the dialog
   * @param comboboxIndex Index of the combobox (0-based, e.g., 0 for first, 1 for second)
   * @param optionText Text of the option to select
   * @param useExactMatch Whether to use exact text match (default: false, uses contains)
   */
  private async selectComboboxOption(
    comboboxIndex: number,
    optionText: string,
    useExactMatch: boolean = false
  ): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Add New Job Posting' });
    const combobox = dialog.getByRole('combobox').nth(comboboxIndex);
    
    await expect(combobox).toBeVisible();
    await expect(combobox).toBeEnabled();
    await combobox.click();
    
    // Wait for the dropdown options to appear - try to find any option first
    try {
      // Wait for at least one option to appear (indicates dropdown is open)
      await this.page.waitForSelector('[role="option"]', { timeout: 5000 }).catch(() => {
        // If role="option" doesn't work, try waiting for span elements
        return this.page.waitForSelector('span:has-text("' + optionText + '")', { timeout: 5000 });
      });
    } catch {
      // If neither works, just wait a bit
      await this.wait(500);
    }
    
    // Try using getByRole('option') first (more reliable)
    let option = this.page.getByRole('option', { name: optionText, exact: useExactMatch });
    
    // Check if option is visible
    const isOptionVisible = await option.isVisible().catch(() => false);
    if (!isOptionVisible) {
      // Fallback to text-based locator
      option = useExactMatch
        ? this.page.getByText(optionText, { exact: true })
        : this.page.locator(`span:has-text("${optionText}")`).first();
    }
    
    await expect(option).toBeVisible({ timeout: 5000 });
    await expect(option).toBeEnabled();
    await option.click();
    await this.wait(500);
  }

  /**
   * Select department
   * @param department Department name (e.g., "Engineering")
   */
  async selectDepartment(department: string): Promise<void> {
    await this.selectComboboxOption(0, department);
  }

  /**
   * Select experience level
   * @param level Experience level (e.g., "Senior (5-7 years)")
   */
  async selectExperienceLevel(level: string): Promise<void> {
    await this.selectComboboxOption(1, level);
  }

  /**
   * Select employment type
   * @param type Employment type (e.g., "Full-Time")
   */
  async selectEmploymentType(type: string): Promise<void> {
    await this.selectComboboxOption(2, type, true);
  }

  /**
   * Fill in open positions count
   * @param count Number of open positions
   */
  async fillOpenPositions(count: string): Promise<void> {
    const input = this.openPositionsInput();
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    // Clear any existing value first
    await input.clear();
    await input.fill(count);
    // Wait a bit for the value to be set
    await this.wait(300);
  }

  /**
   * Click Continue button to proceed to next step
   */
  async clickContinue(): Promise<void> {
    const button = this.continueButton();
    await expect(button).toBeVisible();
    // Wait for button to be enabled (form validation might disable it)
    await expect(button).toBeEnabled({ timeout: 10000 });
    await button.click();
    // Wait for the next step to load
    await this.wait(1000);
  }

  /**
   * Click on the complex button (appears to be a location/type selector)
   * This button appears on the second step of the form
   * Note: This may not always be required - the method will gracefully skip if button is not found
   */
  async clickComplexButton(): Promise<void> {
    try {
      // Wait for the button to appear (it's on the next step after Continue)
      const button = this.complexButton();
      const isVisible = await button.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(button).toBeEnabled({ timeout: 5000 });
        await button.click();
        await this.wait(500);
      } else {
        // Button not found - might not be required for this flow
        // Try waiting a bit more in case it's still loading
        await this.page.waitForTimeout(500);
        const isVisibleAfterWait = await button.isVisible().catch(() => false);
        if (isVisibleAfterWait) {
          await expect(button).toBeEnabled();
          await button.click();
          await this.wait(500);
        }
      }
    } catch (error) {
      // If button doesn't exist, it's okay - might not be needed
      // Just continue with the flow
    }
  }

  /**
   * Fill in role summary
   * @param summary Role summary text
   */
  async fillRoleSummary(summary: string): Promise<void> {
    await expect(this.roleSummaryInput()).toBeVisible();
    await this.roleSummaryInput().fill(summary);
  }

  /**
   * Generic method to add an item to a list (responsibility, qualification, skill)
   * @param inputLocator Locator for the input field
   * @param addButtonLocator Locator for the add button
   * @param itemText Text to add
   */
  private async addListItem(
    inputLocator: Locator,
    addButtonLocator: Locator,
    itemText: string
  ): Promise<void> {
    await expect(inputLocator).toBeVisible({ timeout: 10000 });
    await expect(inputLocator).toBeEnabled();
    await inputLocator.fill(itemText);
    await this.wait(300);
    
    // Wait for the add button to be visible and enabled
    await expect(addButtonLocator).toBeVisible({ timeout: 10000 });
    await expect(addButtonLocator).toBeEnabled({ timeout: 5000 });
    await addButtonLocator.click();
    await this.wait(500);
  }

  /**
   * Generic method to add multiple items to a list
   * @param inputLocator Locator for the input field
   * @param addButtonLocator Locator for the add button
   * @param items Array of items to add
   */
  private async addListItems(
    inputLocator: Locator,
    addButtonLocator: Locator,
    items: string[]
  ): Promise<void> {
    for (const item of items) {
      await this.addListItem(inputLocator, addButtonLocator, item);
    }
  }

  /**
   * Add a responsibility
   * @param responsibility Responsibility text
   */
  async addResponsibility(responsibility: string): Promise<void> {
    await this.addListItem(this.responsibilityInput(), this.addResponsibilityButton(), responsibility);
  }

  /**
   * Add multiple responsibilities
   * @param responsibilities Array of responsibility texts
   */
  async addResponsibilities(responsibilities: string[]): Promise<void> {
    await this.addListItems(this.responsibilityInput(), this.addResponsibilityButton(), responsibilities);
  }

  /**
   * Add a qualification
   * @param qualification Qualification text
   */
  async addQualification(qualification: string): Promise<void> {
    await this.addListItem(this.qualificationInput(), this.addQualificationButton(), qualification);
  }

  /**
   * Add a skill
   * @param skill Skill text
   */
  async addSkill(skill: string): Promise<void> {
    await this.addListItem(this.skillInput(), this.addSkillButton(), skill);
  }

  /**
   * Add multiple skills
   * @param skills Array of skill texts
   */
  async addSkills(skills: string[]): Promise<void> {
    await this.addListItems(this.skillInput(), this.addSkillButton(), skills);
  }

  /**
   * Fill in compensation and benefits
   * @param compensation Compensation text
   */
  async fillCompensation(compensation: string): Promise<void> {
    const input = this.compensationInput();
    // Wait for the input to be visible (it appears on step 2)
    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(input).toBeEnabled();
    await input.fill(compensation);
    await this.wait(300);
  }

  /**
   * Click Review button
   */
  async clickReview(): Promise<void> {
    const button = this.reviewButton();
    await expect(button).toBeVisible({ timeout: 10000 });
    await expect(button).toBeEnabled({ timeout: 10000 });
    await button.click();
    await this.wait(1000);
  }

  /**
   * Select location
   * @param location Location name (e.g., "Gurgaon")
   */
  async selectLocation(location: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Add New Job Posting' });
    const locationOption = dialog.getByText(location, { exact: true });
    await expect(locationOption).toBeVisible();
    await locationOption.click();
    await this.wait(500);
  }

  /**
   * Select multiple locations
   * @param locations Array of location names (e.g., ["Gurgaon", "Remote"])
   */
  async selectLocations(locations: string[]): Promise<void> {
    for (const location of locations) {
      await this.selectLocation(location);
    }
  }

  /**
   * Add a new custom location
   * Clicks the add location button, types the location name, and confirms
   * @param locationName Name of the new location to add
   */
  async addCustomLocation(locationName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Add New Job Posting' });
    
    // Try to find "Add Location" text button - it might be in the dialog
    let addLocationTrigger = dialog.getByText('Add Location', { exact: true });
    const isTriggerInDialog = await addLocationTrigger.isVisible().catch(() => false);
    
    if (!isTriggerInDialog) {
      // Try finding it on the page
      addLocationTrigger = this.page.getByText('Add Location', { exact: true });
    }
    
    await expect(addLocationTrigger).toBeVisible({ timeout: 10000 });
    await addLocationTrigger.click();
    await this.wait(500);

    // Fill in the location name - try in dialog first, then page
    let locationInput = dialog.getByRole('textbox', { name: 'Location name' });
    const isInputInDialog = await locationInput.isVisible().catch(() => false);
    
    if (!isInputInDialog) {
      locationInput = this.page.getByRole('textbox', { name: 'Location name' });
    }
    
    await expect(locationInput).toBeVisible({ timeout: 10000 });
    await expect(locationInput).toBeEnabled();
    await locationInput.fill(locationName);
    await this.wait(300);

    // Click Add Location button to confirm - try in dialog first, then page
    let addLocationButton = dialog.getByRole('button', { name: 'Add Location' });
    const isButtonInDialog = await addLocationButton.isVisible().catch(() => false);
    
    if (!isButtonInDialog) {
      addLocationButton = this.page.getByRole('button', { name: 'Add Location' });
    }
    
    await expect(addLocationButton).toBeVisible({ timeout: 10000 });
    await expect(addLocationButton).toBeEnabled();
    await addLocationButton.click();
    await this.wait(500);
  }

  /**
   * Add multiple custom locations
   * @param locationNames Array of location names to add
   */
  async addCustomLocations(locationNames: string[]): Promise<void> {
    for (const locationName of locationNames) {
      await this.addCustomLocation(locationName);
    }
  }

  /**
   * Click on Manual Entry button to proceed with manual job posting creation
   */
  async clickManualEntryButton(): Promise<void> {
    await expect(this.manualEntryButton()).toBeVisible({ timeout: 10000 });
    await this.manualEntryButton().click();
    await this.wait(1000);
  }

  /**
   * Click on AI-Powered button to let AI create the job posting
   */
  async clickAIPoweredButton(): Promise<void> {
    await expect(this.aiPoweredButton()).toBeVisible({ timeout: 10000 });
    await this.aiPoweredButton().click();
    await this.wait(1000);
  }

  /**
   * Save job posting as draft
   */
  async saveAsDraft(): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Add New Job Posting' });
    
    // The save as draft button might be in the dialog or at the bottom of the form
    let saveButton = this.saveAsDraftButton();
    const isButtonVisible = await saveButton.isVisible().catch(() => false);
    
    if (!isButtonVisible) {
      // Try finding it in the dialog footer
      saveButton = dialog.getByText(/Save as Draft/i);
    }
    
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    
    // Wait for network to be idle after the click
    await this.page.waitForLoadState('networkidle');
    
    // Check for validation errors (form may prevent save if required fields are missing)
    const validationError = this.page.getByText('Please enter compensation and benefits');
    const hasValidationError = await validationError.isVisible().catch(() => false);
    
    if (hasValidationError) {
      // Validation error is present - save was prevented, dialog stays open (expected behavior)
      return;
    }
    
    // No validation error - wait for either success notification OR dialog to close
    const successNotification = this.page.getByText('Job posting created successfully!');
    
    // Wait for success notification with longer timeout (notification may take time to appear)
    const notificationVisible = await successNotification.isVisible({ timeout: 15000 }).catch(() => false);
    
    if (notificationVisible) {
      // Notification appeared - success, dialog should close shortly
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    } else {
      // If notification doesn't appear, wait for dialog to close instead
      // This handles cases where notification doesn't show but save succeeds
      await expect(dialog).not.toBeVisible({ timeout: 30000 });
    }
  }

  /**
   * Click on Document Upload Extract button
   */
  async clickDocumentUploadExtract(): Promise<void> {
    // Wait for the button to appear on step 2 after Continue is clicked
    await expect(this.documentUploadExtractButton()).toBeVisible({ timeout: 10000 });
    await this.documentUploadExtractButton().click();
    await this.wait(1000);
  }

  /**
   * Upload a document file
   * @param filePath Path to the file to upload
   */
  async uploadDocument(filePath: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Add New Job Posting' });
    const fileInput = dialog.locator('input[type="file"]');
    await this.uploadFile(fileInput, filePath);
  }

  /**
   * Create a complete job posting
   * @param jobData Object containing all job posting data
   */
  async createJobPosting(jobData: {
    title: string;
    department: string;
    experienceLevel: string;
    employmentType: string;
    openPositions: string;
    roleSummary: string;
    responsibilities: string[];
    qualification: string;
    skills: string[];
    compensation: string;
    location: string;
  }): Promise<void> {
    await this.clickAddNewJob();
    // Select Manual Entry method if method selection screen is shown
    const manualEntryButton = this.manualEntryButton();
    const isMethodSelectionVisible = await manualEntryButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (isMethodSelectionVisible) {
      await this.clickManualEntryButton();
    }
    await this.fillJobTitle(jobData.title);
    await this.selectDepartment(jobData.department);
    await this.selectExperienceLevel(jobData.experienceLevel);
    await this.selectEmploymentType(jobData.employmentType);
    await this.fillOpenPositions(jobData.openPositions);
    await this.clickContinue();
    await this.clickComplexButton();
    await this.fillRoleSummary(jobData.roleSummary);
    await this.addResponsibilities(jobData.responsibilities);
    await this.addQualification(jobData.qualification);
    await this.addSkills(jobData.skills);
    await this.fillCompensation(jobData.compensation);
    // Add location before Review - Review button is disabled until all required fields are filled
    await this.addCustomLocation(jobData.location);
    await this.clickReview();
    await this.saveAsDraft();
  }
}

