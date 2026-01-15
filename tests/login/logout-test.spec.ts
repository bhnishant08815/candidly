import { test, expect } from '../fixtures/test-fixtures';
import { testConfig } from '../../config/test-config';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';

test.describe('Logout Test', () => {
  /**
   * Test using manual page object creation
   * This approach gives you full control over the login/logout flow
   */
  test('should login and logout successfully (manual page objects)', async ({ page }) => {
    // Create page objects manually using the same page instance
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login
    await loginPage.login(testConfig.credentials.email, testConfig.credentials.password);
    
    // Close notifications if present
    await dashboardPage.closeNotifications();
    
    // Verify we're logged in
    await expect(page.getByRole('button', { name: 'Postings' })).toBeVisible({ timeout: 15000 });
    
    // Logout - this now handles everything automatically including:
    // - Finding profile button (by initials "NB", first letter, or name)
    // - Opening the menu
    // - Clicking logout button
    // - Handling confirmation dialogs if present
    // - Verifying logout completion
    await dashboardPage.logout();
    
    // Verify logout completed - check for login page
    await expect(page.locator("//input[@placeholder='johndoe@business.com']")).toBeVisible({ timeout: 10000 });
    
    console.log('Login and logout completed successfully');
  });

  /**
   * Alternative: Using fixtures (note: dashboardPage fixture auto-authenticates)
   * This version uses the authenticatedPage fixture, so login is automatic
   */
  test('should logout successfully (using fixtures)', async ({ dashboardPage, page }) => {
    // Note: dashboardPage fixture automatically logs in via authenticatedPage
    // So we just need to verify we're logged in and then logout
    
    // Close notifications if present
    await dashboardPage.closeNotifications();
    
    // Verify we're logged in
    await expect(page.getByRole('button', { name: 'Postings' })).toBeVisible({ timeout: 15000 });
    
    // Logout - handles everything automatically
    await dashboardPage.logout();
    
    // Verify logout completed - check for login page
    await expect(page.locator("//input[@placeholder='johndoe@business.com']")).toBeVisible({ timeout: 10000 });
    
    console.log('Logout completed successfully');
  });
});

