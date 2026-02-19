# Commands Reference Guide

A comprehensive guide to all commands available in the StrataHire Test Automation Framework.

---

## 📋 Table of Contents

- [Installation & Setup Commands](#installation--setup-commands)
- [Basic Test Execution](#basic-test-execution)
- [Module-Specific Commands](#module-specific-commands)
- [Regression Test Commands](#regression-test-commands)
- [Parallel Execution Commands](#parallel-execution-commands)
- [Advanced Execution Options](#advanced-execution-options)
- [Debugging Commands](#debugging-commands)
- [Reporting Commands](#reporting-commands)
- [Utility Commands](#utility-commands)
- [PowerShell Scripts](#powershell-scripts)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [Playwright Direct Commands](#playwright-direct-commands)

---

## 🚀 Installation & Setup Commands

### Initial Setup

```bash
# Install project dependencies
npm install

# Install Playwright browsers
npx playwright install

# Verify Playwright installation
npx playwright --version

# List all available tests (without running them)
npm test -- --list
```

### Install Specific Browsers

```bash
# Install Chromium only
npx playwright install chromium

# Install Firefox
npx playwright install firefox

# Install WebKit
npx playwright install webkit

# Install all browsers with dependencies
npx playwright install --with-deps
```

---

## ⚡ Basic Test Execution

### Run All Tests

```bash
# Run all tests in headless mode (Chromium only, default)
npm test

# Run all tests with browser visible
npm run test:all

# Run on all browsers (Chromium, Firefox, WebKit)
npm run test:all-browsers

# Run smoke tests only (quick sanity check)
npm run test:smoke

# Run critical path tests only
npm run test:critical

# Run all tests (headless) with specific flag
npm test -- --headed
```

### Run Tests by Execution Mode

```bash
# Headless mode (faster, default)
npm test

# Headed mode (see browser)
npm run test:headed

# All tests with browser visible
npm run test:all
```

---

## 📦 Module-Specific Commands

### Login Tests

```bash
# Run login tests with browser visible
npm run test:login

# Run specific login test file
npm run login

# Run login tests in headless mode
npx playwright test tests/login

# Run login tests with specific test case
npx playwright test tests/login --grep "TC-LOGIN01"
```

### Job Posting Tests

```bash
# Run all job posting tests (headed)
npm run test:job-posting

# Run all job posting tests (headless)
npm run test:job-posting:headless

# Run basic job posting tests
npm run job-posting

# Run AI-powered job posting tests
npm run job-posting:ai

# Run document upload job posting tests
npm run job-posting:document

# Run specific job posting test file
npx playwright test tests/job-posting/job-posting.spec.ts --headed

# Run job posting tests with grep filter
npx playwright test tests/job-posting --grep "TC-JP22"
```

### Applicants Tests

```bash
# Run all applicants tests (headed)
npm run test:applicants

# Run all applicants tests (headless)
npm run test:applicants:headless

# Run basic applicants tests
npm run applicants

# Run specific applicants test file
npx playwright test tests/Applicants/applicants.spec.ts --headed

# Run applicants tests with grep filter
npx playwright test tests/Applicants --grep "TC-A15"
```

### Interview Tests

```bash
# Run all interview tests (headed)
npm run test:interview

# Run basic interview tests
npm run interview

# Run specific interview test file
npx playwright test tests/Interview/Interview.spec.ts --headed

# Run interview tests with grep filter
npx playwright test tests/Interview --grep "TC-INT"
```

### Integration Tests

```bash
# Run all integration tests (headed)
npm run test:integration

# Run specific integration test file
npx playwright test tests/integration/job-posting-applicants-integration.spec.ts --headed

# Run integration tests with grep filter
npx playwright test tests/integration --grep "TC-INT01"
```

---

## 🔄 Regression Test Commands

### Run Regression Suites

```bash
# Run all regression tests (all modules with @Regression tag)
npm run test:regression

# Run job posting regression suite
npm run test:job-posting:regression

# Run applicants regression suite
npm run test:applicants:regression

# Run regression tests in headless mode
npx playwright test --grep @Regression
```

### Run Specific Test Cases by ID

```bash
# Run specific test case from job posting
npx playwright test --grep "TC-JP01" --headed

# Run specific test case from applicants
npx playwright test --grep "TC-A01" --headed

# Run multiple test cases (pattern matching)
npx playwright test --grep "TC-JP[01-05]" --headed

# Run test cases by tag
npx playwright test --grep "@smoke" --headed
npx playwright test --grep "@E2E" --headed
```

---

## 🔀 Parallel Execution Commands

### Using npm Scripts (npm-run-all)

```bash
# Run job posting and applicants tests in parallel
npm run test:parallel:job-applicants

# Run job posting and interview tests in parallel
npm run test:parallel:job-interview

# Run job posting and login tests in parallel
npm run test:parallel:job-login

# Run applicants and interview tests in parallel
npm run test:parallel:applicants-interview

# Run job posting and applicants in parallel (headless)
npm run test:parallel:job-applicants:headless
```

### Using Playwright Workers

```bash
# Run tests with 4 workers (parallel)
npx playwright test --workers=4

# Run tests with 8 workers (max parallelization)
npx playwright test --workers=8

# Run tests with 1 worker (sequential)
npx playwright test --workers=1

# Let Playwright auto-detect optimal workers
npx playwright test --workers=0
```

### Test Sharding (for CI/CD)

```bash
# Shard 1 of 4
npm run test:shard --shard=1/4

# Shard 2 of 4
npm run test:shard --shard=2/4

# Using npx directly
npx playwright test --shard=1/4
npx playwright test --shard=2/4
```

---

## 🎛️ Advanced Execution Options

### Run Tests by File Pattern

```bash
# Run all tests in a specific directory
npx playwright test tests/job-posting

# Run specific test file
npx playwright test tests/job-posting/job-posting.spec.ts

# Run tests matching a pattern
npx playwright test tests/*/regression*.spec.ts

# Run tests with line numbers
npx playwright test tests/job-posting/job-posting.spec.ts:25
```

### Run Tests with Grep (Filter)

```bash
# Run tests matching a pattern in test name
npx playwright test --grep "TC-JP22" --headed

# Run tests matching multiple patterns (OR)
npx playwright test --grep "TC-JP22|TC-JP23" --headed

# Run tests NOT matching a pattern
npx playwright test --grep-invert "smoke" --headed

# Case-insensitive grep
npx playwright test --grep "job.*posting" --headed
```

### Run Tests by Tags

```bash
# Run tests with @Regression tag
npx playwright test --grep @Regression

# Run tests with @Smoke tag
npx playwright test --grep @Smoke

# Run tests with @Integration tag
npx playwright test --grep @Integration
```

### Profile Filtering

```bash
# Run regression tests
npm run test:job-posting:regression

# Run tests for Admin profile only
npm run test:job-posting:regression -- --profile=admin

# Using environment variable
PROFILE_FILTER=hr npm test
```

---

## 🐛 Debugging Commands

### Debug Mode

```bash
# Debug mode (step through tests with debugger)
npx playwright test --debug

# Debug specific test file
npx playwright test tests/job-posting/job-posting.spec.ts --debug

# Debug specific test case
npx playwright test --debug --grep "TC-JP22"

# Debug with headed browser
npx playwright test --debug --headed
```

### UI Mode (Interactive)

```bash
# Interactive UI mode for running tests
npx playwright test --ui

# UI mode with specific test file
npx playwright test --ui tests/job-posting/job-posting.spec.ts

# UI mode with grep filter
npx playwright test --ui --grep "TC-JP22"
```

### Trace Viewer

```bash
# View trace file (traces are captured on retry by default)
npx playwright show-trace trace.zip

# Run tests with trace (always on)
npx playwright test --trace on

# Run tests with trace (only on failure)
npx playwright test --trace on-first-retry

# Run tests with trace (retain on failure)
npx playwright test --trace retain-on-failure

# Run tests with trace (never capture)
npx playwright test --trace off
```

### Screenshot and Video Options

```bash
# Run with screenshots on every action
npx playwright test --screenshot=on

# Run with screenshots only on failure
npx playwright test --screenshot=only-on-failure

# Run with video recording on
npx playwright test --video=on

# Run with video only on failure
npx playwright test --video=retain-on-failure

# Run with video always off
npx playwright test --video=off
```

### Inspect Mode

```bash
# Open Playwright Inspector
npx playwright codegen <url>

# Inspect mode for specific URL
npx playwright codegen https://stratahire.com
```

---

## 📊 Reporting Commands

### View Playwright HTML Report

```bash
# Generate and open Playwright HTML report
npm run report

# View report directly
npx playwright show-report

# Open report in browser
start playwright-report/index.html
```

### Client-Ready Reports

```bash
# Generate client-friendly HTML report
npm run report:client

# View client report (opens in browser)
npm run report:view

# Generate and view in one command
npm run report:client && npm run report:view
```

### Report Locations

- **Playwright Report**: `playwright-report/index.html`
- **Client Report (Latest)**: `client-reports/latest-report.html`
- **Client Report (Timestamped)**: `client-reports/test-report-{timestamp}.html`
- **Screenshots**: `client-reports/screenshots/`
- **Test Results**: `test-results/`

---

## 🔧 Utility Commands

### Locator Validation

```bash
# Validate all locators in the codebase
npm run validate:locators

# Run locator validation tests
npx playwright test tests/locator-validation.spec.ts
```

### List Tests Without Running

```bash
# List all tests
npm test -- --list

# List tests in a specific file
npx playwright test tests/job-posting/job-posting.spec.ts --list

# List tests matching grep pattern
npx playwright test --grep "TC-JP" --list
```

### Clear Test Artifacts

```bash
# Remove test results (PowerShell)
Remove-Item -Recurse -Force test-results

# Remove test results (Bash/Git Bash)
rm -rf test-results

# Remove playwright reports
rm -rf playwright-report

# Remove client reports
rm -rf client-reports
```

### Clear Authentication State

```bash
# Remove cached authentication states (PowerShell)
Remove-Item auth-state.json -ErrorAction SilentlyContinue

# Remove cached authentication states (Bash)
rm -f auth-state.json
```

---

## 💻 PowerShell Scripts

### Parallel Test Execution Script

```powershell
# Run parallel tests with default folders (job-posting and Applicants)
.\scripts\run-parallel-tests.ps1

# Run parallel tests with specific folders
.\scripts\run-parallel-tests.ps1 -Folder1 "tests/job-posting" -Folder2 "tests/Interview"

# Run parallel tests with headed browser
.\scripts\run-parallel-tests.ps1 -Headed

# Run parallel tests with grep pattern
.\scripts\run-parallel-tests.ps1 -GrepPattern "TC-JP22" -Headed

# Combined: parallel tests with grep and headed
.\scripts\run-parallel-tests.ps1 -Folder1 "tests/job-posting" -Folder2 "tests/Applicants" -GrepPattern "Regression" -Headed
```

### Parallel Tests with Grep Script

```powershell
# Run parallel tests with grep pattern (required parameter)
.\scripts\run-parallel-grep.ps1 -GrepPattern "TC-JP22"

# Run with different grep pattern
.\scripts\run-parallel-grep.ps1 -GrepPattern "@smoke"

# Run with test case range
.\scripts\run-parallel-grep.ps1 -GrepPattern "TC-JP[01-10]"
```

---

## 🐳 Docker

Run tests in a consistent containerized environment (CI or local).

```bash
# Build the image
docker compose build

# Run all tests
docker compose run --rm tests

# Run smoke tests only
docker compose run --rm smoke

# Run Chromium-only (faster)
docker compose run --rm chromium

# With environment file
docker compose --env-file .env run --rm tests
```

Reports are written to `test-results-docker/`, `playwright-report-docker/`, and `client-reports-docker/`. See `docs/PHASE5_SUMMARY.md` for details.

---

## 🌍 Environment Variables

### Environment Configuration

```bash
# Run tests against staging (default)
npm test

# Run tests against production
$env:TEST_ENV="production"; npm test

# Run tests against local
$env:TEST_ENV="local"; npm test

# Using cross-env (if installed)
npx cross-env TEST_ENV=production npm test
```

### Base URL Override

```bash
# Override base URL
$env:BASE_URL="https://custom-url.com"; npm test

# Using cross-env
npx cross-env BASE_URL=https://custom-url.com npm test
```

### Credential Override

```bash
# Override test credentials
$env:TEST_EMAIL="user@example.com"; $env:TEST_PASSWORD="pass"; npm test

# Using cross-env
npx cross-env TEST_EMAIL=user@example.com TEST_PASSWORD=pass npm test
```

### Profile Filter

```bash
# Filter by profile
$env:PROFILE_FILTER="hr"; npm test

# Using cross-env
npx cross-env PROFILE_FILTER=hr npm test
```

### CI Configuration

```bash
# Set number of workers in CI
$env:CI_WORKERS="8"; npm test

# Skip client report generation in CI
$env:SKIP_CLIENT_REPORT="true"; npm test

# Set CI mode
$env:CI="true"; npm test
```

### Headed Mode

```bash
# Force headed mode
$env:HEADED="true"; npm test

# Force headless mode
$env:HEADED="false"; npm test
```

---

## 🎮 Playwright Direct Commands

### Test Execution

```bash
# Basic test run
npx playwright test

# Run with headed browser
npx playwright test --headed

# Run with specific project
npx playwright test --project=chromium

# Run with timeout override
npx playwright test --timeout=60000

# Run with retries
npx playwright test --retries=3

# Run with max failures limit
npx playwright test --max-failures=5

# Run in update snapshots mode
npx playwright test --update-snapshots
```

### Browser Management

```bash
# Install browsers
npx playwright install

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Install browsers with system dependencies
npx playwright install --with-deps

# Show browser versions
npx playwright --version
```

### Code Generation

```bash
# Generate test code by recording
npx playwright codegen <url>

# Generate code with specific browser
npx playwright codegen --browser=chromium <url>
npx playwright codegen --browser=firefox <url>
npx playwright codegen --browser=webkit <url>

# Generate code with device emulation
npx playwright codegen --device="iPhone 13" <url>
```

### Report Management

```bash
# Show HTML report
npx playwright show-report

# Show report with specific folder
npx playwright show-report playwright-report

# Show trace file
npx playwright show-trace trace.zip
```

---

## 📝 Common Command Combinations

### Development Workflow

```bash
# 1. Run specific test in debug mode
npx playwright test tests/job-posting/job-posting.spec.ts --debug --grep "TC-JP22"

# 2. Run test suite with browser visible
npm run test:job-posting

# 3. Generate client report
npm run report:client

# 4. View client report
npm run report:view
```

### CI/CD Workflow

```bash
# 1. Run all tests in headless mode
npm test

# 2. Run with parallel workers
npx playwright test --workers=4

# 3. Run with sharding
npx playwright test --shard=1/4

# 4. Skip client report for faster CI
$env:SKIP_CLIENT_REPORT="true"; npm test
```

### Debugging Workflow

```bash
# 1. Run test in UI mode
npx playwright test --ui --grep "TC-JP22"

# 2. Run test in debug mode
npx playwright test --debug --grep "TC-JP22"

# 3. View trace after failure
npx playwright show-trace test-results/path-to-trace.zip

# 4. View HTML report
npm run report
```

### Regression Testing Workflow

```bash
# 1. Run all regression tests
npm run test:regression

# 2. Run job posting regression
npm run test:job-posting:regression

# 3. Run applicants regression
npm run test:applicants:regression

# 4. Generate reports
npm run report:client
```

---

## 🎯 Quick Reference Table

| Task | Command |
|------|---------|
| **Install dependencies** | `npm install` |
| **Install browsers** | `npx playwright install` |
| **Run all tests (headless)** | `npm test` |
| **Run all tests (headed)** | `npm run test:all` |
| **Run job posting tests** | `npm run test:job-posting` |
| **Run applicants tests** | `npm run test:applicants` |
| **Run regression tests** | `npm run test:regression` |
| **Run specific test case** | `npx playwright test --grep "TC-JP22" --headed` |
| **Debug test** | `npx playwright test --debug --grep "TC-JP22"` |
| **UI mode** | `npx playwright test --ui` |
| **View report** | `npm run report` |
| **Generate client report** | `npm run report:client` |
| **View client report** | `npm run report:view` |
| **Parallel execution** | `npm run test:parallel:job-applicants` |
| **Validate locators** | `npm run validate:locators` |
| **List tests** | `npm test -- --list` |

---

## ⚠️ Notes

1. **Windows PowerShell**: Use `$env:VAR="value"` for environment variables
2. **Bash/Git Bash**: Use `VAR=value` for environment variables
3. **Default Mode**: Tests run in headless mode unless `--headed` flag is used
4. **Report Generation**: Client reports are generated automatically after test runs
5. **Authentication State**: Cached in `auth-state.json`
6. **Test Artifacts**: Stored in `test-results/` directory
7. **Traces**: Captured on first retry by default (configurable in `playwright.config.ts`)

---

## 🔗 Related Documentation

- [README.md](../README.md) - Main framework documentation
- [CLIENT_REPORTING_GUIDE.md](./CLIENT_REPORTING_GUIDE.md) - Client reporting guide
- [Playwright Documentation](https://playwright.dev/docs/intro) - Official Playwright docs

---

**Last Updated**: 2025  
**Framework Version**: 1.0.0

