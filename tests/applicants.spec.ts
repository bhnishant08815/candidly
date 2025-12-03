import { test, expect } from './fixtures/test-fixtures';

test.describe('Applicants Automation', () => {
  test('should add a new applicant', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
    // Navigate to Applicants page
    await dashboardPage.navigateToApplicants();

    // Add applicant using Page Object Model
    await applicantsPage.addApplicant({
      resumePath: 'test-resources/functionalsample.pdf',
      phone: '84844484844',
      role: 'Full Stack Developer',
      experience: '8',
      noticePeriod: '25',
      currentCTC: '10',
      expectedCTC: '25',
      skills: 'Java, Python '
    });

    console.log('Applicant added successfully. Current URL:', authenticatedPage.url());
  });
});

