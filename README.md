# Candidly Login Automation

This project contains Playwright automation scripts for testing the Candidly login functionality.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running the Tests

### Run All Tests
```bash
npm test
# or
npx playwright test
```

### Run Specific Folder

You can run all tests in a specific folder by providing the folder path:

**Run all tests in the login folder:**
```bash
npx playwright test tests/login
# or
npx playwright test tests/login/ --headed
```

**Run all tests in the Job_Posting/Applicants folder:**
```bash
npx playwright test tests/Job_Posting/Applicants
# or
npx playwright test tests/Job_Posting/Applicants/ --headed
```

**Using glob patterns:**
```bash
# Run all tests in Job_Posting folder (including subfolders)
npx playwright test tests/Job_Posting/**/*.spec.ts

# Run all tests in a specific folder
npx playwright test tests/login/**/*.spec.ts
```

### Run Specific Test File

Run a single test file:
```bash
npx playwright test tests/login/login.spec.ts --headed
npx playwright test tests/Job_Posting/Applicants/applicants.spec.ts --headed
```

### Run with npm scripts

Run the login automation script:
```bash
npm run login
```

## Test Details

- **URL**: https://candidly--staging-web-app--fzt5kjl8m2pw.code.run/
- **Email**: bh.nishant@concret.io
- **Password**: Candidly@2025

The script will:
1. Navigate to the login page
2. Click the Login button
3. Enter email and password
4. Click Sign In
5. Wait for the page to load after login

## Configuration

Edit `playwright.config.ts` to modify test settings, browsers, or other configurations.

