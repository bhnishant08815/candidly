# Debugging Guide

This guide covers the debugging utilities and enhanced error reporting features available in the StrataHire test automation framework.

---

## 🔍 Enhanced Error Context

### Overview

The `error-context` utility captures rich context when test failures occur, making debugging faster and more effective.

### Usage

#### Basic Error Context Capture

```typescript
import { captureErrorContext, formatErrorContext } from '../utils/debugging';

test('My test', async ({ page }) => {
  try {
    await page.click('button.submit');
  } catch (error) {
    const context = await captureErrorContext(
      page,
      test.info().title,
      'Clicking submit button',
      page.locator('button.submit')
    );
    console.log(formatErrorContext(context));
    throw error;
  }
});
```

#### Assertion with Context

```typescript
import { assertWithContext } from '../utils/debugging';

test('My test', async ({ page }) => {
  const submitButton = page.locator('button.submit');
  
  await assertWithContext(
    page,
    test.info().title,
    'Verifying submit button is visible',
    async () => {
      await expect(submitButton).toBeVisible();
    },
    submitButton
  );
});
```

### Error Context Includes

- **Test Information**: Test title and step description
- **Page State**: URL, title, viewport size
- **Element Info**: Selector, text content, visibility, enabled state, position
- **Screenshot**: Automatic full-page screenshot on failure
- **Timestamp**: When the error occurred

---

## 🛠️ Debugging Helpers

### Element Inspection

Inspect element details for debugging:

```typescript
import { inspectElement, logElementDetails } from '../utils/debugging';

test('My test', async ({ page }) => {
  const button = page.locator('button.submit');
  
  // Get detailed element information
  const details = await inspectElement(button);
  console.log('Element count:', details.count);
  console.log('Is visible:', details.visible);
  console.log('Is enabled:', details.enabled);
  console.log('Text:', details.text);
  console.log('Attributes:', details.attributes);
  console.log('Bounding box:', details.boundingBox);
  
  // Or use the convenience function
  await logElementDetails(button, 'Submit Button');
});
```

### Page State Capture

Capture and log page state:

```typescript
import { capturePageState, logPageState } from '../utils/debugging';

test('My test', async ({ page }) => {
  // Capture page state
  const state = await capturePageState(page);
  console.log('Page URL:', state.url);
  console.log('Page title:', state.title);
  console.log('Viewport:', state.viewport);
  console.log('Visible elements:', state.visibleElements);
  console.log('Open dialogs:', state.dialogs);
  
  // Or use the convenience function
  await logPageState(page, 'After Login');
});
```

### Wait and Log Element State

Wait for element state changes with logging:

```typescript
import { waitAndLogElementState } from '../utils/debugging';

test('My test', async ({ page }) => {
  const loadingSpinner = page.locator('.spinner');
  
  // Wait for spinner to appear and log state
  await waitAndLogElementState(
    loadingSpinner,
    'visible',
    5000,
    'Loading Spinner'
  );
  
  // Wait for spinner to disappear
  await waitAndLogElementState(
    loadingSpinner,
    'hidden',
    10000,
    'Loading Spinner'
  );
});
```

---

## 📊 Performance Monitor Enhancements

### Flaky Test Detection

The PerformanceMonitor now automatically detects flaky tests:

```typescript
import { performanceMonitor } from '../utils/reporting/performance-monitor';

// After test run, check for flaky tests
const report = performanceMonitor.generateReport();
console.log('Flaky tests:', report.flakyTests);

// Get flaky tests directly
const flakyTests = performanceMonitor.detectFlakyTests(3, 0.2);
flakyTests.forEach(test => {
  console.log(`${test.title}: ${(test.failureRate * 100).toFixed(1)}% failure rate`);
});
```

### Test Trend Analysis

Analyze trends for specific tests:

```typescript
import { performanceMonitor } from '../utils/reporting/performance-monitor';

const trend = performanceMonitor.getTestTrend('TC-A01: Add applicant', 'Applicants Regression Tests');
console.log('Pass rate:', trend.passRate);
console.log('Average duration:', trend.averageDuration);
console.log('Duration trend:', trend.durationTrend); // 'increasing' | 'decreasing' | 'stable'
console.log('Status trend:', trend.statusTrend); // 'improving' | 'degrading' | 'stable'
```

---

## 🎯 Best Practices

### 1. Use Error Context for Critical Assertions

```typescript
// ✅ Good - Rich error context
await assertWithContext(
  page,
  test.info().title,
  'Verifying job posting was created',
  async () => {
    await expect(jobPostingPage.getJobTitle(jobTitle)).toBeVisible();
  },
  jobPostingPage.getJobTitle(jobTitle)
);

// ❌ Bad - Standard assertion without context
await expect(jobPostingPage.getJobTitle(jobTitle)).toBeVisible();
```

### 2. Inspect Elements Before Interacting

```typescript
// ✅ Good - Inspect before interaction
const button = page.locator('button.submit');
await logElementDetails(button, 'Submit Button');
if (!(await button.isVisible())) {
  await logPageState(page, 'Before Submit');
}
await button.click();

// ❌ Bad - Direct interaction without inspection
await page.click('button.submit');
```

### 3. Capture Page State at Key Points

```typescript
// ✅ Good - Capture state at transitions
await logPageState(page, 'After Login');
await dashboardPage.navigateToPostings();
await logPageState(page, 'After Navigation');
await jobPostingPage.createJobPosting(data);
await logPageState(page, 'After Job Creation');
```

### 4. Use Flaky Test Detection in CI

```typescript
// In global teardown or CI script
import { performanceMonitor } from '../utils/reporting/performance-monitor';

async function globalTeardown() {
  const report = performanceMonitor.generateReport();
  
  if (report.flakyTests.length > 0) {
    console.warn(`⚠️  ${report.flakyTests.length} flaky tests detected:`);
    report.flakyTests.forEach(test => {
      console.warn(`   - ${test.title}: ${(test.failureRate * 100).toFixed(1)}% failure rate`);
    });
    // Optionally fail CI if too many flaky tests
    if (report.flakyTests.length > 5) {
      process.exit(1);
    }
  }
  
  await performanceMonitor.saveReport();
}
```

---

## 📸 Screenshot Locations

Error screenshots are automatically saved to:
```
test-results/error-screenshots/error-{timestamp}-{test-title}.png
```

---

## 🔧 Troubleshooting

### Screenshot Capture Fails

If screenshot capture fails, the error context will still include other information. Check:
- Disk space availability
- Write permissions for `test-results/error-screenshots/`
- Page state (page might be closed)

### Element Inspection Returns Empty

If `inspectElement` returns empty data:
- Element might not exist (check `count === 0`)
- Element might be in an iframe (not supported)
- Element might be detached from DOM

### Flaky Test Detection Not Working

Ensure:
- Tests are running multiple times (retries enabled)
- PerformanceMonitor is recording test results
- Sufficient test runs (minimum 3 by default)

---

## Full UI Rendering (Resource Blocking Removed)

All resource blocking has been removed from the test framework so that images, fonts, and stylesheets load in **all test execution modes** (headed, headless, and CI).

### Current Behavior

| Mode | Images | Fonts | Stylesheets |
|------|--------|-------|-------------|
| Headless (default) | Loaded | Loaded | Loaded |
| Headed (`HEADED=true`) | Loaded | Loaded | Loaded |
| CI (`CI=true`) | Loaded | Loaded | Loaded |

You get full visual rendering for debugging, better screenshot quality in reports, and consistent UI appearance across all modes.

---

## 📚 Related Documentation

- [Commands Reference](./COMMANDS_REFERENCE.md)
- [Client Reporting Guide](./CLIENT_REPORTING_GUIDE.md)
