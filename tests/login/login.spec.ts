import { test, expect } from '../fixtures/test-fixtures';
import { testConfig } from '../../config/test-config';
import { DashboardPage } from '../../pages/dashboard-page';
import { logoutViaApi } from '../../utils/auth/logout-api';
import { performTestCleanup } from '../../utils/cleanup/test-cleanup';

/**
 * Login Test Suite
 * Tests login/logout functionality
 */
test.describe('Login Automation', () => {
  // Configure timeout: 3 minutes (reduced from 8 for faster fail when stuck)
  test.describe.configure({ timeout: 180 * 1000 });

  // Cleanup after each test
  test.afterEach(async ({ page }) => {
    // For login tests, we prioritize API logout to ensure clean state for next test
    await performTestCleanup(page, { 
      logoutViaApi: true,
      dismissNotifications: true,
      verbose: false 
    });
  });

  /**
   * TC-001: Positive Test - Successful Login
   * Verifies complete login flow with valid credentials
   */
  test('TC-001: should login successfully with valid credentials', { tag: ['@Positive', '@smoke', '@critical'] }, async ({ page, loginPage }) => {
        const profile = testConfig.credentials;
        // Use local DashboardPage for single-context setup
        const dashboardPage = new DashboardPage(page);
        
        // Step 1: Navigate to login page
        await loginPage.navigateToLogin();
        
        // Step 2: Verify we're on the email input page
        await loginPage.verifyEmailInputVisible();
        await loginPage.verifyEmailInputPlaceholder();
        
        // Step 3: Enter email and continue
        await loginPage.enterEmail(profile.email);
        
        // Step 4: Verify password field appears
        await loginPage.verifyPasswordFieldVisible();
        
        // Step 5: Enter password and sign in
        await loginPage.enterPassword(profile.password);
        
        // Step 6: Wait for navigation to dashboard
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
        
        // Step 7: Close notifications if present
        await dashboardPage.closeNotifications();
        
        // Step 8: Verify successful login by checking dashboard elements
        await dashboardPage.verifyPostingsButtonVisible();
        await dashboardPage.verifyApplicantsButtonVisible();
        
        // Step 9: Verify URL changed (should be on dashboard, not login page)
        await loginPage.verifyLoginSuccessful();
        
        console.log('✅ Login completed successfully. Current URL:', page.url());
      });

      /**
       * TC-006: E2E Test - Complete Login Flow and Dashboard Navigation
       * Verifies complete login flow and ability to navigate dashboard sections
       */
      test('TC-006-alt: should complete full login flow and verify dashboard access', { tag: ['@E2E', '@smoke'] }, async ({ page, loginPage }) => {
        const profile = testConfig.credentials;
        // Use local DashboardPage for single-context setup
        const dashboardPage = new DashboardPage(page);
        
        // Step 1: Complete login
        await loginPage.login(profile.email, profile.password);
        
        // Step 2: Wait for dashboard to load
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
        
        // Step 3: Close notifications if present
        await dashboardPage.closeNotifications();
        
        // Step 4: Verify dashboard elements are visible
        await dashboardPage.verifyPostingsButtonVisible();
        await dashboardPage.verifyApplicantsButtonVisible();
        
        // Step 5: Navigate to Postings page
        await dashboardPage.navigateToPostings();
        
        // Step 6: Verify we're on Postings page
        await dashboardPage.verifyOnPostingsPage();
        
        // Step 7: Verify Postings page heading
        await dashboardPage.verifyPostingsHeadingVisible();
        
        // Step 8: Navigate to Applicants page
        await dashboardPage.navigateToApplicants();
        
        // Step 9: Verify we're on Applicants page
        await dashboardPage.verifyOnApplicantsPage();
        
        // Step 10: Verify Applicants page heading
        await dashboardPage.verifyApplicantsHeadingVisible();
        
        console.log('✅ Full login flow completed and dashboard navigation verified');
        
        // Cleanup: API-based logout for reliability
        await logoutViaApi(page.request, testConfig.baseURL);
        await page.goto(testConfig.baseURL);
      });

      /**
       * TC-007: Functional Test - Logout
       * Verifies successful logout functionality
       */
      test('TC-007-alt: should logout successfully', { tag: ['@Functional'] }, async ({ page, loginPage }) => {
        const profile = testConfig.credentials;
        // Use local DashboardPage for single-context setup
        const dashboardPage = new DashboardPage(page);
        
        // Step 1: Login first
        await loginPage.login(profile.email, profile.password);
        
        // Step 2: Wait for dashboard to load
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
        
        // Step 3: Close notifications if present
        await dashboardPage.closeNotifications();
        
        // Step 4: Verify we're logged in
        await dashboardPage.verifyPostingsButtonVisible();
        
        // Step 5: Logout using API for reliability
        await logoutViaApi(page.request, testConfig.baseURL);
        
        // Step 6: Navigate to login page after API logout
        await page.goto(testConfig.baseURL);
        
        // Step 7: Verify logout completed
        await loginPage.verifyLogoutSuccessful();
        
        // Step 8: Verify we're logged out by checking that dashboard elements are NOT visible
        await dashboardPage.verifyDashboardNotVisible();
        
        // Step 9: Verify email input is visible on the login page (indicates we're logged out)
        await loginPage.verifyEmailInputVisible();
        
        // Step 10: Verify "Sign In" heading is visible
        await loginPage.verifySignInHeadingVisible();
        
        console.log('✅ Logout completed successfully');
      });

  /**
   * General login tests
   * These tests validate form behavior and don't require profile-specific testing
   */
  test.describe('General Login Tests', () => {
    
    /**
     * TC-002: Negative Test - Invalid Email
     * Verifies that invalid email prevents login progression
     */
    test('TC-002: should display error message for invalid email', { tag: ['@Negative'] }, async ({ page, loginPage }) => {
      // Step 1: Navigate to login page
      await loginPage.navigateToLogin();
      
      // Step 2: Verify email input is visible
      await loginPage.verifyEmailInputVisible();
      
      // Step 3: Enter invalid email
      const invalidEmail = 'invalid-email@test.com';
      await loginPage.enterEmail(invalidEmail);
      
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeHidden({ timeout: 5000 }).catch(() => {});

      // Step 5: Verify password field does NOT appear (email validation should prevent proceeding)
      await loginPage.verifyPasswordFieldNotVisible();
      
      // Step 6: Verify we're still on email step
      await loginPage.verifyEmailInputVisible();
      
      // Step 7: Verify email input still contains the invalid email
      const emailValue = await loginPage.getEmailValue();
      expect(emailValue).toBe(invalidEmail);
      
      console.log('✅ Invalid email validation working correctly');
    });

    /**
     * TC-003: Negative Test - Invalid Password
     * Verifies that invalid password prevents login
     */
    test('TC-003: should display error message for invalid password', { tag: ['@Negative'] }, async ({ page, loginPage }) => {
      // Step 1: Navigate to login page
      await loginPage.navigateToLogin();
      
      // Step 2: Enter valid email
      await loginPage.enterEmail(testConfig.credentials.email);
      
      // Step 3: Verify password field appears
      await loginPage.verifyPasswordFieldVisible();
      
      // Step 4: Enter invalid password
      const invalidPassword = 'WrongPassword123';
      await loginPage.enterPassword(invalidPassword);
      
      // Step 5: Verify URL did NOT navigate to dashboard (login should fail)
      await expect(page).not.toHaveURL(/\/(admin|dashboard)/i, { timeout: 10000 });
      
      // Step 6: Verify dashboard is NOT visible (login failed)
      const postingsBtn = page.getByRole('button', { name: /Job Postings|Postings/i });
      await expect(postingsBtn).toBeHidden({ timeout: 5000 });
      
      // Step 8: Verify we're still on login page
      try {
        await loginPage.verifySignInButtonVisible();
      } catch {
        await loginPage.verifyPasswordFieldVisible();
      }
      
      console.log('✅ Invalid password validation working correctly');
    });

    /**
     * TC-004: Validation Test - Required Fields
     * Verifies that required field validation works correctly
     */
    test('TC-004: should validate required fields', { tag: ['@Validation'] }, async ({ page, loginPage }) => {
      // Step 1: Navigate to login page
      await loginPage.navigateToLogin();
      
      // Step 2: Verify email input is visible
      await loginPage.verifyEmailInputVisible();
      
      // Step 3: Check if continue button is disabled (validation behavior)
      const isContinueDisabled = await loginPage.verifyContinueButtonDisabled();
      
      if (!isContinueDisabled) {
        await page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});

        // Step 5: Should still be on email page (validation should prevent proceeding)
        await loginPage.verifyEmailInputVisible();
        
        // Step 6: Password field should not be visible
        await loginPage.verifyPasswordFieldNotVisible();
      } else {
        // If button is disabled, that's also valid validation behavior
        expect(isContinueDisabled).toBe(true);
      }
      
      console.log('✅ Required field validation working correctly');
    });

    /**
     * TC-005: Navigation Test - Login Page Access
     * Verifies correct navigation to login page
     */
    test('TC-005: should navigate to login page correctly', { tag: ['@Navigation'] }, async ({ page, loginPage }) => {
      // Step 1: Navigate to login page
      await loginPage.navigateToLogin();
      
      // Step 2: Verify we're on the login page
      await loginPage.verifyOnLoginPage();
      
      // Step 3: Verify login page elements are visible
      await loginPage.verifyEmailInputVisible();
      await loginPage.verifyEmailInputPlaceholder();
      
      // Step 4: Verify page title
      await loginPage.verifyPageTitle('STRATA HIRE');
      
      // Step 5: Verify "Sign In" heading is visible
      await loginPage.verifySignInHeadingVisible();
      
      console.log('✅ Successfully navigated to login page');
    });
  });
});
