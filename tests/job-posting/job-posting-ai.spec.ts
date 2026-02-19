import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/data/test-data-generator';
import { performTestCleanup } from '../../utils/cleanup/test-cleanup';
import { TestDataTracker } from '../../utils/data/test-data-tracker';

test.describe('AI-Powered Job Posting', () => {
  // Configure timeout: 4x the default (480 seconds = 8 minutes)
  test.describe.configure({ timeout: 480 * 1000 });

  // Cleanup after each test (aligned with job-posting-regression flow)
  test.afterEach(async ({ authenticatedPage, dashboardPage, jobPostingPage }, testInfo) => {
    await performTestCleanup(authenticatedPage, {
      dashboardPage,
      jobPostingPage,
      logoutViaApi: true,
      deleteCreatedRecords: true,
      verbose: true
    }, testInfo.testId);
  });

  // Flow aligned with job-posting-regression TC-JP02
  test('TC-JP02: Create job posting using AI-Powered feature', async ({ authenticatedPage, dashboardPage, jobPostingPage }, testInfo) => {
    const jobTitle = TestDataGenerator.generateJobTitle('AI Engineer');
    const customLocation = TestDataGenerator.generateCustomLocation();

    await dashboardPage.navigateToPostings();
    await jobPostingPage.clickAddNewJob();
    await jobPostingPage.fillJobTitle(jobTitle);
    await jobPostingPage.selectDepartment('Engineering');
    await jobPostingPage.selectExperienceLevel('Senior (5-7 years)');
    await jobPostingPage.selectEmploymentType('Full-Time');
    await jobPostingPage.fillOpenPositions('2');
    await jobPostingPage.fillExpectedClosingDate(TestDataGenerator.generateExpectedClosingDate());
    await jobPostingPage.selectAssignedToHr(TestDataGenerator.generateAssignedToHr());
    await jobPostingPage.clickContinue();
    await jobPostingPage.clickAIPoweredButton();
    await jobPostingPage.addCustomLocation(customLocation);
    await jobPostingPage.saveAsDraft();

    const identifier = await jobPostingPage.getLastCreatedJobPostingId().catch(() => jobTitle);
    TestDataTracker.track(testInfo.testId, {
      type: 'jobPosting',
      identifier: identifier ?? jobTitle,
      metadata: { title: jobTitle }
    });

    console.log(`✓ TC-JP02: AI-powered job posting "${jobTitle}" with location "${customLocation}" created successfully`);
  });

  // Flow aligned with job-posting-regression TC-JP18
  test('TC-JP18: AI-powered job posting for Entry Level position', async ({ authenticatedPage, dashboardPage, jobPostingPage }, testInfo) => {
    const jobTitle = TestDataGenerator.generateJobTitle('Junior Developer');

    await dashboardPage.navigateToPostings();
    await jobPostingPage.clickAddNewJob();
    await jobPostingPage.fillJobTitle(jobTitle);
    await jobPostingPage.selectDepartment('Engineering');
    await jobPostingPage.selectExperienceLevel('Entry Level (0-1 year)');
    await jobPostingPage.selectEmploymentType('Full-Time');
    await jobPostingPage.fillOpenPositions('5');
    await jobPostingPage.fillExpectedClosingDate(TestDataGenerator.generateExpectedClosingDate());
    await jobPostingPage.selectAssignedToHr(TestDataGenerator.generateAssignedToHr());
    await jobPostingPage.clickContinue();
    await jobPostingPage.clickAIPoweredButton();
    await jobPostingPage.addCustomLocation('Hybrid');
    await jobPostingPage.saveAsDraft();

    const identifier = await jobPostingPage.getLastCreatedJobPostingId().catch(() => jobTitle);
    TestDataTracker.track(testInfo.testId, {
      type: 'jobPosting',
      identifier: identifier ?? jobTitle,
      metadata: { title: jobTitle }
    });

    console.log(`✓ TC-JP18: Entry level AI-powered job posting "${jobTitle}" created successfully`);
  });
});
