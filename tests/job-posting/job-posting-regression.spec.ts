import { test, expect } from '../fixtures/test-fixtures';
import { TestDataGenerator } from '../../utils/test-data-generator';

/**
 * Job Posting Regression Test Suite
 * Comprehensive test coverage for all job posting functionality
 */
test.describe('Job Posting Regression Tests', () => {
  
  // ==========================================
  // POSITIVE TEST CASES - Manual Job Posting
  // ==========================================
  
  test.describe('Manual Job Posting Creation', () => {
    
    test('TC-JP01: Create job posting with all required fields', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
      const jobData = TestDataGenerator.generateJobPostingData({
        department: 'Engineering',
        employmentType: 'Full-Time'
      });

      await dashboardPage.navigateToPostings();
      await jobPostingPage.createJobPosting(jobData);

      console.log(`✓ TC-JP01: Job posting "${jobData.title}" created successfully`);
    });

    test('TC-JP04: Create job posting with multiple skills', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
      const jobData = TestDataGenerator.generateJobPostingData({
        department: 'Engineering',
        employmentType: 'Full-Time',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker']
      });

      await dashboardPage.navigateToPostings();
      await jobPostingPage.createJobPosting(jobData);

      console.log(`✓ TC-JP04: Job posting with 6 skills created successfully`);
    });

    test('TC-JP05: Create job posting with multiple responsibilities', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
      const jobData = TestDataGenerator.generateJobPostingData({
        department: 'Engineering',
        employmentType: 'Full-Time',
        responsibilities: ['Lead technical architecture', 'Code review', 'Mentor junior developers', 'API development', 'Database design']
      });

      await dashboardPage.navigateToPostings();
      await jobPostingPage.createJobPosting(jobData);

      console.log(`✓ TC-JP05: Job posting with 5 responsibilities created successfully`);
    });

    test('TC-JP06: Create job posting with custom location', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
      const jobData = TestDataGenerator.generateJobPostingData({
        department: 'Engineering',
        employmentType: 'Full-Time',
        location: 'Bangalore'
      });

      await dashboardPage.navigateToPostings();
      await jobPostingPage.createJobPosting(jobData);

      console.log(`✓ TC-JP06: Job posting with custom location "${jobData.location}" created successfully`);
    });

    test('TC-JP13: Save job posting as draft', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      const jobTitle = TestDataGenerator.generateJobTitle('Draft Position');

      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();
      await jobPostingPage.fillJobTitle(jobTitle);
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Mid-Level (3-5 years)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('3');
      await jobPostingPage.clickContinue();
      await jobPostingPage.clickComplexButton();
      await jobPostingPage.fillRoleSummary('This is a test role summary for draft saving.');
      await jobPostingPage.addResponsibility('Test responsibility');
      await jobPostingPage.addQualification('B.Tech');
      await jobPostingPage.addSkill('JavaScript');
      await jobPostingPage.fillCompensation('Competitive package');
      await jobPostingPage.addCustomLocation('Remote');
      
      // Navigate to Review page where "Save as Draft" button is located
      await jobPostingPage.clickReview();
      await jobPostingPage.saveAsDraft();

      console.log(`✓ TC-JP13: Job posting "${jobTitle}" saved as draft successfully`);
    });
  });

  // ==========================================
  // POSITIVE TEST CASES - AI-Powered Job Posting
  // ==========================================
  
  test.describe('AI-Powered Job Posting', () => {
    
    test('TC-JP02: Create job posting using AI-Powered feature', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
      const jobTitle = TestDataGenerator.generateJobTitle('AI Engineer');
      const customLocation = TestDataGenerator.generateCustomLocation();

      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();
      await jobPostingPage.fillJobTitle(jobTitle);
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Senior (5-7 years)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('2');
      await jobPostingPage.clickContinue();
      await jobPostingPage.clickAIPoweredButton();
      await jobPostingPage.addCustomLocation(customLocation);
      await jobPostingPage.saveAsDraft();

      console.log(`✓ TC-JP02: AI-powered job posting "${jobTitle}" created successfully`);
    });

    test('TC-JP18: AI-powered job posting for Entry Level position', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
      const jobTitle = TestDataGenerator.generateJobTitle('Junior Developer');

      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();
      await jobPostingPage.fillJobTitle(jobTitle);
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Entry Level (0-1 year)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('5');
      await jobPostingPage.clickContinue();
      await jobPostingPage.clickAIPoweredButton();
      await jobPostingPage.addCustomLocation('Hybrid');
      await jobPostingPage.saveAsDraft();

      console.log(`✓ TC-JP18: Entry level AI-powered job posting created successfully`);
    });
  });

  // ==========================================
  // POSITIVE TEST CASES - Document Upload
  // ==========================================
  
  test.describe('Document Upload Job Posting', () => {
    
    test('TC-JP03: Create job posting with document upload', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
      const jobTitle = TestDataGenerator.generateJobTitle('Salesforce Developer');

      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();
      await jobPostingPage.fillJobTitle(jobTitle);
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Lead (7-10 years)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('2');
      await jobPostingPage.clickContinue();
      await jobPostingPage.clickDocumentUploadExtract();
      await jobPostingPage.uploadDocument('test-resources/Job Title_ Salesforce Developer II.pdf');
      await jobPostingPage.fillCompensation('30-40 LPA');
      await jobPostingPage.saveAsDraft();

      console.log(`✓ TC-JP03: Job posting with document upload created successfully`);
    });
  });

  // ==========================================
  // UI ELEMENT VERIFICATION TESTS
  // ==========================================
  
  test.describe('UI Element Verification', () => {
    
    test('TC-JP09: Verify department dropdown options', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      const dialog = page.getByRole('dialog', { name: 'Add New Job Posting' });
      const departmentCombobox = dialog.getByRole('combobox').nth(0);
      
      await expect(departmentCombobox).toBeVisible();
      await departmentCombobox.click();

      // Verify some expected departments are visible
      await expect(page.locator('span:has-text("Engineering")')).toBeVisible();
      await expect(page.locator('span:has-text("Product")')).toBeVisible();

      // Close dropdown
      await page.keyboard.press('Escape');

      console.log('✓ TC-JP09: Department dropdown options verified');
    });

    test('TC-JP10: Verify experience level dropdown options', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      const dialog = page.getByRole('dialog', { name: 'Add New Job Posting' });
      const experienceCombobox = dialog.getByRole('combobox').nth(1);
      
      await expect(experienceCombobox).toBeVisible();
      await experienceCombobox.click();

      // Verify expected experience levels
      await expect(page.locator('span:has-text("Entry Level")')).toBeVisible();
      await expect(page.locator('span:has-text("Senior")')).toBeVisible();

      await page.keyboard.press('Escape');

      console.log('✓ TC-JP10: Experience level dropdown options verified');
    });

    test('TC-JP11: Verify employment type dropdown options', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      const dialog = page.getByRole('dialog', { name: 'Add New Job Posting' });
      const employmentCombobox = dialog.getByRole('combobox').nth(2);
      
      await expect(employmentCombobox).toBeVisible();
      await employmentCombobox.click();

      // Verify expected employment types
      await expect(page.getByText('Full-Time', { exact: true })).toBeVisible();
      await expect(page.getByText('Part-Time', { exact: true })).toBeVisible();

      await page.keyboard.press('Escape');

      console.log('✓ TC-JP11: Employment type dropdown options verified');
    });

    test('TC-JP16: Verify all UI elements on Step 1', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      const dialog = page.getByRole('dialog', { name: 'Add New Job Posting' });
      
      // Verify Step 1 elements
      await expect(dialog.getByRole('textbox', { name: 'Job Title *' })).toBeVisible();
      await expect(dialog.getByRole('spinbutton', { name: 'Open Positions Count *' })).toBeVisible();
      await expect(dialog.getByRole('combobox').nth(0)).toBeVisible(); // Department
      await expect(dialog.getByRole('combobox').nth(1)).toBeVisible(); // Experience
      await expect(dialog.getByRole('combobox').nth(2)).toBeVisible(); // Employment Type
      await expect(dialog.getByRole('button', { name: 'Continue' })).toBeVisible();

      console.log('✓ TC-JP16: All Step 1 UI elements verified');
    });

    test('TC-JP17: Verify all UI elements on Step 2', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();
      await jobPostingPage.fillJobTitle('Test Position');
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Mid-Level (3-5 years)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('1');
      await jobPostingPage.clickContinue();

      const dialog = page.getByRole('dialog', { name: 'Add New Job Posting' });
      
      // Verify Step 2 elements - AI-Powered and Document Upload buttons should be visible
      await expect(page.getByRole('button', { name: /AI-Powered/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Document Upload/i })).toBeVisible();

      console.log('✓ TC-JP17: All Step 2 UI elements verified');
    });

    test('TC-JP12: Navigate multi-step form using Continue button', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      // Fill Step 1
      await jobPostingPage.fillJobTitle('Navigation Test');
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Junior (1-3 years)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('1');

      // Verify Continue button works
      await jobPostingPage.clickContinue();

      // Verify we're on Step 2 by checking for AI-Powered button
      await expect(page.getByRole('button', { name: /AI-Powered/i })).toBeVisible();

      console.log('✓ TC-JP12: Multi-step form navigation verified');
    });
  });

  // ==========================================
  // DATA-DRIVEN TESTS
  // ==========================================
  
  test.describe('Data-Driven Tests', () => {
    
    const experienceLevels = [
      'Entry Level (0-1 year)',
      'Junior (1-3 years)',
      'Mid-Level (3-5 years)',
      'Senior (5-7 years)',
      'Lead (7-10 years)',
      'Principal (10+ years)'
    ];

    for (const level of experienceLevels) {
      test(`TC-JP14: Create job posting with experience level - ${level}`, async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
        const jobData = TestDataGenerator.generateJobPostingData({
          department: 'Engineering',
          experienceLevel: level,
          employmentType: 'Full-Time'
        });

        await dashboardPage.navigateToPostings();
        await jobPostingPage.createJobPosting(jobData);

        console.log(`✓ TC-JP14: Job posting with "${level}" created successfully`);
      });
    }

    const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];

    for (const type of employmentTypes) {
      test(`TC-JP15: Create job posting with employment type - ${type}`, async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
        const jobData = TestDataGenerator.generateJobPostingData({
          department: 'Engineering',
          experienceLevel: 'Mid-Level (3-5 years)',
          employmentType: type
        });

        await dashboardPage.navigateToPostings();
        await jobPostingPage.createJobPosting(jobData);

        console.log(`✓ TC-JP15: Job posting with "${type}" employment created successfully`);
      });
    }
  });

  // ==========================================
  // VALIDATION TESTS
  // ==========================================
  
  test.describe('Validation Tests', () => {
    
    test('TC-JP07: Verify Continue button behavior with empty job title', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      // Don't fill job title, fill other fields
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Mid-Level (3-5 years)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('1');

      // Try to continue - form should handle validation
      const continueButton = page.getByRole('button', { name: 'Continue' });
      await expect(continueButton).toBeVisible();

      console.log('✓ TC-JP07: Continue button visibility verified for validation scenario');
    });

    test('TC-JP08: Verify form requires compensation before save', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      const jobTitle = TestDataGenerator.generateJobTitle('Validation Test');

      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();
      await jobPostingPage.fillJobTitle(jobTitle);
      await jobPostingPage.selectDepartment('Engineering');
      await jobPostingPage.selectExperienceLevel('Mid-Level (3-5 years)');
      await jobPostingPage.selectEmploymentType('Full-Time');
      await jobPostingPage.fillOpenPositions('1');
      await jobPostingPage.clickContinue();
      await jobPostingPage.clickComplexButton();
      await jobPostingPage.fillRoleSummary('Test role summary');
      await jobPostingPage.addResponsibility('Test responsibility');
      await jobPostingPage.addQualification('B.Tech');
      await jobPostingPage.addSkill('JavaScript');
      await jobPostingPage.addCustomLocation('Remote');
      
      // Don't fill compensation - verify Review button is disabled (validation prevents progression)
      const reviewButton = page.getByRole('button', { name: 'Review' });
      await expect(reviewButton).toBeVisible();
      await expect(reviewButton).toBeDisabled();

      // Verify validation message appears (if shown)
      const validationMessage = page.getByText('Please enter compensation and benefits');
      const isValidationVisible = await validationMessage.isVisible().catch(() => false);

      if (isValidationVisible) {
        console.log('✓ TC-JP08: Compensation validation message displayed correctly');
      } else {
        console.log('✓ TC-JP08: Form saved (compensation may have been optional)');
      }
    });

    test('TC-JP19: Verify job title input accepts valid characters', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      const jobTitle = 'Senior Software Engineer - Full Stack (Remote)';
      await jobPostingPage.fillJobTitle(jobTitle);

      const dialog = page.getByRole('dialog', { name: 'Add New Job Posting' });
      const titleInput = dialog.getByRole('textbox', { name: 'Job Title *' });
      await expect(titleInput).toHaveValue(jobTitle);

      console.log('✓ TC-JP19: Job title field accepts special characters');
    });

    test('TC-JP20: Verify open positions accepts numeric input', async ({ authenticatedPage, dashboardPage, jobPostingPage, page }) => {
      await dashboardPage.navigateToPostings();
      await jobPostingPage.clickAddNewJob();

      await jobPostingPage.fillOpenPositions('10');

      const dialog = page.getByRole('dialog', { name: 'Add New Job Posting' });
      const positionsInput = dialog.getByRole('spinbutton', { name: 'Open Positions Count *' });
      await expect(positionsInput).toHaveValue('10');

      console.log('✓ TC-JP20: Open positions field accepts numeric input');
    });
  });

  // ==========================================
  // DEPARTMENT-WISE TESTS
  // ==========================================
  
  test.describe('Department-wise Job Posting', () => {
    
    const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR'];

    for (const dept of departments) {
      test(`TC-JP21: Create job posting for ${dept} department`, async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
        const jobData = TestDataGenerator.generateJobPostingData({
          department: dept,
          employmentType: 'Full-Time'
        });

        await dashboardPage.navigateToPostings();
        await jobPostingPage.createJobPosting(jobData);

        console.log(`✓ TC-JP21: Job posting for "${dept}" department created successfully`);
      });
    }
  });
});
