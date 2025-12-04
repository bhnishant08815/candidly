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
  private readonly saveAsDraftButton = () => this.page.getByRole('button', { name: 'Save as Draft' });
  private readonly aiPoweredButton = () => this.page.getByRole('button', { name: /AI-Powered/i });
  private readonly documentUploadExtractButton = () => this.page.getByRole('button', { name: /Document Upload/i });

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
    await expect(this.addNewJobButton()).toBeVisible();
    await this.addNewJobButton().click();
    await this.wait(1000);
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
    await combobox.click();
    await this.wait(500);
    
    const option = useExactMatch
      ? this.page.getByText(optionText, { exact: true })
      : this.page.locator(`span:has-text("${optionText}")`);
    
    await expect(option).toBeVisible();
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
    await expect(this.openPositionsInput()).toBeVisible();
    await this.openPositionsInput().fill(count);
  }

  /**
   * Click Continue button to proceed to next step
   */
  async clickContinue(): Promise<void> {
    await expect(this.continueButton()).toBeVisible();
    await this.continueButton().click();
    await this.wait(1000);
  }

  /**
   * Click on the complex button (appears to be a location/type selector)
   * This button appears on the second step of the form
   */
  async clickComplexButton(): Promise<void> {
    // Wait for the button to appear (it's on the next step after Continue)
    await expect(this.complexButton()).toBeVisible({ timeout: 10000 });
    await this.complexButton().click();
    await this.wait(500);
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
    await expect(inputLocator).toBeVisible();
    await inputLocator.fill(itemText);
    await this.wait(300);
    await expect(addButtonLocator).toBeVisible();
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
    await expect(this.compensationInput()).toBeVisible();
    await this.compensationInput().fill(compensation);
  }

  /**
   * Click Review button
   */
  async clickReview(): Promise<void> {
    await expect(this.reviewButton()).toBeVisible();
    await this.reviewButton().click();
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
    // Click on the add location button (SVG icon)
    const addLocationIcon = this.page.locator("//div[@class='rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground cursor-pointer hover:scale-105 transition-transform flex items-center gap-1 flex-shrink-0']//*[name()='svg']");
    await expect(addLocationIcon).toBeVisible();
    await addLocationIcon.click();
    await this.wait(500);

    // Fill in the location name
    const locationInput = this.page.getByRole('textbox', { name: 'Location name' });
    await expect(locationInput).toBeVisible();
    await locationInput.fill(locationName);
    await this.wait(300);

    // Click Add Location button
    const addLocationButton = this.page.getByRole('button', { name: 'Add Location' });
    await expect(addLocationButton).toBeVisible();
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
    await expect(this.saveAsDraftButton()).toBeVisible();
    const dialog = this.page.getByRole('dialog', { name: 'Add New Job Posting' });
    await this.saveAsDraftButton().click();
    
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
    
    try {
      await expect(successNotification).toBeVisible({ timeout: 5000 });
    } catch {
      // If notification doesn't appear, wait for dialog to close instead
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
    await this.clickReview();
    await this.selectLocation(jobData.location);
    await this.saveAsDraft();
  }
}

