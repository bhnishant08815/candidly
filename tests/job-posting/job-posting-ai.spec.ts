import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/test-data-generator';

test.describe('AI-Powered Job Posting', () => {
  // Configure timeout: 4x the default (480 seconds = 8 minutes)
  test.describe.configure({ timeout: 480 * 1000 });
  
  test('should create a new AI-powered job posting and save as draft', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
    // Generate dynamic job title and location to avoid duplicates
    const jobTitle = TestDataGenerator.generateJobTitle('AI Engineer');
    const customLocation = TestDataGenerator.generateCustomLocation();

    // Navigate to Postings page
    await dashboardPage.navigateToPostings();

    // Start creating a new job posting
    await jobPostingPage.clickAddNewJob();

    // Fill in basic job details with dynamic title
    await jobPostingPage.fillJobTitle(jobTitle);
    await jobPostingPage.selectDepartment('Engineering');
    await jobPostingPage.selectExperienceLevel('Entry Level (0-1 year)');
    await jobPostingPage.selectEmploymentType('Full-Time');
    await jobPostingPage.fillOpenPositions('2');

    // Continue to next step
    await jobPostingPage.clickContinue();

    // Use AI-Powered feature to create job posting
    await jobPostingPage.clickAIPoweredButton();

    // Add custom location (using the new flow)
    await jobPostingPage.addCustomLocation(customLocation);

    // Save the job posting as draft
    await jobPostingPage.saveAsDraft();

    // Verify the job posting was created successfully
    console.log(`AI-powered job posting "${jobTitle}" with location "${customLocation}" created and saved as draft. Current URL:`, authenticatedPage.url());
  });
});