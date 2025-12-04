import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/test-data-generator';

test.describe('Job Posting Automation', () => {
  test('should create a new job posting', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
    // Generate dynamic test data to avoid duplicate records
    const jobData = TestDataGenerator.generateJobPostingData({
      // Override specific fields if needed, otherwise all fields are randomly generated
      department: 'Engineering',
      employmentType: 'Full-Time'
    });

    // Navigate to Postings
    await dashboardPage.navigateToPostings();

    // Create job posting using Page Object Model with dynamic data
    await jobPostingPage.createJobPosting(jobData);

    console.log(`Job posting "${jobData.title}" created and saved as draft. Current URL:`, authenticatedPage.url());
  });
});

