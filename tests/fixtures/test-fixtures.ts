import { test as base, Page, Fixtures } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { JobPostingPage } from '../../pages/job-posting-page';
import { ApplicantsPage } from '../../pages/applicants-page';
import { InterviewPage } from '../../pages/interview-page';
import { testConfig } from '../../config/test-config';

/**
 * Extended test context with page objects and common setup/teardown
 */
type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  jobPostingPage: JobPostingPage;
  applicantsPage: ApplicantsPage;
  interviewPage: InterviewPage;
  authenticatedPage: Page;
};

/**
 * Test fixture that provides authenticated page and page objects
 * Automatically handles login and logout
 */
export const test = base.extend<TestFixtures>({
  // Authenticated page with automatic login
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(testConfig.credentials.email, testConfig.credentials.password);
    
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.closeNotifications();
    
    // Use the authenticated page
    await use(page);
    
    // Teardown: logout
    await dashboardPage.logout();
  },

  // Page objects
  loginPage: async ({ page }: { page: Page }, use: (value: LoginPage) => Promise<void>) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }: { page: Page }, use: (value: DashboardPage) => Promise<void>) => {
    await use(new DashboardPage(page));
  },

  jobPostingPage: async ({ page }: { page: Page }, use: (value: JobPostingPage) => Promise<void>) => {
    await use(new JobPostingPage(page));
  },

  applicantsPage: async ({ page }: { page: Page }, use: (value: ApplicantsPage) => Promise<void>) => {
    await use(new ApplicantsPage(page));
  },

  interviewPage: async ({ page }: { page: Page }, use: (value: InterviewPage) => Promise<void>) => {
    await use(new InterviewPage(page));
  },
});

export { expect } from '@playwright/test';

