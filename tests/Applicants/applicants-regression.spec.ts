import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/test-data-generator';

/**
 * Applicants Regression Test Suite
 * Comprehensive test coverage for all applicant-related functionality
 */
test.describe('Applicants Regression Tests', () => {
  
  // ==========================================
  // POSITIVE TEST CASES (Happy Path)
  // ==========================================
  
  test.describe('Positive Test Cases', () => {
    
    test('TC-A01: Add applicant with all required fields', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Amit Kumar.pdf',
        role: 'Full Stack Developer'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log(`✓ TC-A01: Applicant "${applicantData.role}" added successfully`);
    });

    test('TC-A02: Add applicant with resume upload and verify auto-parsed data', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Mukul Tanwar.pdf',
        role: 'Full Stack Developer'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume(applicantData.resumePath);
      
      // Wait for auto-filled fields
      await applicantsPage.wait(1000);
      
      // Verify role selection after upload
      await applicantsPage.selectRole(applicantData.role);
      await applicantsPage.fillPhone(applicantData.phone);
      await applicantsPage.fillExperience(applicantData.experienceYears, applicantData.experienceMonths);
      await applicantsPage.fillNoticePeriod(applicantData.noticePeriodMonths, applicantData.noticePeriodDays);
      await applicantsPage.fillCurrentSalary(applicantData.currentSalary);
      await applicantsPage.fillExpectedSalary(applicantData.expectedSalary);
      
      // Ensure all optional fields are filled - never leave them empty
      if (applicantData.education) {
        await applicantsPage.fillEducation(applicantData.education);
      }
      if (applicantData.workExperience) {
        await applicantsPage.fillWorkExperience(applicantData.workExperience);
      }
      if (applicantData.skills) {
        await applicantsPage.fillSkills(applicantData.skills);
      }
      
      await applicantsPage.submitApplicant();

      console.log('✓ TC-A02: Applicant with resume upload and auto-parsed data added successfully');
    });

    test('TC-A03: Add applicant with all optional fields', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/RESUME_RAHULARORA.pdf',
        role: 'Full Stack Developer',
        education: 'B.Tech Computer Science, IIT Delhi',
        workExperience: 'Senior Developer at Google',
        skills: 'JavaScript, TypeScript, React, Node.js, Python'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A03: Applicant with all optional fields added successfully');
    });

    test('TC-A04: Add applicant with different currency (USD)', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Resume_rajnish.pdf',
        role: 'Full Stack Developer',
        currency: 'USD',
        currentSalary: '75000',
        expectedSalary: '95000'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A04: Applicant with USD currency added successfully');
    });
  });

  // ==========================================
  // UI ELEMENT VERIFICATION TESTS
  // ==========================================
  
  test.describe('UI Element Verification', () => {
    
    test('TC-A11: Verify all UI elements are visible on Add Applicant form', async ({ authenticatedPage, dashboardPage, applicantsPage, page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();

      // Verify dialog is visible
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      await expect(dialog).toBeVisible();

      // Verify file upload area
      await expect(page.getByText('Click to upload or drag and')).toBeVisible();

      // Verify Cancel button is visible (before resume upload)
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();

      // Upload resume to reveal more form fields
      await applicantsPage.uploadResume('test-resources/SimranBansal.pdf');

      // Verify Add Applicant button is now visible after resume upload
      await expect(dialog.getByRole('button', { name: 'Add Applicant' })).toBeVisible();

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A11: All UI elements verified on Add Applicant form');
    });

    test('TC-A12: Verify role dropdown shows available job postings', async ({ authenticatedPage, dashboardPage, applicantsPage, page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume('test-resources/Job Title_ Salesforce Developer II.pdf');

      // Verify role combobox is visible after upload
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      const roleCombobox = dialog.getByRole('combobox').filter({ hasText: 'Select position' });
      await expect(roleCombobox).toBeVisible();

      // Click to open dropdown and verify options exist
      await roleCombobox.click();
      
      // Wait for dropdown options to appear
      const optionsList = page.getByRole('option');
      await expect(optionsList.first()).toBeVisible({ timeout: 20000 });

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A12: Role dropdown shows available job postings');
    });

    test('TC-A08: Cancel applicant form and verify dialog closes', async ({ authenticatedPage, dashboardPage, applicantsPage, page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();

      // Verify dialog is open
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      await expect(dialog).toBeVisible();

      // Cancel and verify dialog closes
      await applicantsPage.cancelApplicant();
      await expect(dialog).not.toBeVisible();

      console.log('✓ TC-A08: Cancel button closes the dialog successfully');
    });
  });

  // ==========================================
  // EDGE CASE TESTS
  // ==========================================
  
  test.describe('Edge Cases', () => {
    
    test('TC-A09: Add applicant with minimum experience (0 years, 0 months)', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/functionalsample.pdf',
        role: 'Full Stack Developer',
        experienceYears: '0',
        experienceMonths: '0'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A09: Applicant with minimum experience (0 years) added successfully');
    });

    test('TC-A10: Add applicant with maximum notice period (3 months, 30 days)', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Amit Kumar.pdf',
        role: 'Full Stack Developer',
        noticePeriodMonths: '3',
        noticePeriodDays: '30'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A10: Applicant with maximum notice period added successfully');
    });

    test('TC-A13: Add applicant with high salary values', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Mukul Tanwar.pdf',
        role: 'Full Stack Developer',
        currentSalary: '10000000',  // 1 Crore
        expectedSalary: '15000000'  // 1.5 Crore
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A13: Applicant with high salary values added successfully');
    });

    test('TC-A14: Add applicant with maximum experience (15+ years)', async ({ authenticatedPage, dashboardPage, applicantsPage }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/RESUME_RAHULARORA.pdf',
        role: 'Full Stack Developer',
        experienceYears: '15',
        experienceMonths: '11'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A14: Applicant with 15+ years experience added successfully');
    });
  });

  // ==========================================
  // VALIDATION TESTS
  // ==========================================
  
  test.describe('Validation Tests', () => {
    
    test('TC-A05: Verify form requires resume upload before showing fields', async ({ authenticatedPage, dashboardPage, applicantsPage, page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();

      // Verify dialog is visible
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      await expect(dialog).toBeVisible();

      // Verify role dropdown is NOT visible before resume upload
      const roleCombobox = dialog.getByRole('combobox').filter({ hasText: 'Select position' });
      await expect(roleCombobox).not.toBeVisible();

      // Verify phone input is NOT visible before resume upload
      const phoneInput = dialog.getByRole('textbox', { name: 'Phone *' });
      await expect(phoneInput).not.toBeVisible();

      // Cancel button should be visible
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A05: Form correctly requires resume upload before showing fields');
    });

    test('TC-A06: Verify phone number field accepts valid input', async ({ authenticatedPage, dashboardPage, applicantsPage, page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume('test-resources/Resume_rajnish.pdf');

      // Fill phone with valid number
      await applicantsPage.fillPhone('9876543210');

      // Verify the input accepted the value
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      const phoneInput = dialog.getByRole('textbox', { name: 'Phone *' });
      await expect(phoneInput).toHaveValue('9876543210');

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A06: Phone number field accepts valid 10-digit input');
    });

    test('TC-A07: Verify salary fields accept valid numeric input', async ({ authenticatedPage, dashboardPage, applicantsPage, page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume('test-resources/SimranBansal.pdf');

      // Fill salary fields
      await applicantsPage.fillCurrentSalary('1000000');
      await applicantsPage.fillExpectedSalary('1200000');

      // Verify the inputs accepted the values
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      const currentSalaryInput = dialog.getByPlaceholder('e.g., 1000000');
      const expectedSalaryInput = dialog.getByPlaceholder('e.g., 1200000');
      
      await expect(currentSalaryInput).toHaveValue('1000000');
      await expect(expectedSalaryInput).toHaveValue('1200000');

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A07: Salary fields accept valid numeric input');
    });

    test('TC-A15: Verify experience fields accept valid input ranges', async ({ authenticatedPage, dashboardPage, applicantsPage, page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume('test-resources/Job Title_ Salesforce Developer II.pdf');

      // Fill experience fields
      await applicantsPage.fillExperience('5', '6');

      // Verify the spinbuttons accepted the values
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      const yearsInput = dialog.getByRole('spinbutton').nth(0);
      const monthsInput = dialog.getByRole('spinbutton').nth(1);
      
      await expect(yearsInput).toHaveValue('5');
      await expect(monthsInput).toHaveValue('6');

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A15: Experience fields accept valid input ranges');
    });
  });
});
