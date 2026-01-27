import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/data/test-data-generator';
import { performTestCleanup } from '../../utils/cleanup/test-cleanup';

test.describe('Job Posting Automation', () => {
  // Configure timeout: 4x the default (480 seconds = 8 minutes)
  test.describe.configure({ timeout: 480 * 1000 });

  // Cleanup after each test
  test.afterEach(async ({ authenticatedPage, dashboardPage }) => {
    await performTestCleanup(authenticatedPage, { 
      dashboardPage, 
      logoutViaApi: true,
      verbose: false 
    });
  });
  
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

