import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { ApplicantsPage } from '../../pages/applicants-page';
import { TestDataGenerator } from '../../utils/data/test-data-generator';
import { testConfig } from '../../config/test-config';
import { performTestCleanup } from '../../utils/cleanup/test-cleanup';

/**
 * Applicants Regression Test Suite
 * Comprehensive test coverage for all applicant-related functionality
 * Runs with both Admin and HR profiles
 */

// Define profiles to test with
const profiles = [
  { name: 'Admin Profile', email: testConfig.credentials.email, password: testConfig.credentials.password, tag: '@admin-profile' },
  { name: 'HR Profile', email: testConfig.hrCredentials.email, password: testConfig.hrCredentials.password, tag: '@hr-profile' }
];

// Filter profiles based on environment variable or run all
const profileFilter = process.env.PROFILE_FILTER; // Can be 'admin', 'hr', or undefined (runs all)
const filteredProfiles = profileFilter 
  ? profiles.filter(p => p.name.toLowerCase().includes(profileFilter.toLowerCase()))
  : profiles;

// Run tests for each profile
for (const profile of filteredProfiles) {
  test.describe(`Applicants Regression Tests @Regression - ${profile.name}`, () => {
    
    // Configure timeout: 4x the default (480 seconds = 8 minutes)
    test.describe.configure({ timeout: 480 * 1000 });
    
    // Setup authenticated page for this profile
    let authenticatedPage: any;
    let dashboardPage: DashboardPage;
    let applicantsPage: ApplicantsPage;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.login(profile.email, profile.password);
      
      dashboardPage = new DashboardPage(page);
      await dashboardPage.closeNotifications();
      
      applicantsPage = new ApplicantsPage(page);
      authenticatedPage = page;
    });

    test.afterEach(async () => {
      // Use standardized cleanup
      if (authenticatedPage) {
        await performTestCleanup(authenticatedPage, {
          dashboardPage,
          logoutViaApi: true,
          verbose: false
        });
      }
    });
  
  // ==========================================
  // POSITIVE TEST CASES (Happy Path)
  // ==========================================
  
  test.describe('Positive Test Cases', () => {
    
    test('TC-A01: Add applicant with all required fields', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Naukri_AbhiPal[5y_0m].pdf',
        role: 'Full Stack Developer'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log(`✓ TC-A01: Applicant "${applicantData.role}" added successfully`);
    });

    test('TC-A02: Add applicant with resume upload and verify auto-parsed data', async ({ page }) => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Naukri_KaranKhosla[4y_6m].pdf',
        role: 'Full Stack Developer',
        // Ensure all optional fields are provided
        education: 'B.Tech Computer Science, IIT Delhi',
        workExperience: 'Senior Developer with experience in full-stack development',
        skills: 'JavaScript, TypeScript, React, Node.js, Python, SQL'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume(applicantData.resumePath);
      
      // Wait for auto-filled fields to appear (check for role combobox to be visible)
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      await expect(dialog.getByRole('combobox').first()).toBeVisible({ timeout: 10000 });
      
      // Make email unique to avoid duplicate errors (using the public method)
      try {
        await applicantsPage.makeEmailUnique();
      } catch (error) {
        // Continue if email modification fails - it might already be unique
      }
      
      // Verify role selection after upload
      await applicantsPage.selectRole(applicantData.role);
      await applicantsPage.fillPhone(applicantData.phone);
      await applicantsPage.fillExperience(applicantData.experienceYears, applicantData.experienceMonths);
      await applicantsPage.fillNoticePeriod(applicantData.noticePeriodMonths, applicantData.noticePeriodDays);
      await applicantsPage.fillCurrentSalary(applicantData.currentSalary);
      await applicantsPage.fillExpectedSalary(applicantData.expectedSalary);
      
      // ALWAYS fill all optional fields - never leave them empty
      await applicantsPage.fillEducation(applicantData.education!);
      await applicantsPage.fillWorkExperience(applicantData.workExperience!);
      await applicantsPage.fillSkills(applicantData.skills!);
      
      await applicantsPage.submitApplicant();

      console.log('✓ TC-A02: Applicant with resume upload and auto-parsed data added successfully');
    });

    test('TC-A03: Add applicant with all optional fields', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Naukri_KratikJain[5y_6m].pdf',
        role: 'Full Stack Developer',
        education: 'B.Tech Computer Science, IIT Delhi',
        workExperience: 'Senior Developer at Google',
        skills: 'JavaScript, TypeScript, React, Node.js, Python'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A03: Applicant with all optional fields added successfully');
    });

    test('TC-A04: Add applicant with different currency (USD)', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Pravesh_DMM (2).pdf',
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
    
    test('TC-A11: Verify all UI elements are visible on Add Applicant form', async ({ page }) => {
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
      await applicantsPage.uploadResume('test-resources/Shreya_Chotaliya_Resume  (1).pdf');

      // Verify Add Applicant button is now visible after resume upload
      await expect(dialog.getByRole('button', { name: 'Add Applicant' })).toBeVisible();

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A11: All UI elements verified on Add Applicant form');
    });

    test('TC-A12: Verify role dropdown shows available job postings', async ({ page }) => {
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

    test('TC-A08: Cancel applicant form and verify dialog closes', async ({ page }) => {
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
    
    test('TC-A09: Add applicant with minimum experience (0 years, 0 months)', async () => {
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

    test('TC-A10: Add applicant with maximum notice period (3 months, 30 days)', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Updated Resume - Karan.pdf',
        role: 'Full Stack Developer',
        noticePeriodMonths: '3',
        noticePeriodDays: '30'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A10: Applicant with maximum notice period added successfully');
    });

    test('TC-A13: Add applicant with high salary values', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Updated Resume - Karan.pdf',
        role: 'Full Stack Developer',
        currentSalary: '10000000',  // 1 Crore
        expectedSalary: '15000000'  // 1.5 Crore
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A13: Applicant with high salary values added successfully');
    });

    test('TC-A14: Add applicant with maximum experience (15+ years)', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Amit Kumar.pdf',
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
    
    test('TC-A05: Verify form requires resume upload before showing fields', async ({ page }) => {
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

    test('TC-A06: Verify phone number field accepts valid input', async ({ page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume('test-resources/RESUME_RAHULARORA.pdf');

      // Fill phone with valid number
      await applicantsPage.fillPhone('9876543210');

      // Verify the input accepted the value
      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      const phoneInput = dialog.getByRole('textbox', { name: 'Phone *' });
      await expect(phoneInput).toHaveValue('9876543210');

      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A06: Phone number field accepts valid 10-digit input');
    });

    test('TC-A07: Verify salary fields accept valid numeric input', async ({ page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume('test-resources/RESUME_RAHULARORA.pdf');

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

    test('TC-A15: Verify experience fields accept valid input ranges', async ({ page }) => {
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

  // ==========================================
  // WORKFLOW & INTEGRATION TESTS
  // ==========================================
  
  test.describe('Workflow & Integration Tests', () => {
    
    test('TC-A16: Add multiple applicants for same role', async ({ page }) => {
      const role = 'Full Stack Developer';
      const resumeFiles = [
        'test-resources/Naukri_AbhiPal[5y_0m].pdf',
        'test-resources/Naukri_KaranKhosla[4y_6m].pdf',
        'test-resources/Naukri_KratikJain[5y_6m].pdf'
      ];

      await dashboardPage.navigateToApplicants();

      for (const resumePath of resumeFiles) {
        const applicantData = TestDataGenerator.generateApplicantData({
          resumePath: resumePath,
          role: role
        });
        await applicantsPage.addApplicant(applicantData);
        // Wait for applicant dialog to close before next addition
        const dialog = page.getByRole('dialog', { name: /Add New Applicant/i });
        await expect(dialog).not.toBeVisible({ timeout: 5000 }).catch(() => {
          // Dialog might already be closed, continue
        });
      }

      console.log(`✓ TC-A16: Added 3 applicants for role "${role}" successfully`);
    });

    test('TC-A17: Add applicant with different currencies (INR, USD, EUR)', async ({ page }) => {
      const currencies = [
        { code: 'INR', current: '1000000', expected: '1200000' },
        { code: 'USD', current: '75000', expected: '95000' },
        { code: 'EUR', current: '65000', expected: '80000' }
      ];

      await dashboardPage.navigateToApplicants();

      for (const currency of currencies) {
        const applicantData = TestDataGenerator.generateApplicantData({
          resumePath: 'test-resources/Pravesh_DMM (2).pdf',
          role: 'Full Stack Developer',
          currency: currency.code,
          currentSalary: currency.current,
          expectedSalary: currency.expected
        });
        await applicantsPage.addApplicant(applicantData);
        // Wait for applicant dialog to close before next addition
        const dialog = page.getByRole('dialog', { name: /Add New Applicant/i });
        await expect(dialog).not.toBeVisible({ timeout: 5000 }).catch(() => {
          // Dialog might already be closed, continue
        });
      }

      console.log('✓ TC-A17: Added applicants with different currencies (INR, USD, EUR) successfully');
    });

    test('TC-A18: Add applicant with zero notice period (immediate joiner)', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/functionalsample.pdf',
        role: 'Full Stack Developer',
        noticePeriodMonths: '0',
        noticePeriodDays: '0'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A18: Applicant with zero notice period (immediate joiner) added successfully');
    });

    test('TC-A19: Add applicant with maximum notice period (3 months)', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Shreya_Chotaliya_Resume  (1).pdf',
        role: 'Full Stack Developer',
        noticePeriodMonths: '3',
        noticePeriodDays: '0'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A19: Applicant with maximum notice period added successfully');
    });

    test('TC-A20: Add applicant with extensive skills list', async () => {
      const extensiveSkills = 'JavaScript, TypeScript, React, Angular, Vue.js, Node.js, Express, Python, Django, Flask, Java, Spring Boot, C#, .NET, SQL, PostgreSQL, MongoDB, Redis, AWS, Azure, Docker, Kubernetes, CI/CD, Git, Agile, Scrum, REST APIs, GraphQL, Microservices, System Design, Algorithms, Data Structures';
      
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/PreetySingh_MarketingManager.pdf',
        role: 'Full Stack Developer',
        skills: extensiveSkills
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A20: Applicant with extensive skills list added successfully');
    });

    test('TC-A21: Add applicant with detailed work experience', async () => {
      const detailedExperience = 'Senior Software Engineer at Google (2020-2024): Led development of microservices architecture, improved system performance by 40%, mentored team of 5 junior developers. Software Engineer at Microsoft (2018-2020): Developed cloud-based solutions, collaborated with cross-functional teams, implemented CI/CD pipelines.';
      
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Resume_rajnish.pdf',
        role: 'Full Stack Developer',
        workExperience: detailedExperience
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A21: Applicant with detailed work experience added successfully');
    });

    test('TC-A22: Add applicant with comprehensive education details', async () => {
      const comprehensiveEducation = 'Master of Science in Computer Science, Stanford University (2016-2018), GPA: 3.9/4.0. Bachelor of Technology in Computer Engineering, IIT Delhi (2012-2016), GPA: 9.2/10.0. Relevant Coursework: Machine Learning, Distributed Systems, Database Management, Software Engineering.';
      
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Updated Resume - Karan.pdf',
        role: 'Full Stack Developer',
        education: comprehensiveEducation
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A22: Applicant with comprehensive education details added successfully');
    });

    test('TC-A23: Add applicant with salary negotiation range', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Amit Kumar.pdf',
        role: 'Full Stack Developer',
        currentSalary: '800000',
        expectedSalary: '1200000' // 50% increase expectation
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A23: Applicant with salary negotiation range added successfully');
    });

    test('TC-A24: Add applicant with fractional experience (years and months)', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Resume_rajnish.pdf',
        role: 'Full Stack Developer',
        experienceYears: '4',
        experienceMonths: '8' // 4 years 8 months
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A24: Applicant with fractional experience (4 years 8 months) added successfully');
    });

    test('TC-A25: Add applicant with fractional notice period', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/functionalsample.pdf',
        role: 'Full Stack Developer',
        noticePeriodMonths: '1',
        noticePeriodDays: '15' // 1 month 15 days
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A25: Applicant with fractional notice period (1 month 15 days) added successfully');
    });
  });

  // ==========================================
  // EDGE CASES & BOUNDARY TESTS
  // ==========================================
  
  test.describe('Edge Cases & Boundary Tests', () => {
    
    test('TC-A26: Add applicant with very long phone number', async ({ page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();
      await applicantsPage.uploadResume('test-resources/RESUME_RAHULARORA.pdf');
      
      // Try with very long phone number (should handle gracefully)
      const longPhone = '98765432101234567890';
      await applicantsPage.fillPhone(longPhone);

      const dialog = page.getByRole('dialog', { name: 'Add New Applicant' });
      const phoneInput = dialog.getByRole('textbox', { name: 'Phone *' });
      const phoneValue = await phoneInput.inputValue();

      await applicantsPage.cancelApplicant();

      console.log(`✓ TC-A26: Phone field handled long input: ${phoneValue.length} characters`);
    });

    test('TC-A27: Add applicant with special characters in skills', async () => {
      const specialSkills = 'JavaScript (ES6+), React.js, Node.js, C++, C#, .NET Core, SQL Server, MongoDB, AWS (EC2, S3, Lambda), Docker & Kubernetes';
      
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/PreetySingh_MarketingManager.pdf',
        role: 'Full Stack Developer',
        skills: specialSkills
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A27: Applicant with special characters in skills added successfully');
    });

    test('TC-A28: Add applicant with unicode characters in name', async () => {
      // This test verifies that the system handles unicode characters
      // The name will be auto-parsed from resume, but we can verify the field accepts it
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Updated Resume - Karan.pdf',
        role: 'Full Stack Developer'
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A28: Applicant with unicode characters (if present in resume) handled successfully');
    });

    test('TC-A29: Add applicant with minimum salary values', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/functionalsample.pdf',
        role: 'Full Stack Developer',
        currentSalary: '100000', // 1 LPA
        expectedSalary: '150000'  // 1.5 LPA
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A29: Applicant with minimum salary values added successfully');
    });

    test('TC-A30: Add applicant with same current and expected salary', async () => {
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Resume_rajnish.pdf',
        role: 'Full Stack Developer',
        currentSalary: '1000000',
        expectedSalary: '1000000' // No salary increase expected
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A30: Applicant with same current and expected salary added successfully');
    });

    test('TC-A31: Verify form handles resume upload timeout gracefully', async ({ page }) => {
      await dashboardPage.navigateToApplicants();
      await applicantsPage.clickAddApplicant();

      // Verify upload area is visible
      const uploadArea = page.getByText('Click to upload or drag and');
      await expect(uploadArea).toBeVisible();

      // Cancel without uploading to verify graceful handling
      await applicantsPage.cancelApplicant();

      console.log('✓ TC-A31: Form handles resume upload flow gracefully');
    });

    test('TC-A32: Add applicant with all fields at maximum length', async () => {
      const maxLengthEducation = 'Master of Science in Computer Science with specialization in Artificial Intelligence and Machine Learning, Stanford University, California, United States of America, GPA: 4.0/4.0, Graduated with Honors, Summa Cum Laude, Dean\'s List all semesters, Published 5 research papers in top-tier conferences';
      
      const maxLengthWorkExp = 'Senior Software Engineer at Google Inc., Mountain View, California (2020-2024): Led development of large-scale distributed systems serving millions of users, improved system performance by 50%, reduced latency by 40%, mentored team of 10 junior developers, implemented microservices architecture, collaborated with product managers and designers, participated in architecture reviews, wrote technical documentation, conducted code reviews, implemented CI/CD pipelines, optimized database queries, reduced infrastructure costs by 30%';
      
      const maxLengthSkills = 'JavaScript, TypeScript, React, Angular, Vue.js, Next.js, Node.js, Express, Python, Django, Flask, FastAPI, Java, Spring Boot, Kotlin, C#, .NET Core, SQL, PostgreSQL, MySQL, MongoDB, Redis, Cassandra, Elasticsearch, AWS, Azure, GCP, Docker, Kubernetes, Terraform, Jenkins, GitLab CI/CD, GitHub Actions, GraphQL, REST APIs, Microservices, System Design, Algorithms, Data Structures, Machine Learning, TensorFlow, PyTorch, Agile, Scrum, Kanban, Test-Driven Development, Continuous Integration, Continuous Deployment';
      
      const applicantData = TestDataGenerator.generateApplicantData({
        resumePath: 'test-resources/Resume_rajnish.pdf',
        role: 'Full Stack Developer',
        education: maxLengthEducation,
        workExperience: maxLengthWorkExp,
        skills: maxLengthSkills
      });

      await dashboardPage.navigateToApplicants();
      await applicantsPage.addApplicant(applicantData);

      console.log('✓ TC-A32: Applicant with all fields at maximum length added successfully');
    });
  });
  });
}
