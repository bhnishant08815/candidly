# Test Running Guide

This guide explains how to run the enhanced E2E test scenarios for Job Postings and Applicants.

## Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

## Running Tests

### Quick Start - Run All Tests
```bash
npm test
# or
npm run test:all
```

### Run Specific Test Suites

#### Job Posting Tests

**Run all job posting tests:**
```bash
npm run test:job-posting
# or
npx playwright test tests/job-posting --headed
```

**Run job posting regression tests (includes all new scenarios):**
```bash
npm run test:job-posting:regression
# or
npx playwright test tests/job-posting/job-posting-regression.spec.ts --headed
```

**Run specific job posting test files:**
```bash
# AI-powered job posting
npm run job-posting:ai

# Document upload job posting
npm run job-posting:document

# Basic job posting
npm run job-posting
```

#### Applicants Tests

**Run all applicants tests:**
```bash
npm run test:applicants
# or
npx playwright test tests/Applicants --headed
```

**Run applicants regression tests (includes all new scenarios):**
```bash
npm run test:applicants:regression
# or
npx playwright test tests/Applicants/applicants-regression.spec.ts --headed
```

**Run basic applicants test:**
```bash
npm run applicants
```

#### Integration Tests (NEW!)

**Run all integration tests (job posting + applicants workflows):**
```bash
npm run test:integration
# or
npx playwright test tests/integration --headed
```

**Run specific integration test file:**
```bash
npx playwright test tests/integration/job-posting-applicants-integration.spec.ts --headed
```

### Run Specific Test Cases

**Run a single test by name:**
```bash
npx playwright test --grep "TC-JP22" --headed
npx playwright test --grep "TC-A16" --headed
npx playwright test --grep "TC-INT01" --headed
```

**Run tests matching a pattern:**
```bash
# Run all workflow tests
npx playwright test --grep "Workflow" --headed

# Run all edge case tests
npx playwright test --grep "Edge Cases" --headed

# Run all integration tests
npx playwright test --grep "Integration" --headed
```

### Run Tests by Profile

**Run tests for specific profile (Admin or HR):**
```bash
# Run with Admin profile only
PROFILE_FILTER=admin npx playwright test tests/job-posting/job-posting-regression.spec.ts --headed

# Run with HR profile only
PROFILE_FILTER=hr npx playwright test tests/job-posting/job-posting-regression.spec.ts --headed

# Run with all profiles (default)
npx playwright test tests/job-posting/job-posting-regression.spec.ts --headed
```

### Run Tests in Different Modes

**Run in headed mode (see browser):**
```bash
npx playwright test --headed
```

**Run in headless mode (no browser UI):**
```bash
npx playwright test
```

**Run in debug mode:**
```bash
npx playwright test --debug
```

**Run with UI mode (interactive):**
```bash
npx playwright test --ui
```

### Run Tests with Specific Options

**Run with specific browser:**
```bash
npx playwright test --project=chromium --headed
```

**Run with retries:**
```bash
npx playwright test --retries=2 --headed
```

**Run with specific timeout:**
```bash
npx playwright test --timeout=180000 --headed
```

**Run in parallel (default) or serial:**
```bash
# Parallel (default)
npx playwright test --workers=4 --headed

# Serial (one at a time)
npx playwright test --workers=1 --headed
```

## Test Reports

**View HTML report after test run:**
```bash
npm run report
# or
npx playwright show-report
```

**Generate report:**
```bash
npx playwright test --reporter=html
```

## Test Structure

### Job Posting Tests (`tests/job-posting/job-posting-regression.spec.ts`)
- **TC-JP01 to TC-JP21**: Original test cases
- **TC-JP22 to TC-JP30**: New workflow & integration tests
- **TC-JP31 to TC-JP35**: New edge cases & boundary tests

### Applicants Tests (`tests/Applicants/applicants-regression.spec.ts`)
- **TC-A01 to TC-A15**: Original test cases
- **TC-A16 to TC-A25**: New workflow & integration tests
- **TC-A26 to TC-A32**: New edge cases & boundary tests

### Integration Tests (`tests/integration/job-posting-applicants-integration.spec.ts`)
- **TC-INT01 to TC-INT10**: End-to-end workflow tests

## Common Commands Summary

```bash
# Quick commands
npm test                          # Run all tests (headless)
npm run test:all                  # Run all tests (headed)
npm run test:job-posting:regression  # Run job posting regression
npm run test:applicants:regression  # Run applicants regression
npm run test:integration          # Run integration tests

# Direct Playwright commands
npx playwright test tests/job-posting/job-posting-regression.spec.ts --headed
npx playwright test tests/Applicants/applicants-regression.spec.ts --headed
npx playwright test tests/integration/job-posting-applicants-integration.spec.ts --headed

# Run specific test
npx playwright test --grep "TC-JP22" --headed

# Debug mode
npx playwright test --debug tests/job-posting/job-posting-regression.spec.ts
```

## Troubleshooting

1. **Tests fail with timeout:**
   - Increase timeout in `playwright.config.ts` or use `--timeout` flag
   - Check if the application is running and accessible

2. **Tests fail with "element not found":**
   - Run in headed mode to see what's happening: `--headed`
   - Use debug mode: `--debug`
   - Check if test data (resumes, etc.) exist in `test-resources/` folder

3. **Tests are slow:**
   - Run in parallel: `--workers=4` (default)
   - Run specific test files instead of all tests
   - Use headless mode for faster execution

4. **Need to see what's happening:**
   - Use `--headed` flag to see browser
   - Use `--debug` for step-by-step debugging
   - Use `--ui` for interactive test runner
   - Check screenshots and videos in `test-results/` folder

## Environment Variables

You can set environment variables for test configuration:

```bash
# Set profile filter
PROFILE_FILTER=admin npx playwright test

# Set base URL (if different from default)
BASE_URL=https://your-app-url.com npx playwright test
```

## CI/CD Integration

For CI/CD pipelines, run tests in headless mode:

```bash
npx playwright test
```

Reports will be generated in `playwright-report/` folder.


