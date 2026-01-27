import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/data/test-data-generator';
import { performTestCleanup } from '../../utils/cleanup/test-cleanup';

test.describe('Applicants Automation', () => {
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
  
  test('should add a new applicant', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
    // Generate dynamic applicant data to avoid duplicate records
    // NOTE: 'role' must be an existing job posting in the system - use a known role from the dropdown
    const applicantData = TestDataGenerator.generateApplicantData({
      resumePath: 'test-resources/functionalsample.pdf',
      role: 'Full Stack Developer' // Use an existing role from the job postings dropdown
    });

    // Navigate to Applicants page
    await dashboardPage.navigateToApplicants();

    // Add applicant using Page Object Model with dynamic data
    await applicantsPage.addApplicant(applicantData);

    console.log(`Applicant for role "${applicantData.role}" added successfully. Current URL:`, authenticatedPage.url());
  });
});

