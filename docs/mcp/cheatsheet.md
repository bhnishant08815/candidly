# MCP Commands Cheatsheet

Quick reference for common AI assistant requests using MCP in the StrataHire framework.

---

## 🧪 Test Creation

### Create a New Test

```
"Create a test for [feature] that [does something]"
```

**Examples**:
- "Create a test for job posting filters that verifies filtering by status"
- "Create a test for applicant search functionality"
- "Create a regression test suite for the interview module"

---

### Create Test from Existing Pattern

```
"Create a test similar to [existing test] but for [new feature]"
```

**Examples**:
- "Create a test similar to TC-JP01 but for editing job postings"
- "Create a test like TC-A05 but for bulk applicant import"

---

### Generate Test Data

```
"Generate test data for [feature] with [specifications]"
```

**Examples**:
- "Generate test data for 10 job postings with different departments"
- "Generate realistic applicant data for testing filters"

---

## 🐛 Debugging

### Debug a Failing Test

```
"Test [test-id] is failing. Debug and fix it."
```

**Examples**:
- "Test TC-JP15 is failing with a timeout error. Debug it."
- "TC-A05 is flaky. Help me fix it."
- "The job posting creation test fails intermittently. Investigate why."

---

### Debug Selector Issues

```
"The selector [selector] is not working. Find the correct one."
```

**Examples**:
- "The submit button selector stopped working. Find the new selector."
- "Help me find the correct selector for the job title input field"

---

### Analyze Test Failures

```
"Analyze why [test] is failing and suggest fixes"
```

**Examples**:
- "Analyze why all applicant tests are failing"
- "Why is TC-JP22 timing out?"

---

## 🔧 Refactoring

### Extract Common Logic

```
"Extract [common code] to [fixture/utility]"
```

**Examples**:
- "Extract the login logic to a fixture"
- "Create a utility function for date formatting used in multiple tests"
- "Refactor duplicate wait logic into a helper"

---

### Update Multiple Files

```
"Update [pattern] to [new pattern] across all files"
```

**Examples**:
- "Update the API endpoint from /api/jobs to /api/v2/jobs in all files"
- "Replace all hard-coded waits with condition-based waits"
- "Update all tests to use the new authentication fixture"

---

### Improve Code Quality

```
"Review [file/test] and suggest improvements"
```

**Examples**:
- "Review job-posting.spec.ts and suggest improvements"
- "Improve the code quality of the ApplicantsPage class"
- "Refactor this test to follow best practices"

---

## 📄 Page Objects

### Create New Page Object

```
"Create a page object for [page] with [methods]"
```

**Examples**:
- "Create a page object for the Settings page"
- "Create a page object for the Reports page with methods for filtering and exporting"

---

### Update Page Object

```
"Update [page object] to [changes]"
```

**Examples**:
- "Update JobPostingPage to include methods for AI-powered job creation"
- "Add a method to ApplicantsPage for bulk actions"
- "Update LoginPage to handle two-factor authentication"

---

### Add Methods to Page Object

```
"Add methods to [page object] for [functionality]"
```

**Examples**:
- "Add methods to DashboardPage for widget interactions"
- "Add filtering methods to ApplicantsPage"

---

## 🧩 Integration Tests

### Create End-to-End Test

```
"Create an integration test that [workflow]"
```

**Examples**:
- "Create an integration test that creates a job, adds applicants, and schedules interviews"
- "Create an end-to-end test for the complete hiring workflow"

---

### Test Complex Workflows

```
"Test the workflow: [step 1] → [step 2] → [step 3]"
```

**Examples**:
- "Test the workflow: create job → post to portal → receive applications → filter candidates"
- "Test the complete interview scheduling workflow"

---

## 📊 Reports & Analysis

### Generate Test Report

```
"Generate a [type] report for [scope]"
```

**Examples**:
- "Generate a summary report of the last test run"
- "Create a detailed report of all failed tests with screenshots"
- "Generate a performance report showing slow tests"

---

### Analyze Test Results

```
"Analyze [test results] and [action]"
```

**Examples**:
- "Analyze the test results and identify patterns in failures"
- "Show me which tests are the slowest"
- "Find all tests that fail due to timeout errors"

---

## 🔍 Code Exploration

### Find Code

```
"Find [what] in [where]"
```

**Examples**:
- "Find all tests that use the JobPostingPage"
- "Find where the authentication logic is implemented"
- "Show me all tests for the applicant module"

---

### Understand Code

```
"Explain how [feature/code] works"
```

**Examples**:
- "Explain how the authentication state caching works"
- "How does the ResilientElement wrapper work?"
- "Explain the test data generation strategy"

---

### Search for Patterns

```
"Show me all [pattern]"
```

**Examples**:
- "Show me all tests that use hard-coded waits"
- "Find all page objects that don't extend BasePage"
- "List all tests that don't use test fixtures"

---

## 🔄 Git Operations

### Commit Changes

```
"Commit [changes] with message [message]"
```

**Examples**:
- "Commit the new applicant tests with message 'Add applicant filtering tests'"
- "Commit all changes related to the job posting refactoring"

---

### Review Changes

```
"Show me what changed in [file/scope]"
```

**Examples**:
- "Show me what changed in the last commit"
- "What files were modified in the job-posting tests?"

---

## 🎯 Browser Testing

### Test in Browser

```
"Open [url] and test [functionality]"
```

**Examples**:
- "Open the staging site and test the job posting creation flow"
- "Navigate to the applicants page and verify the filters work"
- "Test the login flow in the browser"

---

### Validate Selectors

```
"Test if [selector] works on [page]"
```

**Examples**:
- "Test if the submit button selector works on the job posting page"
- "Validate all selectors in the LoginPage class"

---

### Capture Screenshots

```
"Take a screenshot of [page/element]"
```

**Examples**:
- "Take a screenshot of the job posting form"
- "Capture the dashboard page"

---

## 📚 Documentation

### Generate Documentation

```
"Generate documentation for [code]"
```

**Examples**:
- "Generate documentation for the JobPostingPage class"
- "Create a README for the utils directory"
- "Document the test data generation utilities"

---

### Create Examples

```
"Create usage examples for [feature]"
```

**Examples**:
- "Create examples showing how to use the ResilientElement wrapper"
- "Show examples of using the test fixtures"

---

## 🛠️ Utilities

### Create Helper Function

```
"Create a helper function for [task]"
```

**Examples**:
- "Create a helper function for waiting for multiple API responses"
- "Create a utility for generating random addresses"

---

### Optimize Code

```
"Optimize [code] for [goal]"
```

**Examples**:
- "Optimize the test suite for faster execution"
- "Improve the performance of the applicant filtering tests"

---

## 💡 Best Practices

### General Format

For best results, structure your requests like this:

```
[Action] [What] [Where/How] [Additional context]
```

**Examples**:
- ✅ "Create a test for applicant filtering in the Applicants module following existing patterns"
- ✅ "Debug test TC-JP15 which fails with timeout on the submit button"
- ✅ "Refactor the authentication logic to use fixtures across all test files"

---

### Be Specific

❌ "Fix the tests"  
✅ "Fix test TC-JP15 which fails with 'Element not found' error"

❌ "Create a test"  
✅ "Create a test for job posting status filters following the pattern in TC-JP01"

❌ "Update the page"  
✅ "Update JobPostingPage to add a method for AI-powered job creation"

---

### Provide Context

Include relevant information:
- Test IDs (TC-JP15, TC-A05)
- File names (job-posting.spec.ts)
- Error messages
- Expected behavior
- Existing patterns to follow

---

## 🚀 Advanced Commands

### Multi-Step Workflows

```
"[Step 1], then [Step 2], then [Step 3]"
```

**Examples**:
- "Create a new test for interview scheduling, test it in the browser, and commit the changes"
- "Read the JobPostingPage class, identify improvements, implement them, and update all affected tests"

---

### Conditional Operations

```
"If [condition], then [action], otherwise [alternative]"
```

**Examples**:
- "If the selector exists, update it, otherwise create a new one"
- "If tests are failing, debug them, otherwise run the full suite"

---

### Batch Operations

```
"For all [items], [action]"
```

**Examples**:
- "For all tests in the job-posting folder, add screenshot capture"
- "For all page objects, add JSDoc comments"

---

## 📋 Quick Reference

### Most Common Commands

1. **Create test**: "Create a test for [feature]"
2. **Debug test**: "Debug test [test-id]"
3. **Update code**: "Update [file] to [changes]"
4. **Generate report**: "Generate a report of [scope]"
5. **Test in browser**: "Open [url] and test [feature]"
6. **Commit changes**: "Commit [changes]"
7. **Find code**: "Find [what] in [where]"
8. **Explain code**: "Explain how [code] works"
9. **Create page object**: "Create a page object for [page]"
10. **Refactor code**: "Refactor [code] to [improvement]"

---

## 🎓 Tips for Success

1. **Start simple**: Begin with straightforward requests
2. **Be specific**: Include test IDs, file names, and error messages
3. **Provide context**: Reference existing patterns and files
4. **Iterate**: Refine requests based on results
5. **Combine operations**: Chain multiple steps together
6. **Use test IDs**: Always reference tests by their ID (TC-XX##)
7. **Follow patterns**: Ask AI to follow existing test patterns
8. **Verify results**: Review AI-generated code before committing

---

## 🔗 Related Documentation

- [quick-start.md](./quick-start.md) - Get started in 5 minutes
- [configuration.md](./configuration.md) - Complete configuration guide
- [examples.md](./examples.md) - Detailed usage examples
- [architecture.md](./architecture.md) - System architecture

---

**Last Updated**: February 2026  
**Version**: 1.0
