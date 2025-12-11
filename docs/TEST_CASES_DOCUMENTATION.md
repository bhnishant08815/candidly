# Test Cases Documentation

This document provides a comprehensive overview of all test cases in the Candidly test suite, organized by categories and features.

## Table of Contents

1. [Login & Authentication](#login--authentication)
2. [Job Posting Management](#job-posting-management)
3. [Applicant Management](#applicant-management)
4. [Interview Scheduling](#interview-scheduling)
5. [Integration Tests](#integration-tests)

---

## Login & Authentication

**Feature**: User authentication and session management

### Test Cases

| Test ID | Test Case Name | Category | Tags | Description |
|---------|---------------|----------|------|-------------|
| TC-001 | Login with valid credentials | Positive | @Positive | Verify successful login with valid email and password |
| TC-002 | Display error for invalid email | Negative | @Negative | Verify error handling when invalid email is entered |
| TC-003 | Display error for invalid password | Negative | @Negative | Verify error handling when invalid password is entered |
| TC-004 | Validate required fields | Validation | @Validation | Verify form validation for required fields |
| TC-005 | Navigate to login page correctly | Navigation | @Navigation | Verify correct navigation to login page |
| TC-006 | Complete full login flow and verify dashboard access | E2E | @E2E | End-to-end test of login flow with dashboard navigation |
| TC-007 | Logout successfully | Functional | @Functional | Verify successful logout and session termination |

### Test File
- `tests/login/login.spec.ts`

---

## Job Posting Management

**Feature**: Create, manage, and configure job postings

### Categories

#### 1. Manual Job Posting Creation

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP01 | Create job posting with all required fields | Positive | Verify job posting creation with all mandatory fields |
| TC-JP04 | Create job posting with multiple skills | Positive | Verify job posting with 6+ skills can be created |
| TC-JP05 | Create job posting with multiple responsibilities | Positive | Verify job posting with 5+ responsibilities can be created |
| TC-JP06 | Create job posting with custom location | Positive | Verify job posting with custom location input |
| TC-JP13 | Save job posting as draft | Positive | Verify job posting can be saved as draft |

#### 2. AI-Powered Job Posting

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP02 | Create job posting using AI-Powered feature | Positive | Verify AI-powered job posting generation |
| TC-JP18 | AI-powered job posting for Entry Level position | Positive | Verify AI-powered posting for entry-level roles |

#### 3. Document Upload Job Posting

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP03 | Create job posting with document upload | Positive | Verify job posting creation from uploaded document |

#### 4. UI Element Verification

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP09 | Verify department dropdown options | UI Verification | Verify all department options are available |
| TC-JP10 | Verify experience level dropdown options | UI Verification | Verify all experience level options are available |
| TC-JP11 | Verify employment type dropdown options | UI Verification | Verify all employment type options are available |
| TC-JP12 | Navigate multi-step form using Continue button | UI Verification | Verify multi-step form navigation works correctly |
| TC-JP16 | Verify all UI elements on Step 1 | UI Verification | Verify all Step 1 form elements are visible |
| TC-JP17 | Verify all UI elements on Step 2 | UI Verification | Verify all Step 2 form elements are visible |

#### 5. Data-Driven Tests

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP14 | Create job posting with different experience levels | Data-Driven | Test all experience levels (Entry, Junior, Mid, Senior, Lead, Principal) |
| TC-JP15 | Create job posting with different employment types | Data-Driven | Test all employment types (Full-Time, Part-Time, Contract, Internship) |
| TC-JP21 | Create job posting for different departments | Data-Driven | Test job posting creation for all departments (Engineering, Product, Design, Marketing, Sales, HR) |

#### 6. Validation Tests

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP07 | Verify Continue button behavior with empty job title | Validation | Verify form validation prevents progression without job title |
| TC-JP08 | Verify form requires compensation before save | Validation | Verify compensation field is required before saving |
| TC-JP19 | Verify job title input accepts valid characters | Validation | Verify job title field accepts special characters |
| TC-JP20 | Verify open positions accepts numeric input | Validation | Verify open positions field accepts numeric values |
| TC-JP35 | Verify empty compensation field validation | Validation | Verify Review button is disabled without compensation |

#### 7. Workflow & Integration Tests

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP22 | Create job posting with multiple locations | Workflow | Verify job posting with multiple location options |
| TC-JP23 | Create job posting with maximum skills (10+) | Workflow | Verify job posting with 12+ skills can be created |
| TC-JP24 | Create job posting with maximum responsibilities (10+) | Workflow | Verify job posting with 12+ responsibilities can be created |
| TC-JP25 | Create job posting with special characters in title | Workflow | Verify job posting title accepts special characters |
| TC-JP26 | Create job posting with very long role summary | Workflow | Verify job posting handles long role summary text |
| TC-JP27 | Create job posting with minimum open positions (1) | Workflow | Verify job posting with minimum open positions |
| TC-JP28 | Create job posting with maximum open positions (20) | Workflow | Verify job posting with maximum open positions |
| TC-JP29 | Create job posting with all employment types in sequence | Workflow | Verify creating postings for all employment types |
| TC-JP30 | Create job posting with complex compensation details | Workflow | Verify job posting with detailed compensation information |

#### 8. Edge Cases & Boundary Tests

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-JP31 | Create job posting with single character location | Edge Case | Verify handling of minimal location input |
| TC-JP32 | Create job posting with very long location name | Edge Case | Verify handling of maximum length location |
| TC-JP33 | Create job posting with numeric-only title | Edge Case | Verify job title with numeric characters |
| TC-JP34 | Create job posting with unicode characters in title | Edge Case | Verify job title with unicode/special characters |

### Test Files
- `tests/job-posting/job-posting.spec.ts`
- `tests/job-posting/job-posting-regression.spec.ts`
- `tests/job-posting/job-posting-ai.spec.ts`
- `tests/job-posting/job-posting-document-upload.spec.ts`

---

## Applicant Management

**Feature**: Add, manage, and process applicants

### Categories

#### 1. Positive Test Cases

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-A01 | Add applicant with all required fields | Positive | Verify applicant creation with mandatory fields only |
| TC-A02 | Add applicant with resume upload and verify auto-parsed data | Positive | Verify resume upload and auto-parsing functionality |
| TC-A03 | Add applicant with all optional fields | Positive | Verify applicant creation with all optional fields filled |
| TC-A04 | Add applicant with different currency (USD) | Positive | Verify applicant creation with USD currency |

#### 2. UI Element Verification

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-A08 | Cancel applicant form and verify dialog closes | UI Verification | Verify cancel button closes the form dialog |
| TC-A11 | Verify all UI elements are visible on Add Applicant form | UI Verification | Verify all form elements are displayed correctly |
| TC-A12 | Verify role dropdown shows available job postings | UI Verification | Verify role dropdown populates with available positions |

#### 3. Validation Tests

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-A05 | Verify form requires resume upload before showing fields | Validation | Verify form fields appear only after resume upload |
| TC-A06 | Verify phone number field accepts valid input | Validation | Verify phone field accepts 10-digit numbers |
| TC-A07 | Verify salary fields accept valid numeric input | Validation | Verify salary fields accept numeric values |
| TC-A15 | Verify experience fields accept valid input ranges | Validation | Verify experience years and months fields work correctly |

#### 4. Edge Cases

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-A09 | Add applicant with minimum experience (0 years, 0 months) | Edge Case | Verify applicant with zero experience can be added |
| TC-A10 | Add applicant with maximum notice period (3 months, 30 days) | Edge Case | Verify applicant with maximum notice period |
| TC-A13 | Add applicant with high salary values | Edge Case | Verify applicant with very high salary expectations |
| TC-A14 | Add applicant with maximum experience (15+ years) | Edge Case | Verify applicant with 15+ years experience |

#### 5. Workflow & Integration Tests

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-A16 | Add multiple applicants for same role | Workflow | Verify adding multiple applicants to the same position |
| TC-A17 | Add applicant with different currencies (INR, USD, EUR) | Workflow | Verify applicant creation with multiple currency types |
| TC-A18 | Add applicant with zero notice period (immediate joiner) | Workflow | Verify applicant with immediate availability |
| TC-A19 | Add applicant with maximum notice period (3 months) | Workflow | Verify applicant with 3-month notice period |
| TC-A20 | Add applicant with extensive skills list | Workflow | Verify applicant with comprehensive skills |
| TC-A21 | Add applicant with detailed work experience | Workflow | Verify applicant with detailed work history |
| TC-A22 | Add applicant with comprehensive education details | Workflow | Verify applicant with detailed education information |
| TC-A23 | Add applicant with salary negotiation range | Workflow | Verify applicant with salary range expectations |
| TC-A24 | Add applicant with fractional experience (years and months) | Workflow | Verify applicant with partial year experience |
| TC-A25 | Add applicant with fractional notice period | Workflow | Verify applicant with partial month notice period |

#### 6. Edge Cases & Boundary Tests

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-A26 | Add applicant with very long phone number | Edge Case | Verify handling of unusually long phone numbers |
| TC-A27 | Add applicant with special characters in skills | Edge Case | Verify skills field accepts special characters |
| TC-A28 | Add applicant with unicode characters in name | Edge Case | Verify handling of unicode characters in names |
| TC-A29 | Add applicant with minimum salary values | Edge Case | Verify applicant with very low salary expectations |
| TC-A30 | Add applicant with same current and expected salary | Edge Case | Verify applicant with no salary increase expectation |
| TC-A31 | Verify form handles resume upload timeout gracefully | Edge Case | Verify graceful handling of upload timeouts |
| TC-A32 | Add applicant with all fields at maximum length | Edge Case | Verify applicant with maximum length field values |

### Test Files
- `tests/Applicants/applicants.spec.ts`
- `tests/Applicants/applicants-regression.spec.ts`

---

## Interview Scheduling

**Feature**: Schedule and manage interviews with applicants

### Test Cases

| Test ID | Test Case Name | Category | Tags | Description |
|---------|---------------|----------|------|-------------|
| TC-001 | Schedule interview using existing applicant | E2E | @E2E, @Interview | Verify complete interview scheduling workflow with email notification |

### Test File
- `tests/Interview/Interview.spec.ts`

---

## Integration Tests

**Feature**: End-to-end workflows combining multiple features

### Test Cases

| Test ID | Test Case Name | Category | Description |
|---------|---------------|----------|-------------|
| TC-INT01 | Create job posting and add applicants to it | E2E Workflow | Verify complete workflow: create job posting → add applicants |
| TC-INT02 | Create multiple job postings and add applicants to each | E2E Workflow | Verify creating multiple postings and assigning applicants |
| TC-INT03 | Create job posting with specific requirements and add matching applicant | E2E Workflow | Verify job posting with skills → applicant with matching skills |
| TC-INT04 | Create job posting for different experience levels and add matching applicants | E2E Workflow | Verify experience level matching between postings and applicants |
| TC-INT05 | Create job posting with location and add applicants with matching preferences | E2E Workflow | Verify location-based matching |
| TC-INT06 | Create job posting and verify applicant can be assigned to it | E2E Workflow | Verify job posting creation and applicant assignment |
| TC-INT07 | Create job posting with AI and add applicant with resume | E2E Workflow | Verify AI-powered job posting → applicant with resume |
| TC-INT08 | Create job posting with document upload and add multiple applicants | E2E Workflow | Verify document upload posting → multiple applicants |
| TC-INT09 | Create job posting for contract role and add applicant with contract preference | E2E Workflow | Verify contract job posting → contract applicant |
| TC-INT10 | Create job posting with high salary range and add applicant with matching expectations | E2E Workflow | Verify salary range matching between posting and applicant |

### Test File
- `tests/integration/job-posting-applicants-integration.spec.ts`

---

## Test Categories Summary

### By Category Type

1. **Positive Tests**: Verify expected functionality works correctly
2. **Negative Tests**: Verify error handling and validation
3. **Validation Tests**: Verify form validation and required fields
4. **UI Verification Tests**: Verify UI elements and user interface
5. **E2E Tests**: End-to-end workflow verification
6. **Workflow Tests**: Verify complex business workflows
7. **Edge Cases**: Verify boundary conditions and unusual inputs
8. **Data-Driven Tests**: Tests that run with multiple data sets
9. **Integration Tests**: Tests combining multiple features

### By Feature

1. **Login & Authentication**: 7 test cases
2. **Job Posting Management**: 35 test cases
3. **Applicant Management**: 32 test cases
4. **Interview Scheduling**: 1 test case
5. **Integration**: 10 test cases

**Total Test Cases: 85**

---

## Test Execution

### Running Tests by Category

```bash
# Run all positive tests
npx playwright test --grep "@Positive"

# Run all negative tests
npx playwright test --grep "@Negative"

# Run all E2E tests
npx playwright test --grep "@E2E"

# Run tests for specific profile
PROFILE_FILTER=admin npx playwright test
PROFILE_FILTER=hr npx playwright test
```

### Running Tests by Feature

```bash
# Run login tests
npx playwright test tests/login/

# Run job posting tests
npx playwright test tests/job-posting/

# Run applicant tests
npx playwright test tests/Applicants/

# Run interview tests
npx playwright test tests/Interview/

# Run integration tests
npx playwright test tests/integration/
```

---

## Notes

- All tests are configured with a timeout of 480 seconds (8 minutes)
- Tests support both Admin and HR profiles (where applicable)
- Test data is generated dynamically to avoid duplicate records
- Tests use Page Object Model (POM) pattern for maintainability
- Resume files are stored in `test-resources/` directory

---

**Last Updated**: Generated from test suite analysis
**Test Framework**: Playwright with TypeScript

