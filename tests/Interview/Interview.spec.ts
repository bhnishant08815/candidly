import { test, expect } from '../fixtures/test-fixtures';
import { InterviewPage, InterviewData } from '../../pages/interview-page';

test.describe('Interview Automation', () => {
  test('TC-001: should schedule an interview using existing applicant', { tag: ['@E2E', '@Interview'] }, async ({ page, loginPage, dashboardPage }) => {
    // Login
    await loginPage.login('bh.nishant@concret.io', 'Candidly@2025');
    await dashboardPage.closeNotifications();

    // Initialize Interview page
    const interviewPage = new InterviewPage(page);

    // Navigate to Interviews
    await interviewPage.navigateToInterviews();

    // Schedule interview with test data
    // Uses the first available applicant from the dropdown
    const interviewData: InterviewData = {
      applicantName: 'SELECT_FIRST_AVAILABLE', 
      mainInterviewer: 'Nishant Bhardwaj',
      date: '2025-12-20',
      time: '10:00 AM',
      round: 'Tech-I'
    };

    await interviewPage.scheduleInterview(interviewData);

    // Send email notification
    await interviewPage.sendInterviewEmail();

    console.log('Interview scheduled and email sent successfully');
  });


});
