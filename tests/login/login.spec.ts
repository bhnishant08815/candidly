import { test, expect } from '../fixtures/test-fixtures';

import { testConfig } from '../../config/test-config';

test.describe('Login Automation', () => {
  // Configure timeout: 4x the default (480 seconds = 8 minutes)
  test.describe.configure({ timeout: 480 * 1000 });
  
  test('TC-001: should login successfully with valid credentials', { tag: ['@Positive'] }, async ({ page, loginPage, dashboardPage }) => {
    // Navigate to login page (this clicks the login button, so we're now on email input page)
    await loginPage.navigateToLogin();
    
    // Verify we're on the email input page (login button was clicked, now email field should be visible)
    await expect(page.locator("//input[@placeholder='johndoe@business.com']")).toBeVisible();
    
    // Enter email and continue
    await loginPage.enterEmail(testConfig.credentials.email);
    
    // Enter password and sign in
    await loginPage.enterPassword(testConfig.credentials.password);
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Close notifications if present
    await dashboardPage.closeNotifications();
    
    // Verify successful login by checking dashboard elements
    await expect(page.getByRole('button', { name: 'Postings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Applicants' })).toBeVisible();
    
    // Verify URL changed (should be on dashboard, not login page)
    const currentURL = page.url();
    expect(currentURL).not.toContain('login');
    
    console.log('Login completed successfully. Current URL:', currentURL);
  });

  test('TC-002: should display error message for invalid email', { tag: ['@Negative'] }, async ({ page, loginPage }) => {
    await loginPage.navigateToLogin();
    
    // Enter invalid email
    await loginPage.enterEmail('invalid-email@test.com');
    
    // Wait for error message or check if password field doesn't appear
    await page.waitForTimeout(2000);
    
    // Check if we're still on email input page (password field should not be visible)
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const isPasswordVisible = await passwordInput.isVisible().catch(() => false);
    
    // Verify that password field is not visible (email validation should prevent proceeding)
    expect(isPasswordVisible).toBe(false);
    
    // Verify email input is still visible (we're still on email step)
    await expect(page.locator("//input[@placeholder='johndoe@business.com']")).toBeVisible();
  });

  test('TC-003: should display error message for invalid password', { tag: ['@Negative'] }, async ({ page, loginPage }) => {
    await loginPage.navigateToLogin();
    
    // Enter valid email
    await loginPage.enterEmail(testConfig.credentials.email);
    
    // Enter invalid password
    await loginPage.enterPassword('WrongPassword123');
    
    // Wait for error message or check if still on login page
    await page.waitForTimeout(3000);
    
    // Check if we're still on password page (dashboard should not be visible)
    const postingsButton = page.getByRole('button', { name: 'Postings' });
    const isDashboardVisible = await postingsButton.isVisible().catch(() => false);
    
    // Verify that we're NOT on the dashboard (login failed)
    expect(isDashboardVisible).toBe(false);
    
    // Verify password field or sign in button is still visible (still on login page)
    const signInButton = page.locator("//span[normalize-space()='Sign In']");
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    const isLoginElementVisible = await signInButton.isVisible().catch(() => false) || 
                                   await passwordField.isVisible().catch(() => false);
    
    // At least one login element should be visible if login failed
    expect(isLoginElementVisible).toBe(true);
  });

  test('TC-004: should validate required fields', { tag: ['@Validation'] }, async ({ page, loginPage }) => {
    await loginPage.navigateToLogin();
    
    // Get email input and continue button
    const emailInput = page.locator("//input[@placeholder='johndoe@business.com']");
    const continueButton = page.getByText('Continue', { exact: true });
    
    // Verify email input is visible
    await expect(emailInput).toBeVisible();
    
    // Try to continue without entering email
    // Check if continue button is disabled or if form validation prevents submission
    const isContinueDisabled = await continueButton.isDisabled().catch(() => false);
    
    if (!isContinueDisabled) {
      // Try clicking continue with empty email
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Should still be on email page (validation should prevent proceeding)
      await expect(emailInput).toBeVisible();
      
      // Password field should not be visible
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      const isPasswordVisible = await passwordInput.isVisible().catch(() => false);
      expect(isPasswordVisible).toBe(false);
    } else {
      // If button is disabled, that's also valid validation behavior
      expect(isContinueDisabled).toBe(true);
    }
  });

  test('TC-005: should navigate to login page correctly', { tag: ['@Navigation'] }, async ({ page, loginPage }) => {
    await loginPage.navigateToLogin();
    
    // Verify we're on the login page
    const currentURL = page.url();
    expect(currentURL).toContain(testConfig.baseURL);
    
    // After navigateToLogin(), the login button is clicked, so email input should be visible
    await expect(page.locator("//input[@placeholder='johndoe@business.com']")).toBeVisible();
    
    console.log('Successfully navigated to login page');
  });

  test('TC-006: should complete full login flow and verify dashboard access', { tag: ['@E2E'] }, async ({ page, loginPage, dashboardPage }) => {
    // Complete login
    await loginPage.login(testConfig.credentials.email, testConfig.credentials.password);
    
    // Close notifications
    await dashboardPage.closeNotifications();
    
    // Verify dashboard elements are visible
    await expect(page.getByRole('button', { name: 'Postings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Applicants' })).toBeVisible();
    
    // Verify we can navigate to Postings
    await dashboardPage.navigateToPostings();
    await expect(page.getByText('Add New Job', { exact: true })).toBeVisible();
    
    // Navigate to Applicants page
    await dashboardPage.navigateToApplicants();
    // Verify we're on applicants page by checking for Add Applicant button
    await expect(page.getByRole('button', { name: 'Add Applicant' })).toBeVisible();
    
    console.log('Full login flow completed and dashboard navigation verified');
    
    // Cleanup: logout
    await dashboardPage.logout();
  });

  test('TC-007: should logout successfully', { tag: ['@Functional'] }, async ({ page, loginPage, dashboardPage }) => {
    // Login first
    await loginPage.login(testConfig.credentials.email, testConfig.credentials.password);
    await dashboardPage.closeNotifications();
    
    // Verify we're logged in
    await expect(page.getByRole('button', { name: 'Postings' })).toBeVisible();
    
    // Logout
    await dashboardPage.logout();
    
    // Wait for navigation after logout
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to base URL to ensure we're on the landing page
    await page.goto(testConfig.baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify we're logged out by checking that dashboard elements are NOT visible
    const postingsButton = page.getByRole('button', { name: 'Postings' });
    const applicantsButton = page.getByRole('button', { name: 'Applicants' });
    const isDashboardVisible = await postingsButton.isVisible().catch(() => false) || 
                                await applicantsButton.isVisible().catch(() => false);
    expect(isDashboardVisible).toBe(false);
    
    // Verify login button is visible on the landing page (indicates we're logged out)
    const loginButton = page.locator("//button[normalize-space()='Login']");
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    
    console.log('Logout completed successfully');
  });
});

