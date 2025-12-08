# Regression Test Documentation

## Overview

This document provides comprehensive documentation for the regression test suites covering **Job Posting** and **Applicants** functionality in the Candidly application. These test suites ensure that all critical features continue to work correctly after code changes.

## Test Framework

- **Framework**: Playwright
- **Language**: TypeScript
- **Test Files**:
  - `tests/job-posting/job-posting-regression.spec.ts`
  - `tests/Applicants/applicants-regression.spec.ts`

## Table of Contents

1. [Job Posting Regression Tests](#job-posting-regression-tests)
2. [Applicants Regression Tests](#applicants-regression-tests)
3. [Test Execution](#test-execution)

---

## Job Posting Regression Tests

### Test Suite Overview

The Job Posting regression test suite covers comprehensive testing of job posting creation functionality, including manual creation, AI-powered creation, document upload, UI element verification, validation, and data-driven scenarios.

**Total Test Cases**: 21 test cases organized into 6 categories

---

### 1. Manual Job Posting Creation

#### TC-JP01: Create job posting with all required fields
- **Description**: Verifies that a job posting can be created successfully with all mandatory fields filled.
- **Test Data**: 
  - Department: Engineering
  - Employment Type: Full-Time
  - Other fields: Auto-generated
- **Expected Result**: Job posting is created successfully.

#### TC-JP04: Create job posting with multiple skills
- **Description**: Tests job posting creation with multiple skills (6 skills).
- **Test Data**:
  - Skills: JavaScript, TypeScript, React, Node.js, AWS, Docker
  - Department: Engineering
  - Employment Type: Full-Time
- **Expected Result**: Job posting with 6 skills is created successfully.

#### TC-JP05: Create job posting with multiple responsibilities
- **Description**: Tests job posting creation with multiple responsibilities (5 responsibilities).
- **Test Data**:
  - Responsibilities: Lead technical architecture, Code review, Mentor junior developers, API development, Database design
  - Department: Engineering
  - Employment Type: Full-Time
- **Expected Result**: Job posting with 5 responsibilities is created successfully.

#### TC-JP06: Create job posting with custom location
- **Description**: Verifies job posting creation with a custom location.
- **Test Data**:
  - Location: Bangalore
  - Department: Engineering
  - Employment Type: Full-Time
- **Expected Result**: Job posting with custom location is created successfully.

#### TC-JP13: Save job posting as draft
- **Description**: Tests the draft saving functionality for job postings.
- **Test Data**: Complete job posting data with all fields filled.
- **Expected Result**: Job posting is saved as draft successfully.

---

### 2. AI-Powered Job Posting

#### TC-JP02: Create job posting using AI-Powered feature
- **Description**: Verifies that AI-powered job posting creation works correctly.
- **Test Data**:
  - Job Title: AI Engineer (auto-generated)
  - Department: Engineering
  - Experience Level: Senior (5-7 years)
  - Employment Type: Full-Time
  - Open Positions: 2
  - Custom Location: Auto-generated
- **Expected Result**: AI-powered job posting is created successfully.

#### TC-JP18: AI-powered job posting for Entry Level position
- **Description**: Tests AI-powered job posting creation for entry-level positions.
- **Test Data**:
  - Job Title: Junior Developer (auto-generated)
  - Department: Engineering
  - Experience Level: Entry Level (0-1 year)
  - Employment Type: Full-Time
  - Open Positions: 5
  - Location: Hybrid
- **Expected Result**: Entry level AI-powered job posting is created successfully.

---

### 3. Document Upload Job Posting

#### TC-JP03: Create job posting with document upload
- **Description**: Verifies job posting creation using document upload and extraction feature.
- **Test Data**:
  - Job Title: Salesforce Developer (auto-generated)
  - Department: Engineering
  - Experience Level: Lead (7-10 years)
  - Employment Type: Full-Time
  - Open Positions: 2
  - Document: `test-resources/Job Title_ Salesforce Developer II.pdf`
  - Compensation: 30-40 LPA
- **Expected Result**: Job posting with document upload is created successfully.

---

### 4. UI Element Verification

#### TC-JP09: Verify department dropdown options
- **Description**: Verifies that the department dropdown displays all expected options.
- **Verification Points**:
  - Department combobox is visible
  - Options include: Engineering, Product, etc.
- **Expected Result**: Department dropdown options are verified.

#### TC-JP10: Verify experience level dropdown options
- **Description**: Verifies that the experience level dropdown displays all expected options.
- **Verification Points**:
  - Experience level combobox is visible
  - Options include: Entry Level, Senior, etc.
- **Expected Result**: Experience level dropdown options are verified.

#### TC-JP11: Verify employment type dropdown options
- **Description**: Verifies that the employment type dropdown displays all expected options.
- **Verification Points**:
  - Employment type combobox is visible
  - Options include: Full-Time, Part-Time, etc.
- **Expected Result**: Employment type dropdown options are verified.

#### TC-JP12: Navigate multi-step form using Continue button
- **Description**: Verifies navigation between form steps using the Continue button.
- **Test Steps**:
  1. Fill Step 1 fields
  2. Click Continue
  3. Verify Step 2 is displayed (AI-Powered button visible)
- **Expected Result**: Multi-step form navigation works correctly.

#### TC-JP16: Verify all UI elements on Step 1
- **Description**: Verifies all UI elements are present and visible on Step 1 of the job posting form.
- **Verification Points**:
  - Job Title input field
  - Open Positions Count input
  - Department combobox
  - Experience Level combobox
  - Employment Type combobox
  - Continue button
- **Expected Result**: All Step 1 UI elements are verified.

#### TC-JP17: Verify all UI elements on Step 2
- **Description**: Verifies all UI elements are present and visible on Step 2 of the job posting form.
- **Verification Points**:
  - AI-Powered button
  - Document Upload button
- **Expected Result**: All Step 2 UI elements are verified.

---

### 5. Data-Driven Tests

#### TC-JP14: Create job posting with different experience levels
- **Description**: Data-driven test that creates job postings for all available experience levels.
- **Test Data**: Tests all 6 experience levels:
  - Entry Level (0-1 year)
  - Junior (1-3 years)
  - Mid-Level (3-5 years)
  - Senior (5-7 years)
  - Lead (7-10 years)
  - Principal (10+ years)
- **Expected Result**: Job postings are created successfully for each experience level.

#### TC-JP15: Create job posting with different employment types
- **Description**: Data-driven test that creates job postings for all available employment types.
- **Test Data**: Tests all 4 employment types:
  - Full-Time
  - Part-Time
  - Contract
  - Internship
- **Expected Result**: Job postings are created successfully for each employment type.

#### TC-JP21: Create job posting for different departments
- **Description**: Data-driven test that creates job postings for all available departments.
- **Test Data**: Tests all 6 departments:
  - Engineering
  - Product
  - Design
  - Marketing
  - Sales
  - HR
- **Expected Result**: Job postings are created successfully for each department.

---

### 6. Validation Tests

#### TC-JP07: Verify Continue button behavior with empty job title
- **Description**: Verifies form validation when job title is empty.
- **Test Steps**:
  1. Fill all fields except job title
  2. Verify Continue button behavior
- **Expected Result**: Form validation is handled correctly.

#### TC-JP08: Verify form requires compensation before save
- **Description**: Verifies that compensation field is required before saving.
- **Test Steps**:
  1. Fill all fields except compensation
  2. Attempt to save as draft
  3. Verify validation message appears
- **Expected Result**: Validation message "Please enter compensation and benefits" is displayed.

#### TC-JP19: Verify job title input accepts valid characters
- **Description**: Verifies that job title field accepts special characters and various formats.
- **Test Data**: "Senior Software Engineer - Full Stack (Remote)"
- **Expected Result**: Job title field accepts special characters correctly.

#### TC-JP20: Verify open positions accepts numeric input
- **Description**: Verifies that open positions field accepts numeric values.
- **Test Data**: 10
- **Expected Result**: Open positions field accepts numeric input correctly.

---

## Applicants Regression Tests

### Test Suite Overview

The Applicants regression test suite covers comprehensive testing of applicant management functionality, including adding applicants, resume upload, auto-parsing, UI verification, edge cases, and validation scenarios.

**Total Test Cases**: 15 test cases organized into 4 categories

---

### 1. Positive Test Cases (Happy Path)

#### TC-A01: Add applicant with all required fields
- **Description**: Verifies that an applicant can be added successfully with all mandatory fields.
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
  - Other required fields: Auto-generated
- **Expected Result**: Applicant is added successfully.

#### TC-A02: Add applicant with resume upload and verify auto-parsed data
- **Description**: Tests applicant addition with resume upload and verifies that data is auto-parsed from the resume.
- **Test Steps**:
  1. Upload resume
  2. Verify role selection appears after upload
  3. Fill remaining required fields
  4. Submit
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
- **Expected Result**: Applicant with auto-parsed data is added successfully.

#### TC-A03: Add applicant with all optional fields
- **Description**: Tests applicant addition with all optional fields filled.
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
  - Education: B.Tech Computer Science, IIT Delhi
  - Work Experience: Senior Developer at Google
  - Skills: JavaScript, TypeScript, React, Node.js, Python
- **Expected Result**: Applicant with all optional fields is added successfully.

#### TC-A04: Add applicant with different currency (USD)
- **Description**: Tests applicant addition with USD currency instead of default INR.
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
  - Currency: USD
  - Current Salary: 75000
  - Expected Salary: 95000
- **Expected Result**: Applicant with USD currency is added successfully.

---

### 2. UI Element Verification

#### TC-A11: Verify all UI elements are visible on Add Applicant form
- **Description**: Verifies all UI elements are present and visible on the Add Applicant form.
- **Verification Points**:
  - Dialog is visible
  - File upload area is visible
  - Cancel button is visible (before resume upload)
  - Add Applicant button is visible (after resume upload)
- **Expected Result**: All UI elements are verified on Add Applicant form.

#### TC-A12: Verify role dropdown shows available job postings
- **Description**: Verifies that the role dropdown displays available job postings after resume upload.
- **Test Steps**:
  1. Upload resume
  2. Verify role combobox is visible
  3. Click to open dropdown
  4. Verify options exist
- **Expected Result**: Role dropdown shows available job postings.

#### TC-A08: Cancel applicant form and verify dialog closes
- **Description**: Verifies that clicking Cancel button closes the dialog.
- **Test Steps**:
  1. Open Add Applicant dialog
  2. Verify dialog is visible
  3. Click Cancel
  4. Verify dialog closes
- **Expected Result**: Cancel button closes the dialog successfully.

---

### 3. Edge Cases

#### TC-A09: Add applicant with minimum experience (0 years, 0 months)
- **Description**: Tests applicant addition with minimum experience values.
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
  - Experience Years: 0
  - Experience Months: 0
- **Expected Result**: Applicant with minimum experience is added successfully.

#### TC-A10: Add applicant with maximum notice period (3 months, 30 days)
- **Description**: Tests applicant addition with maximum notice period values.
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
  - Notice Period Months: 3
  - Notice Period Days: 30
- **Expected Result**: Applicant with maximum notice period is added successfully.

#### TC-A13: Add applicant with high salary values
- **Description**: Tests applicant addition with very high salary values.
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
  - Current Salary: 10000000 (1 Crore)
  - Expected Salary: 15000000 (1.5 Crore)
- **Expected Result**: Applicant with high salary values is added successfully.

#### TC-A14: Add applicant with maximum experience (15+ years)
- **Description**: Tests applicant addition with maximum experience values.
- **Test Data**:
  - Resume: `test-resources/functionalsample.pdf`
  - Role: Full Stack Developer
  - Experience Years: 15
  - Experience Months: 11
- **Expected Result**: Applicant with 15+ years experience is added successfully.

---

### 4. Validation Tests

#### TC-A05: Verify form requires resume upload before showing fields
- **Description**: Verifies that form fields are hidden until resume is uploaded.
- **Verification Points**:
  - Role dropdown is NOT visible before resume upload
  - Phone input is NOT visible before resume upload
  - Cancel button is visible
- **Expected Result**: Form correctly requires resume upload before showing fields.

#### TC-A06: Verify phone number field accepts valid input
- **Description**: Verifies that phone number field accepts valid 10-digit input.
- **Test Data**: 9876543210
- **Expected Result**: Phone number field accepts valid 10-digit input.

#### TC-A07: Verify salary fields accept valid numeric input
- **Description**: Verifies that salary fields accept valid numeric values.
- **Test Data**:
  - Current Salary: 1000000
  - Expected Salary: 1200000
- **Expected Result**: Salary fields accept valid numeric input.

#### TC-A15: Verify experience fields accept valid input ranges
- **Description**: Verifies that experience fields (years and months) accept valid input ranges.
- **Test Data**:
  - Experience Years: 5
  - Experience Months: 6
- **Expected Result**: Experience fields accept valid input ranges.

---

## Test Execution

### Running the Tests

#### Run All Regression Tests
```bash
# Run all job posting regression tests
npx playwright test tests/job-posting/job-posting-regression.spec.ts

# Run all applicants regression tests
npx playwright test tests/Applicants/applicants-regression.spec.ts
```

#### Run Specific Test Case
```bash
# Run a specific test by name
npx playwright test -g "TC-JP01"
npx playwright test -g "TC-A01"
```

#### Run Tests in UI Mode
```bash
npx playwright test --ui
```

#### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Test Data

Test data is generated using the `TestDataGenerator` utility class located in `utils/test-data-generator.ts`. The generator creates:
- Unique job titles with timestamps
- Random phone numbers
- Salary values
- Experience and notice period values
- Custom locations

### Test Resources

Test files used in the tests:
- `test-resources/functionalsample.pdf` - Used for applicant resume uploads
- `test-resources/Job Title_ Salesforce Developer II.pdf` - Used for job posting document upload

### Prerequisites

1. **Authentication**: Tests use authenticated fixtures (`authenticatedPage`) that handle login automatically.
2. **Test Environment**: Tests should be run against a stable test environment.
3. **Dependencies**: All required dependencies should be installed via `npm install`.

### Test Coverage Summary

#### Job Posting Tests
- **Total Test Cases**: 21
- **Categories**: 6
  - Manual Job Posting: 5 tests
  - AI-Powered Job Posting: 2 tests
  - Document Upload: 1 test
  - UI Element Verification: 6 tests
  - Data-Driven Tests: 3 tests (covering 16 scenarios)
  - Validation Tests: 4 tests

#### Applicants Tests
- **Total Test Cases**: 15
- **Categories**: 4
  - Positive Test Cases: 4 tests
  - UI Element Verification: 3 tests
  - Edge Cases: 4 tests
  - Validation Tests: 4 tests

### Maintenance Notes

1. **Test IDs**: All test cases follow a consistent naming convention:
   - Job Posting: `TC-JP##`
   - Applicants: `TC-A##`

2. **Page Objects**: Tests use Page Object Model (POM) pattern:
   - `pages/job-posting-page.ts` - Job posting page interactions
   - `pages/applicants-page.ts` - Applicants page interactions

3. **Test Fixtures**: Tests use custom fixtures from `fixtures/test-fixtures.ts` that provide:
   - Authenticated page context
   - Page object instances
   - Test utilities

4. **Console Logging**: Each test includes console.log statements for tracking test execution and results.

---


