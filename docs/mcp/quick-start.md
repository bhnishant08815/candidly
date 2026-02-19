# MCP Quick Start Guide

## 🚀 Get Started with MCP in 5 Minutes

### What You Get

MCP (Model Context Protocol) supercharges your AI assistant in Cursor with:
- **Browser automation** - Test directly in browser
- **Smart file operations** - AI reads/writes test files
- **Git integration** - Commit changes automatically
- **Complex problem solving** - AI plans multi-step solutions
- **Knowledge memory** - AI remembers your project patterns

---

## ✅ Setup Checklist

### 1. Verify Configuration (Already Done!)

Your MCP configuration is already set up at:
```
.cursor/mcp.json
```

### 2. Restart Cursor

1. Close Cursor completely (File → Exit)
2. Reopen Cursor
3. Open the StrataHire project
4. MCP servers will start automatically

### 3. Verify It's Working

Open Cursor and try asking:
> "Show me the job posting tests"

The AI should be able to read and discuss your test files.

---

## 💡 What Can You Do Now?

### Create New Tests
> "Create a new test for filtering applicants by status. Follow the existing test patterns."

### Debug Flaky Tests
> "This test is failing intermittently: TC-A05. Help me debug it."

### Update Page Objects
> "The login page has new selectors. Update the LoginPage class."

### Generate Reports
> "Create a summary of the last test run with screenshots."

### Plan Complex Tests
> "I need an integration test that creates a job, adds an applicant, and schedules an interview. Plan this test."

### Refactor Code
> "Refactor the authentication logic to use a shared fixture."

---

## 🎯 Common Use Cases

### 1. Quick Browser Testing

**Ask**:
> "Open the staging site in a browser and test the job posting creation flow"

**What happens**:
- AI launches browser (Playwright MCP)
- Navigates to staging
- Tests the flow
- Reports results

---

### 2. Create Test from Scratch

**Ask**:
> "Create a new test file for interview scheduling. Include tests for creating, editing, and deleting interviews."

**What happens**:
- AI reads existing test patterns (Filesystem MCP)
- Generates new test file
- Follows project conventions
- Saves to correct location

---

### 3. Fix Failing Test

**Ask**:
> "Test TC-JP15 is failing. Debug and fix it."

**What happens**:
- AI reads the test (Filesystem MCP)
- Analyzes the issue (Sequential Thinking)
- Tests the fix (Playwright MCP)
- Updates the code (Filesystem MCP)
- Commits the change (Git MCP)

---

### 4. Update Multiple Files

**Ask**:
> "The API endpoint for job postings changed from /api/jobs to /api/v2/jobs. Update all affected files."

**What happens**:
- AI searches all files (Filesystem MCP)
- Identifies affected tests
- Updates each file
- Commits changes (Git MCP)

---

### 5. Generate Documentation

**Ask**:
> "Generate documentation for the JobPostingPage class with usage examples."

**What happens**:
- AI reads the class (Filesystem MCP)
- Analyzes methods
- Generates documentation
- Saves as markdown

---

## 🔧 Troubleshooting

### MCP Not Working?

1. **Restart Cursor** (most common fix)
2. **Check Node.js**: Run `node --version` (need v18+)
3. **Check Cursor Output**: View → Output → Select "MCP" from dropdown
4. **Verify mcp.json**: Should be at `.cursor/mcp.json`

### Playwright Issues?

```bash
# Install Playwright browsers
npx playwright install
```

### Permission Errors?

- On Windows: Run Cursor as Administrator
- Check that `.cursor/mcp.json` has correct paths

---

## 📚 Learn More

- **Full Documentation**: [configuration.md](./configuration.md)
- **Framework Guide**: [README.md](../README.md)
- **Setup**: See [README](../../README.md) Installation and [setup.md](./setup.md)

---

## 🎉 Pro Tips

### 1. Be Specific
❌ "Fix the tests"  
✅ "Fix the failing test TC-JP15 in job-posting.spec.ts"

### 2. Provide Context
❌ "Create a test"  
✅ "Create a test for applicant filtering following the pattern in applicants.spec.ts"

### 3. Use Test IDs
❌ "The job posting test is failing"  
✅ "Test TC-JP22 is failing with a timeout error"

### 4. Leverage Multiple Servers
> "Read the JobPostingPage class, test it in the browser, and suggest improvements"

This uses:
- Filesystem (read code)
- Playwright (test in browser)
- Sequential Thinking (analyze and suggest)

---

## 🚦 Next Steps

1. ✅ Verify MCP is working (restart Cursor)
2. ✅ Try creating a simple test
3. ✅ Debug an existing test
4. ✅ Explore browser automation
5. ✅ Read the full documentation

---

**Ready to go!** Start by asking your AI assistant to help with any test automation task.

**Last Updated**: February 2026
