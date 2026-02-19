# MCP Usage Examples

This document provides real-world examples of using MCP with the StrataHire test automation framework.

---

## Table of Contents

1. [Test Creation Examples](#test-creation-examples)
2. [Debugging Examples](#debugging-examples)
3. [Refactoring Examples](#refactoring-examples)
4. [Page Object Examples](#page-object-examples)
5. [Integration Test Examples](#integration-test-examples)
6. [Report Generation Examples](#report-generation-examples)
7. [Code Review Examples](#code-review-examples)

---

## Test Creation Examples

### Example 1: Create a Simple Test

**User Request**:
> "Create a test for verifying that a job posting appears in the dashboard after creation"

**AI Response** (using MCP):

1. **Read existing patterns** (File System MCP):
   - Reads `tests/job-posting/job-posting.spec.ts`
   - Reads `pages/job-posting-page.ts`
   - Reads `pages/dashboard-page.ts`

2. **Generate test code**:

```typescript
import { test, expect } from '@playwright/test';
import { authenticatedPage } from '../fixtures/test-fixtures';
import { JobPostingPage } from '../../pages/job-posting-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { TestDataGenerator } from '../../utils/data/test-data-generator';

test.describe('Job Posting Dashboard Visibility', () => {
  test('TC-JP36: Job posting appears in dashboard after creation', async ({ authenticatedPage }) => {
    const jobPostingPage = new JobPostingPage(authenticatedPage);
    const dashboardPage = new DashboardPage(authenticatedPage);
    
    // Generate unique test data
    const jobTitle = TestDataGenerator.generateJobTitle();
    
    // Create job posting
    await jobPostingPage.navigateToJobPosting();
    await jobPostingPage.createJobPosting({
      title: jobTitle,
      department: 'Engineering',
      location: 'Remote'
    });
    
    // Navigate to dashboard
    await dashboardPage.navigateToDashboard();
    
    // Verify job appears in dashboard
    const isVisible = await dashboardPage.isJobPostingVisible(jobTitle);
    expect(isVisible).toBe(true);
  });
});
```

3. **Save file** (File System MCP):
   - Saves to `tests/job-posting/job-posting-dashboard.spec.ts`

4. **Commit changes** (Git MCP):
   ```bash
   git add tests/job-posting/job-posting-dashboard.spec.ts
   git commit -m "Add test for job posting dashboard visibility"
   ```

---

### Example 2: Create Test with Multiple Scenarios

**User Request**:
> "Create tests for applicant filtering by status, department, and date range"

**AI Response**:

```typescript
import { test, expect } from '@playwright/test';
import { authenticatedPage } from '../fixtures/test-fixtures';
import { ApplicantsPage } from '../../pages/applicants-page';
import { TestDataGenerator } from '../../utils/data/test-data-generator';

test.describe('Applicant Filtering', () => {
  let applicantsPage: ApplicantsPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    applicantsPage = new ApplicantsPage(authenticatedPage);
    await applicantsPage.navigateToApplicants();
  });

  test('TC-A33: Filter applicants by status - Active', async () => {
    // Apply status filter
    await applicantsPage.filterByStatus('Active');
    
    // Wait for API response
    await applicantsPage.page.waitForAPIResponse('/api/applicants', 30000, 200);
    
    // Verify all displayed applicants have Active status
    const applicants = await applicantsPage.getDisplayedApplicants();
    expect(applicants.every(a => a.status === 'Active')).toBe(true);
  });

  test('TC-A34: Filter applicants by department', async () => {
    // Apply department filter
    await applicantsPage.filterByDepartment('Engineering');
    
    // Wait for results
    await applicantsPage.page.waitForAPIResponse('/api/applicants', 30000, 200);
    
    // Verify all displayed applicants are from Engineering
    const applicants = await applicantsPage.getDisplayedApplicants();
    expect(applicants.every(a => a.department === 'Engineering')).toBe(true);
  });

  test('TC-A35: Filter applicants by date range', async () => {
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    
    // Apply date range filter
    await applicantsPage.filterByDateRange(startDate, endDate);
    
    // Wait for results
    await applicantsPage.page.waitForAPIResponse('/api/applicants', 30000, 200);
    
    // Verify all applicants are within date range
    const applicants = await applicantsPage.getDisplayedApplicants();
    expect(applicants.every(a => {
      const date = new Date(a.applicationDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    })).toBe(true);
  });

  test('TC-A36: Combine multiple filters', async () => {
    // Apply multiple filters
    await applicantsPage.filterByStatus('Active');
    await applicantsPage.filterByDepartment('Engineering');
    
    // Wait for results
    await applicantsPage.page.waitForAPIResponse('/api/applicants', 30000, 200);
    
    // Verify applicants match all criteria
    const applicants = await applicantsPage.getDisplayedApplicants();
    expect(applicants.every(a => 
      a.status === 'Active' && a.department === 'Engineering'
    )).toBe(true);
  });
});
```

**AI also updates** `pages/applicants-page.ts` with new filter methods if needed.

---

## Debugging Examples

### Example 3: Debug a Flaky Test

**User Request**:
> "Test TC-A05 is failing intermittently. Help me debug it."

**AI Response** (using MCP):

1. **Read the test** (File System MCP):

```typescript
// Current failing test
test('TC-A05: Add new applicant', async ({ authenticatedPage }) => {
  const applicantsPage = new ApplicantsPage(authenticatedPage);
  await applicantsPage.navigateToApplicants();
  await applicantsPage.clickAddApplicant();
  await applicantsPage.fillApplicantForm({
    name: 'John Doe',
    email: 'john@example.com'
  });
  await applicantsPage.submitForm();
  // ❌ Fails here sometimes
  expect(await applicantsPage.isApplicantVisible('John Doe')).toBe(true);
});
```

2. **Analyze the issue** (Sequential Thinking MCP):
   - Problem: Race condition - checking visibility before API completes
   - Solution: Add API wait before assertion

3. **Test the fix** (Playwright MCP):
   - Launches browser
   - Reproduces the issue
   - Validates the fix

4. **Apply the fix** (File System MCP):

```typescript
test('TC-A05: Add new applicant', async ({ authenticatedPage }) => {
  const applicantsPage = new ApplicantsPage(authenticatedPage);
  await applicantsPage.navigateToApplicants();
  await applicantsPage.clickAddApplicant();
  await applicantsPage.fillApplicantForm({
    name: TestDataGenerator.generateFullName(), // ✅ Use unique name
    email: TestDataGenerator.generateEmail('applicant')
  });
  await applicantsPage.submitForm();
  
  // ✅ Wait for API response before assertion
  await applicantsPage.page.waitForAPIResponse('/api/applicants', 30000, 201);
  
  // ✅ Wait for element to be visible
  await applicantsPage.page.waitForElement(
    `text=${applicantName}`, 
    { state: 'visible', timeout: 10000 }
  );
  
  expect(await applicantsPage.isApplicantVisible(applicantName)).toBe(true);
});
```

5. **Commit the fix** (Git MCP):
   ```bash
   git add tests/Applicants/applicants.spec.ts
   git commit -m "Fix flaky test TC-A05: Add API wait before assertion"
   ```

6. **Remember the pattern** (Memory MCP):
   - "Always wait for API response before assertions"
   - "Use unique test data to avoid conflicts"

---

### Example 4: Debug Selector Issues

**User Request**:
> "The job posting form submit button selector stopped working"

**AI Response**:

1. **Test current selector** (Playwright MCP):
   ```javascript
   // Launch browser and navigate to page
   await page.goto('https://staging.stratahire.com/job-posting');
   
   // Try current selector
   const button = await page.locator('button[type="submit"]');
   console.log('Found:', await button.count()); // 0 - not found!
   
   // Inspect page structure
   const buttons = await page.locator('button').all();
   for (const btn of buttons) {
     console.log(await btn.getAttribute('data-testid'));
   }
   // Output: Found 'submit-job-posting' test ID
   ```

2. **Update page object** (File System MCP):

```typescript
// pages/job-posting-page.ts

// ❌ Old selector
private submitButton = 'button[type="submit"]';

// ✅ New selector
private submitButton = 'button[data-testid="submit-job-posting"]';
```

3. **Verify fix** (Playwright MCP):
   ```javascript
   const button = await page.locator('button[data-testid="submit-job-posting"]');
   console.log('Found:', await button.count()); // 1 - success!
   ```

4. **Commit changes** (Git MCP)

---

## Refactoring Examples

### Example 5: Extract Common Test Logic

**User Request**:
> "Multiple tests have duplicate login logic. Extract it to a fixture."

**AI Response**:

1. **Analyze tests** (File System MCP):
   - Reads multiple test files
   - Identifies duplicate patterns

2. **Create fixture** (File System MCP):

```typescript
// tests/fixtures/test-fixtures.ts

import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { testConfig } from '../../config/test-config';

type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'auth-state.json'
    });
    const page = await context.newPage();
    
    // Verify authentication
    await page.goto(testConfig.baseURL);
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible();
    
    if (!isLoggedIn) {
      const loginPage = new LoginPage(page);
      await loginPage.login(
        testConfig.credentials.email,
        testConfig.credentials.password
      );
    }
    
    await use(page);
    await context.close();
  }
});
```

3. **Update all tests** (File System MCP):

```typescript
// Before
test('My test', async ({ page }) => {
  await page.goto('...');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  // ... test logic
});

// After
test('My test', async ({ authenticatedPage }) => {
  // Already logged in!
  // ... test logic
});
```

4. **Commit refactoring** (Git MCP)

---

### Example 6: Update API Endpoint Across All Tests

**User Request**:
> "The API endpoint changed from /api/jobs to /api/v2/jobs. Update all files."

**AI Response**:

1. **Search for occurrences** (File System MCP):
   - Finds 23 occurrences across 8 files

2. **Update each file** (File System MCP):
   - Updates all test files
   - Updates page objects
   - Updates configuration

3. **Verify changes** (Playwright MCP):
   - Tests a sample scenario to verify new endpoint works

4. **Commit changes** (Git MCP):
   ```bash
   git add -A
   git commit -m "Update API endpoint from /api/jobs to /api/v2/jobs"
   ```

---

## Page Object Examples

### Example 7: Create New Page Object

**User Request**:
> "Create a page object for the new Settings page"

**AI Response**:

```typescript
// pages/settings-page.ts

import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private readonly selectors = {
    profileTab: '[data-testid="settings-profile-tab"]',
    notificationsTab: '[data-testid="settings-notifications-tab"]',
    securityTab: '[data-testid="settings-security-tab"]',
    emailInput: '[name="email"]',
    phoneInput: '[name="phone"]',
    saveButton: '[data-testid="save-settings"]',
    successMessage: '[data-testid="success-message"]'
  };

  // Navigation
  async navigateToSettings(): Promise<void> {
    await this.page.goto('/settings');
    await this.waitForElement(this.selectors.profileTab);
  }

  // Tab navigation
  async goToProfileTab(): Promise<void> {
    await this.getResilientElement(this.selectors.profileTab).click();
  }

  async goToNotificationsTab(): Promise<void> {
    await this.getResilientElement(this.selectors.notificationsTab).click();
  }

  async goToSecurityTab(): Promise<void> {
    await this.getResilientElement(this.selectors.securityTab).click();
  }

  // Profile settings
  async updateEmail(email: string): Promise<void> {
    await this.getResilientElement(this.selectors.emailInput).fill(email);
  }

  async updatePhone(phone: string): Promise<void> {
    await this.getResilientElement(this.selectors.phoneInput).fill(phone);
  }

  async saveSettings(): Promise<void> {
    await this.getResilientElement(this.selectors.saveButton).click();
    await this.waitForAPIResponse('/api/settings', 30000, 200);
    await this.waitForElement(this.selectors.successMessage);
  }

  // Verification
  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.page.locator(this.selectors.successMessage).isVisible();
  }

  async getEmailValue(): Promise<string> {
    return await this.page.locator(this.selectors.emailInput).inputValue();
  }
}
```

**Also updates** `pages/index.ts`:

```typescript
export { SettingsPage } from './settings-page';
```

---

## Integration Test Examples

### Example 8: Create End-to-End Test

**User Request**:
> "Create an integration test that creates a job, adds an applicant, and schedules an interview"

**AI Response**:

```typescript
// tests/integration/job-applicant-interview-flow.spec.ts

import { test, expect } from '@playwright/test';
import { authenticatedPage } from '../fixtures/test-fixtures';
import { JobPostingPage } from '../../pages/job-posting-page';
import { ApplicantsPage } from '../../pages/applicants-page';
import { InterviewPage } from '../../pages/interview-page';
import { TestDataGenerator } from '../../utils/data/test-data-generator';
import { ScreenshotHelper } from '../../utils/screenshots/screenshot-helper';

test.describe('Job to Interview Flow - Integration', () => {
  test('TC-INT11: Complete flow from job creation to interview scheduling', async ({ authenticatedPage }) => {
    const screenshots = new ScreenshotHelper(authenticatedPage, 'Job-Applicant-Interview-Flow');
    
    // Initialize page objects
    const jobPostingPage = new JobPostingPage(authenticatedPage);
    const applicantsPage = new ApplicantsPage(authenticatedPage);
    const interviewPage = new InterviewPage(authenticatedPage);
    
    // Generate test data
    const jobTitle = TestDataGenerator.generateJobTitle();
    const applicantName = TestDataGenerator.generateFullName();
    const applicantEmail = TestDataGenerator.generateEmail('applicant');
    
    // Step 1: Create job posting
    await screenshots.beforeAction('create_job');
    await jobPostingPage.navigateToJobPosting();
    await jobPostingPage.createJobPosting({
      title: jobTitle,
      department: 'Engineering',
      location: 'Remote',
      description: 'Test job description'
    });
    await jobPostingPage.page.waitForAPIResponse('/api/jobs', 30000, 201);
    await screenshots.afterAction('create_job');
    
    // Verify job created
    expect(await jobPostingPage.isJobPostingVisible(jobTitle)).toBe(true);
    
    // Step 2: Add applicant to job
    await screenshots.beforeAction('add_applicant');
    await applicantsPage.navigateToApplicants();
    await applicantsPage.addApplicant({
      name: applicantName,
      email: applicantEmail,
      phone: TestDataGenerator.generatePhoneNumber(),
      jobTitle: jobTitle
    });
    await applicantsPage.page.waitForAPIResponse('/api/applicants', 30000, 201);
    await screenshots.afterAction('add_applicant');
    
    // Verify applicant added
    expect(await applicantsPage.isApplicantVisible(applicantName)).toBe(true);
    
    // Step 3: Schedule interview
    await screenshots.beforeAction('schedule_interview');
    await interviewPage.navigateToInterviews();
    await interviewPage.scheduleInterview({
      applicantName: applicantName,
      jobTitle: jobTitle,
      interviewType: 'Technical',
      date: TestDataGenerator.getFutureDate(7),
      time: '10:00 AM'
    });
    await interviewPage.page.waitForAPIResponse('/api/interviews', 30000, 201);
    await screenshots.afterAction('schedule_interview');
    
    // Verify interview scheduled
    expect(await interviewPage.isInterviewScheduled(applicantName)).toBe(true);
    
    // Final screenshot
    await screenshots.onSuccess('complete_flow');
  });
});
```

---

## Report Generation Examples

### Example 9: Generate Custom Report

**User Request**:
> "Generate a summary report of the last test run"

**AI Response** (using MCP):

1. **Read test results** (File System MCP):
   - Reads `test-output.json`
   - Reads `playwright-report/` directory

2. **Generate report**:

```typescript
// utils/reporting/custom-report-generator.ts

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  testId: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export class CustomReportGenerator {
  generateSummary(results: TestResult[]): string {
    const total = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const passRate = ((passed / total) * 100).toFixed(2);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Summary Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; }
          .stat { display: inline-block; margin: 10px 20px; }
          .passed { color: green; }
          .failed { color: red; }
          .skipped { color: orange; }
        </style>
      </head>
      <body>
        <h1>Test Execution Summary</h1>
        <div class="summary">
          <div class="stat">Total Tests: <strong>${total}</strong></div>
          <div class="stat passed">Passed: <strong>${passed}</strong></div>
          <div class="stat failed">Failed: <strong>${failed}</strong></div>
          <div class="stat skipped">Skipped: <strong>${skipped}</strong></div>
          <div class="stat">Pass Rate: <strong>${passRate}%</strong></div>
        </div>
        
        <h2>Failed Tests</h2>
        <ul>
          ${results.filter(r => r.status === 'failed').map(r => `
            <li>
              <strong>${r.testId}</strong>: ${r.title}
              <br><small>Error: ${r.error}</small>
            </li>
          `).join('')}
        </ul>
      </body>
      </html>
    `;
    
    return html;
  }
}
```

3. **Save report** (File System MCP):
   - Saves to `client-reports/summary-report.html`

---

## Code Review Examples

### Example 10: Review Test Code Quality

**User Request**:
> "Review my test code and suggest improvements"

**AI Response** (using MCP):

1. **Read test file** (File System MCP)

2. **Analyze code** (Sequential Thinking MCP):

```typescript
// Original code
test('My test', async ({ page }) => {
  await page.goto('https://staging.stratahire.com');
  await page.waitForTimeout(5000); // ❌ Hard-coded wait
  await page.click('button'); // ❌ Fragile selector
  await page.fill('#email', 'test@example.com'); // ❌ Hard-coded data
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); // ❌ Hard-coded wait
  expect(await page.locator('.success').isVisible()).toBe(true);
});
```

3. **Suggest improvements**:

```typescript
// Improved code
test('TC-L01: User login with valid credentials', async ({ authenticatedPage }) => {
  const loginPage = new LoginPage(authenticatedPage);
  const dashboardPage = new DashboardPage(authenticatedPage);
  
  // ✅ Use test data generator
  const email = TestDataGenerator.generateEmail('testuser');
  const password = testConfig.credentials.admin.password;
  
  // ✅ Use page object methods
  await loginPage.navigateToLogin();
  
  // ✅ Use condition-based waits
  await loginPage.page.waitForElement(
    loginPage.selectors.emailInput,
    { state: 'visible' }
  );
  
  // ✅ Use resilient elements
  await loginPage.login(email, password);
  
  // ✅ Wait for API response
  await loginPage.page.waitForAPIResponse('/api/auth/login', 30000, 200);
  
  // ✅ Verify with proper assertion
  expect(await dashboardPage.isUserLoggedIn()).toBe(true);
});
```

4. **List improvements**:
   - ✅ Use test fixtures for authentication
   - ✅ Use page objects for better maintainability
   - ✅ Use TestDataGenerator for unique data
   - ✅ Replace hard-coded waits with condition-based waits
   - ✅ Use resilient selectors (data-testid)
   - ✅ Wait for API responses instead of arbitrary timeouts
   - ✅ Add proper test ID and description

---

## Advanced Examples

### Example 11: Parallel Test Data Setup

**User Request**:
> "Create a utility to set up test data in parallel for multiple tests"

**AI Response**:

```typescript
// utils/data/parallel-data-setup.ts

import { Page } from '@playwright/test';
import { JobPostingPage } from '../../pages/job-posting-page';
import { ApplicantsPage } from '../../pages/applicants-page';
import { TestDataGenerator } from './test-data-generator';

export class ParallelDataSetup {
  static async setupJobPostings(page: Page, count: number): Promise<string[]> {
    const jobPostingPage = new JobPostingPage(page);
    const jobTitles: string[] = [];
    
    const promises = Array.from({ length: count }, async (_, i) => {
      const title = TestDataGenerator.generateJobTitle();
      jobTitles.push(title);
      
      await jobPostingPage.createJobPosting({
        title,
        department: 'Engineering',
        location: 'Remote'
      });
      
      return title;
    });
    
    await Promise.all(promises);
    return jobTitles;
  }
  
  static async setupApplicants(page: Page, jobTitle: string, count: number): Promise<string[]> {
    const applicantsPage = new ApplicantsPage(page);
    const applicantNames: string[] = [];
    
    const promises = Array.from({ length: count }, async (_, i) => {
      const name = TestDataGenerator.generateFullName();
      applicantNames.push(name);
      
      await applicantsPage.addApplicant({
        name,
        email: TestDataGenerator.generateEmail('applicant'),
        phone: TestDataGenerator.generatePhoneNumber(),
        jobTitle
      });
      
      return name;
    });
    
    await Promise.all(promises);
    return applicantNames;
  }
}
```

---

## Summary

These examples demonstrate the power of MCP integration:

- **Faster development**: AI generates boilerplate code
- **Better quality**: AI follows best practices
- **Easier debugging**: AI identifies and fixes issues
- **Automated refactoring**: AI updates multiple files
- **Knowledge retention**: AI remembers patterns

**Key Takeaway**: With MCP, you describe what you want, and the AI handles the implementation details using the appropriate tools (File System, Playwright, Git, etc.).

---

**Last Updated**: February 2026
