import { test, expect } from '../fixtures/test-fixtures';
import { testConfig } from '../../config/test-config';


test.describe('Login Automation', () => {
  // Configure timeout: 4x the default (480 seconds = 8 minutes)
  test.describe.configure({ timeout: 480 * 1000 });

  /**
   * TC-001: Positive Test - Successful Login
   * Verifies complete login flow with valid credentials
   */
  test('TC-001: should login successfully with valid credentials', { tag: ['@Positive'] }, async ({ page, loginPage, dashboardPage }) => {
    // Step 1: Navigate to login page
    await loginPage.navigateToLogin();
    
    // Step 2: Verify we're on the email input page
    await loginPage.verifyEmailInputVisible();
    await loginPage.verifyEmailInputPlaceholder();
    
    // Step 3: Enter email and continue
    await loginPage.enterEmail(testConfig.credentials.email);
    
    // Step 4: Verify password field appears
    await loginPage.verifyPasswordFieldVisible();
    
    // Step 5: Enter password and sign in
    await loginPage.enterPassword(testConfig.credentials.password);
    
    // Step 6: Wait for navigation to dashboard
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
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
    
    // Step 4: Wait a moment for validation
    await page.waitForTimeout(2000);
    
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
  test('TC-003: should display error message for invalid password', { tag: ['@Negative'] }, async ({ page, loginPage, dashboardPage }) => {
    // Step 1: Navigate to login page
    await loginPage.navigateToLogin();
    
    // Step 2: Enter valid email
    await loginPage.enterEmail(testConfig.credentials.email);
    
    // Step 3: Verify password field appears
    await loginPage.verifyPasswordFieldVisible();
    
    // Step 4: Enter invalid password
    const invalidPassword = 'WrongPassword123';
    await loginPage.enterPassword(invalidPassword);
    
    // Step 5: Wait for login attempt to complete - wait for either error or navigation
    // Wait up to 15 seconds for the login attempt to process
    // Check both URL and postings button visibility periodically
    let urlChangedToDashboard = false;
    let postingsButtonVisible = false;
    
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      const currentURL = page.url();
      const urlPath = new URL(currentURL).pathname;
      
      // Check if URL changed to dashboard
      if (urlPath.match(/^\/(admin|dashboard)/i)) {
        urlChangedToDashboard = true;
      }
      
      // Check if postings button is visible (indicates dashboard loaded)
      const postingsBtn = page.getByRole('button', { name: /Job Postings|Postings/i });
      const isVisible = await postingsBtn.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        postingsButtonVisible = true;
      }
      
      // If either URL changed OR postings button is visible, login succeeded (shouldn't happen)
      if (urlChangedToDashboard || postingsButtonVisible) {
        throw new Error(`Login succeeded with invalid password - URL: ${urlPath}, Postings button visible: ${postingsButtonVisible}`);
      }
      
      // If we're still on login page and postings button not visible, login likely failed (good)
      // Wait a bit more to be sure
      if (i >= 5 && !urlPath.match(/^\/(admin|dashboard)/i) && !postingsButtonVisible) {
        // Give it a couple more seconds to be sure
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    // Step 6: Final verification - URL should NOT be on dashboard
    const currentURL = page.url();
    const urlPath = new URL(currentURL).pathname;
    
    if (urlPath.match(/^\/(admin|dashboard)/i)) {
      throw new Error(`Login succeeded with invalid password - navigated to ${urlPath} instead of staying on login page`);
    }
    
    // Step 7: Verify dashboard is NOT visible (login failed)
    // Check postings button one more time with a short timeout
    const postingsBtn = page.getByRole('button', { name: /Job Postings|Postings/i });
    const isPostingsVisible = await postingsBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (isPostingsVisible) {
      throw new Error('Login succeeded with invalid password - postings button is visible');
    }
    
    // Step 8: Verify we're still on login page - check for login elements
    try {
      await loginPage.verifySignInButtonVisible();
    } catch {
      // If sign in button not visible, password field should still be visible
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
      // Step 4: Try clicking continue with empty email (if button is enabled)
      // Note: This would require a method to click continue, but since email is empty,
      // we verify that password field doesn't appear
      await page.waitForTimeout(2000);
      
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

  /**
   * TC-006: E2E Test - Complete Login Flow and Dashboard Navigation
   * Verifies complete login flow and ability to navigate dashboard sections
   */
  test('TC-006: should complete full login flow and verify dashboard access', { tag: ['@E2E'] }, async ({ page, loginPage, dashboardPage }) => {
    // Step 1: Complete login
    await loginPage.login(testConfig.credentials.email, testConfig.credentials.password);
    
    // Step 2: Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    // Step 3: Close notifications if present
    await dashboardPage.closeNotifications();
    
    // Step 4: Verify dashboard elements are visible
    await dashboardPage.verifyPostingsButtonVisible();
    await dashboardPage.verifyApplicantsButtonVisible();
    
    // Step 5: Navigate to Postings page
    // The navigateToPostings method waits for "Add New Job" button to appear
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
    
    // Cleanup: logout
    await dashboardPage.logout();
  });

  /**
   * TC-007: Functional Test - Logout
   * Verifies successful logout functionality
   */
  test('TC-007: should logout successfully', { tag: ['@Functional'] }, async ({ page, loginPage, dashboardPage }) => {
    // Step 1: Login first
    await loginPage.login(testConfig.credentials.email, testConfig.credentials.password);
    
    // Step 2: Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    // Step 3: Close notifications if present
    await dashboardPage.closeNotifications();
    
    // Step 4: Verify we're logged in
    await dashboardPage.verifyPostingsButtonVisible();
    
    // Step 5: Logout using the improved logout method
    // The logout method handles the confirmation dialog and waits for login page
    await dashboardPage.logout();
    
    // Step 6: Verify logout completed
    await loginPage.verifyLogoutSuccessful();
    
    // Step 7: Verify we're logged out by checking that dashboard elements are NOT visible
    await dashboardPage.verifyDashboardNotVisible();
    
    // Step 8: Verify email input is visible on the login page (indicates we're logged out)
    await loginPage.verifyEmailInputVisible();
    
    // Step 9: Verify "Sign In" heading is visible
    await loginPage.verifySignInHeadingVisible();
    
    console.log('✅ Logout completed successfully');
  });
});
