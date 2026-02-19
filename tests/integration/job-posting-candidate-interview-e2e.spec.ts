import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/data/test-data-generator';
import { TestDataTracker } from '../../utils/data/test-data-tracker';
import { performTestCleanup } from '../../utils/cleanup/test-cleanup';

/**
 * E2E Automation: Create random job posting → Add candidate for that job → Schedule job interview
 * Uses existing page objects, TestDataGenerator, and cleanup.
 */

test.describe('Job Posting - Candidate - Interview E2E', () => {
  test.describe.configure({ timeout: 480 * 1000 });

  test.afterEach(async (
    { authenticatedPage, dashboardPage, jobPostingPage, applicantsPage, interviewPage },
    testInfo
  ) => {
    await performTestCleanup(authenticatedPage, {
      dashboardPage,
      jobPostingPage,
      applicantsPage,
      interviewPage,
      logoutViaApi: true,
      deleteCreatedRecords: true,
      verbose: false,
    }, testInfo.testId);
  });

  test('E2E: Create random job, add candidate for that job, schedule interview', async (
    { authenticatedPage, dashboardPage, jobPostingPage, applicantsPage, interviewPage },
    testInfo
  ) => {
    // 1. Create random job posting (use department/employment type that exist in the UI dropdowns)
    const jobData = TestDataGenerator.generateJobPostingData({
      department: 'Engineering',
      employmentType: 'Full-Time',
    });
    await dashboardPage.navigateToPostings();
    const jobIdentifier = await jobPostingPage.createJobPosting(jobData);

    TestDataTracker.track(testInfo.testId, {
      type: 'jobPosting',
      identifier: jobIdentifier,
      metadata: { title: jobData.title },
    });
    console.log(`✓ Job posting "${jobData.title}" created (identifier: ${jobIdentifier})`);

    await authenticatedPage.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});

    // 2. Add one candidate for that job
    await dashboardPage.navigateToApplicants();
    const applicantData = TestDataGenerator.generateApplicantData({
      role: jobData.title,
      resumePath: 'test-resources/functionalsample.pdf',
    });
    const applicantIdentifier = await applicantsPage.addApplicant(applicantData);

    TestDataTracker.track(testInfo.testId, {
      type: 'applicant',
      identifier: applicantIdentifier,
      metadata: { name: applicantIdentifier, email: applicantIdentifier },
    });
    console.log(`✓ Applicant added for job "${jobData.title}" (identifier: ${applicantIdentifier})`);

    // 3. Schedule interview for that candidate
    await interviewPage.navigateToInterviews();
    const interviewData = TestDataGenerator.generateInterviewData({
      applicantName: applicantIdentifier,
    });
    const selectedApplicant = await interviewPage.scheduleInterview(interviewData);
    await interviewPage.verifyInterviewScheduled();

    TestDataTracker.track(testInfo.testId, {
      type: 'interview',
      identifier: applicantIdentifier,
      metadata: { name: selectedApplicant },
    });
    console.log(
      `✓ Interview scheduled - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`
    );
  });
});
