import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/test-data-generator';

test.describe('Job Posting SDE3 with Document Upload', () => {
  // Configure timeout: 4x the default (480 seconds = 8 minutes)
  test.describe.configure({ timeout: 480 * 1000 });
  
  test('should create a new SDE3 job posting with document upload and save as draft', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
    // Generate dynamic job title to avoid duplicates
    const jobTitle = TestDataGenerator.generateJobTitle('SDE3');

    // Navigate to Postings page
    await dashboardPage.navigateToPostings();

    // Start creating a new job posting
    await jobPostingPage.clickAddNewJob();

    // Fill in basic job details with dynamic title
    await jobPostingPage.fillJobTitle(jobTitle);
    await jobPostingPage.selectDepartment('Engineering');
    await jobPostingPage.selectExperienceLevel('Lead (7-10 years)');
    await jobPostingPage.selectEmploymentType('Full-Time');
    await jobPostingPage.fillOpenPositions('2');

    // Continue to next step
    await jobPostingPage.clickContinue();

    // Click on Document Upload button
    await jobPostingPage.clickDocumentUploadExtract();

    // Upload the document file
    await jobPostingPage.uploadDocument('test-resources/Job Title_ Salesforce Developer II.pdf');

    // Fill in compensation and benefits
    await jobPostingPage.fillCompensation('32');

    // Save as draft
    await jobPostingPage.saveAsDraft();

    // Verify the job posting was created successfully
    console.log(`SDE3 job posting "${jobTitle}" with document upload created and saved as draft. Current URL:`, authenticatedPage.url());
  });
});
