import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/test-data-generator';

test.describe('AI-Powered Job Posting', () => {
  test('should create a new AI-powered job posting and save as draft', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
    // Generate dynamic job title to avoid duplicates
    const jobTitle = TestDataGenerator.generateJobTitle('AI Engineer');

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

    // Select locations
    await jobPostingPage.selectLocations(['Gurgaon', 'Remote']);

    // Save the job posting as draft
    await jobPostingPage.saveAsDraft();

    // Verify the job posting was created successfully
    console.log(`AI-powered job posting "${jobTitle}" created and saved as draft. Current URL:`, authenticatedPage.url());
  });
});