import { test as base, Page, Fixtures } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { JobPostingPage } from '../../pages/job-posting-page';
import { ApplicantsPage } from '../../pages/applicants-page';
import { InterviewPage } from '../../pages/interview-page';
import { testConfig } from '../../config/test-config';

// Cache for auth state verification results (per test run)
const authStateCache = new Map<string, { isValid: boolean; timestamp: number }>();
const AUTH_STATE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

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
  authenticatedPageHR: Page;
};

const AUTH_STATE_PATH = path.join(process.cwd(), 'auth-state.json');
const AUTH_STATE_HR_PATH = path.join(process.cwd(), 'auth-state-hr.json');

/**
 * Test fixture that provides authenticated page and page objects
 * Automatically handles login with state caching for better performance
 */
export const test = base.extend<TestFixtures>({
  // Authenticated page with automatic login and state caching
  authenticatedPage: async ({ browser }, use) => {
    // Check auth state file age and cache
    let shouldVerify = true;
    const cacheKey = AUTH_STATE_PATH;
    
    if (fs.existsSync(AUTH_STATE_PATH)) {
      const stats = fs.statSync(AUTH_STATE_PATH);
      const fileAge = Date.now() - stats.mtimeMs;
      const cachedResult = authStateCache.get(cacheKey);
      
      // Skip verification if file is recent (< 5 min) and we have a valid cached result
      if (fileAge < AUTH_STATE_MAX_AGE && cachedResult && cachedResult.isValid) {
        const cacheAge = Date.now() - cachedResult.timestamp;
        if (cacheAge < AUTH_STATE_MAX_AGE) {
          shouldVerify = false;
        }
      }
    }
    
    // Create a new context with stored auth state if available
    let context = await browser.newContext();
    
    if (fs.existsSync(AUTH_STATE_PATH)) {
      try {
        context = await browser.newContext({
          storageState: AUTH_STATE_PATH,
        });
      } catch {
        // If state is invalid, create fresh context
        context = await browser.newContext();
        shouldVerify = true; // Force verification if state file is corrupted
      }
    }
    
    const page = await context.newPage();
    
    // Verify authentication is still valid (only if needed)
    if (shouldVerify) {
      try {
        await page.goto(testConfig.baseURL, { waitUntil: 'domcontentloaded' });
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.closeNotifications();
        // Must be on authenticated dashboard (landing page also loads successfully).
        await dashboardPage.navigateToPostings().catch(() => {
          throw new Error('Auth state invalid (Postings not visible)');
        });
        // Cache successful verification
        authStateCache.set(cacheKey, { isValid: true, timestamp: Date.now() });
      } catch {
        // Re-authenticate if verification fails
        const loginPage = new LoginPage(page);
        await loginPage.login(testConfig.credentials.email, testConfig.credentials.password);
        
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.closeNotifications();
        
        // Save authentication state
        await context.storageState({ path: AUTH_STATE_PATH });
        // Cache successful re-authentication
        authStateCache.set(cacheKey, { isValid: true, timestamp: Date.now() });
      }
    }
    
    // Use the authenticated page
    await use(page);
    
    // Save state before closing
    await context.storageState({ path: AUTH_STATE_PATH });
    
    // Cleanup: close all pages and context
    try {
      const pages = context.pages();
      await Promise.all(pages.map(p => p.close().catch(() => {})));
    } catch {
      // Ignore cleanup errors
    }
    await context.close();
  },

  // HR Profile authenticated page
  authenticatedPageHR: async ({ browser }, use) => {
    // Check auth state file age and cache
    let shouldVerify = true;
    const cacheKey = AUTH_STATE_HR_PATH;
    
    if (fs.existsSync(AUTH_STATE_HR_PATH)) {
      const stats = fs.statSync(AUTH_STATE_HR_PATH);
      const fileAge = Date.now() - stats.mtimeMs;
      const cachedResult = authStateCache.get(cacheKey);
      
      // Skip verification if file is recent (< 5 min) and we have a valid cached result
      if (fileAge < AUTH_STATE_MAX_AGE && cachedResult && cachedResult.isValid) {
        const cacheAge = Date.now() - cachedResult.timestamp;
        if (cacheAge < AUTH_STATE_MAX_AGE) {
          shouldVerify = false;
        }
      }
    }
    
    let context = await browser.newContext();
    
    if (fs.existsSync(AUTH_STATE_HR_PATH)) {
      try {
        context = await browser.newContext({
          storageState: AUTH_STATE_HR_PATH,
        });
      } catch {
        context = await browser.newContext();
        shouldVerify = true; // Force verification if state file is corrupted
      }
    }
    
    const page = await context.newPage();
    
    // Verify authentication is still valid (only if needed)
    if (shouldVerify) {
      try {
        await page.goto(testConfig.baseURL, { waitUntil: 'domcontentloaded' });
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.closeNotifications();
        await dashboardPage.navigateToPostings().catch(() => {
          throw new Error('HR auth state invalid (Postings not visible)');
        });
        // Cache successful verification
        authStateCache.set(cacheKey, { isValid: true, timestamp: Date.now() });
      } catch {
        const loginPage = new LoginPage(page);
        await loginPage.login(testConfig.hrCredentials.email, testConfig.hrCredentials.password);
        
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.closeNotifications();
        
        await context.storageState({ path: AUTH_STATE_HR_PATH });
        // Cache successful re-authentication
        authStateCache.set(cacheKey, { isValid: true, timestamp: Date.now() });
      }
    }
    
    await use(page);
    
    await context.storageState({ path: AUTH_STATE_HR_PATH });
    
    // Cleanup: close all pages and context
    try {
      const pages = context.pages();
      await Promise.all(pages.map(p => p.close().catch(() => {})));
    } catch {
      // Ignore cleanup errors
    }
    await context.close();
  },

  // Page objects
  loginPage: async ({ page }: { page: Page }, use: (value: LoginPage) => Promise<void>) => {
    // Login page is typically used on an unauthenticated page.
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ authenticatedPage }, use: (value: DashboardPage) => Promise<void>) => {
    // Ensure page objects operate on the authenticated page/context.
    await use(new DashboardPage(authenticatedPage));
  },

  jobPostingPage: async ({ authenticatedPage }, use: (value: JobPostingPage) => Promise<void>) => {
    await use(new JobPostingPage(authenticatedPage));
  },

  applicantsPage: async ({ authenticatedPage }, use: (value: ApplicantsPage) => Promise<void>) => {
    await use(new ApplicantsPage(authenticatedPage));
  },

  interviewPage: async ({ authenticatedPage }, use: (value: InterviewPage) => Promise<void>) => {
    await use(new InterviewPage(authenticatedPage));
  },
});

export { expect } from '@playwright/test';

