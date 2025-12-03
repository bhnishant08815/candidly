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

Run the login automation script:
```bash
npm run login
```

Or run with Playwright directly:
```bash
npx playwright test tests/login.spec.ts --headed
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

