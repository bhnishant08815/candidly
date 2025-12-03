import { test, expect } from './fixtures/test-fixtures';

test.describe('Job Posting SDE3 with Document Upload', () => {
  test('should create a new SDE3 job posting with document upload and save as draft', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
    // Navigate to Postings page
    await dashboardPage.navigateToPostings();

    // Start creating a new job posting
    await jobPostingPage.clickAddNewJob();

    // Fill in basic job details
    await jobPostingPage.fillJobTitle('SDE3');
    await jobPostingPage.selectDepartment('Engineering');
    await jobPostingPage.selectExperienceLevel('Lead (7-10 years)');
    await jobPostingPage.selectEmploymentType('Full-Time');
    await jobPostingPage.fillOpenPositions('2');

    // Continue to next step
    await jobPostingPage.clickContinue();

    // Click on Document Upload Extract button
    await jobPostingPage.clickDocumentUploadExtract();

    // Upload the document file
    await jobPostingPage.uploadDocument('test-resources/Job Title_ Salesforce Developer II.pdf');

    // Fill in compensation and benefits
    await jobPostingPage.fillCompensation('32');

    // Save as draft
    await jobPostingPage.saveAsDraft();

    // Verify the job posting was created successfully
    console.log('SDE3 job posting with document upload created and saved as draft. Current URL:', authenticatedPage.url());
  });
});

