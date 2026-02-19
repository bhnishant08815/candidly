# MCP (Model Context Protocol) Configuration Guide

## Overview

This document describes the MCP configuration for the StrataHire Test Automation Framework. MCP enables AI assistants (like Claude in Cursor) to interact with external tools and services, enhancing test development, debugging, and maintenance capabilities.

---

## 📋 Table of Contents

- [What is MCP?](#what-is-mcp)
- [Configured MCP Servers](#configured-mcp-servers)
- [Installation & Setup](#installation--setup)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that enables AI assistants to securely connect to external data sources and tools. For this test automation framework, MCP provides:

- **Browser Automation**: Direct Playwright integration for testing
- **File System Access**: Read/write test files, reports, and configurations
- **Git Integration**: Version control operations
- **Sequential Thinking**: Complex problem-solving workflows
- **Memory**: Knowledge graph for tracking patterns and solutions

---

## Configured MCP Servers

### 1. Playwright Server (`playwright`)

**Purpose**: Browser automation and testing capabilities

**Capabilities**:
- Launch and control browsers (Chromium, Firefox, WebKit)
- Navigate to URLs and interact with web pages
- Execute Playwright test scripts
- Capture screenshots and videos
- Debug test failures in real-time

**Use Cases**:
- Quick browser testing during development
- Debugging test failures interactively
- Validating selectors and page interactions
- Exploring web application behavior

**Example Commands**:
```javascript
// Navigate to StrataHire staging
await page.goto('https://staging.stratahire.com');

// Test a selector
await page.click('button[data-testid="create-job"]');

// Capture screenshot
await page.screenshot({ path: 'debug.png' });
```

---

### 2. File System Server (`filesystem`)

**Purpose**: Read and write access to the project directory

**Capabilities**:
- Read test files, page objects, and configurations
- Write new tests and update existing ones
- Manage test reports and screenshots
- Access test data and fixtures
- Read/write utility files

**Use Cases**:
- Creating new test files
- Updating page objects
- Managing test data
- Organizing test reports
- Refactoring code

**Allowed Directory**: `c:\Users\Lenovo\Desktop\StrataHire`

**Example Operations**:
```typescript
// Read a test file
const testContent = await fs.readFile('tests/job-posting/job-posting.spec.ts');

// Write a new page object
await fs.writeFile('pages/new-feature-page.ts', pageObjectCode);

// List test reports
const reports = await fs.readdir('client-reports');
```

---

### 3. Git Server (`git`)

**Purpose**: Version control operations

**Capabilities**:
- View git status and history
- Create commits
- Manage branches
- View diffs
- Track changes

**Use Cases**:
- Committing test changes
- Creating feature branches for new tests
- Reviewing test modifications
- Managing test versions

**Repository**: `c:\Users\Lenovo\Desktop\StrataHire`

**Example Operations**:
```bash
# Check git status
git status

# View recent commits
git log --oneline -10

# Create a branch for new tests
git checkout -b feature/new-applicant-tests

# Commit test changes
git add tests/Applicants/new-test.spec.ts
git commit -m "Add new applicant filtering tests"
```

---

### 4. Sequential Thinking Server (`sequential-thinking`)

**Purpose**: Complex problem-solving and planning

**Capabilities**:
- Break down complex testing problems
- Plan multi-step test scenarios
- Debug complex test failures
- Design test strategies
- Analyze test architecture

**Use Cases**:
- Planning complex integration tests
- Debugging flaky tests
- Designing test data strategies
- Refactoring test suites
- Optimizing test performance

**Example Workflows**:
- "How should I structure tests for the new interview scheduling feature?"
- "Why is this test flaky and how can I fix it?"
- "What's the best way to handle authentication state across tests?"

---

### 5. Memory Server (`memory`)

**Purpose**: Knowledge graph for tracking patterns and solutions

**Capabilities**:
- Store test patterns and best practices
- Remember common issues and solutions
- Track test architecture decisions
- Maintain testing knowledge base

**Use Cases**:
- Remembering project-specific patterns
- Tracking recurring test issues
- Documenting test solutions
- Building institutional knowledge

**Example Memories**:
- "Job posting tests require unique timestamps to avoid duplicates"
- "Authentication state is cached in auth-state.json"
- "Use ResilientElement wrapper for flaky selectors"

---

## Installation & Setup

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Cursor IDE with MCP support
- Git installed

### Step 1: Verify MCP Configuration

The MCP configuration is located at:
```
.cursor/mcp.json
```

This file is already configured with all necessary servers.

### Step 2: Install MCP Server Dependencies

MCP servers are installed automatically when first used. However, you can pre-install them:

```bash
# Install Playwright MCP server
npx -y @executeautomation/playwright-mcp-server

# Install File System MCP server
npx -y @modelcontextprotocol/server-filesystem

# Install Git MCP server
npx -y @modelcontextprotocol/server-git

# Install Sequential Thinking server
npx -y @modelcontextprotocol/server-sequential-thinking

# Install Memory server
npx -y @modelcontextprotocol/server-memory
```

### Step 3: Restart Cursor

After configuration:
1. Close Cursor completely
2. Reopen Cursor
3. Open the StrataHire project
4. MCP servers will initialize automatically

### Step 4: Verify MCP is Working

In Cursor, you can verify MCP servers are running by:
1. Opening the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Looking for MCP-related commands
3. Checking the Cursor output panel for MCP logs

---

## Usage Examples

### Example 1: Creating a New Test with MCP

**Scenario**: Create a new test for job posting filters

```typescript
// AI Assistant can:
// 1. Read existing test patterns (filesystem)
// 2. Understand project structure (filesystem)
// 3. Generate new test file
// 4. Commit changes (git)

// Result: New test file created at tests/job-posting/job-posting-filters.spec.ts
```

**AI Prompt**:
> "Create a new test file for job posting filters. Follow the existing test patterns in the job-posting folder. Include tests for filtering by status, date, and department."

---

### Example 2: Debugging a Flaky Test

**Scenario**: A test fails intermittently

```typescript
// AI Assistant can:
// 1. Read the failing test (filesystem)
// 2. Analyze the test logic (sequential-thinking)
// 3. Launch browser to reproduce (playwright)
// 4. Identify timing issues
// 5. Suggest fixes with retry logic
// 6. Update the test (filesystem)
// 7. Commit the fix (git)
```

**AI Prompt**:
> "This test is flaky: tests/Applicants/applicants.spec.ts - TC-A05. Help me debug and fix it."

---

### Example 3: Refactoring Page Objects

**Scenario**: Update page object to use new selectors

```typescript
// AI Assistant can:
// 1. Read current page object (filesystem)
// 2. Understand selector patterns (memory)
// 3. Test new selectors (playwright)
// 4. Update page object (filesystem)
// 5. Find and update all usages (filesystem)
// 6. Commit changes (git)
```

**AI Prompt**:
> "The job posting page has new selectors. Update the JobPostingPage class and all tests that use it."

---

### Example 4: Generating Test Reports

**Scenario**: Create a custom test report

```typescript
// AI Assistant can:
// 1. Read test results (filesystem)
// 2. Access screenshots (filesystem)
// 3. Generate HTML report
// 4. Save to client-reports (filesystem)
```

**AI Prompt**:
> "Generate a summary report of the last test run with pass/fail statistics and screenshots of failures."

---

### Example 5: Planning Integration Tests

**Scenario**: Design end-to-end test for job-to-interview flow

```typescript
// AI Assistant can:
// 1. Analyze existing tests (filesystem)
// 2. Plan test steps (sequential-thinking)
// 3. Design test data strategy (memory)
// 4. Create test file (filesystem)
// 5. Implement page interactions
```

**AI Prompt**:
> "I need an integration test that creates a job posting, adds an applicant, and schedules an interview. Plan and implement this test."

---

## Troubleshooting

### MCP Servers Not Starting

**Symptoms**:
- MCP commands not available
- Cursor shows MCP connection errors

**Solutions**:
1. **Restart Cursor**: Close completely and reopen
2. **Check Node.js**: Ensure Node.js v18+ is installed
   ```bash
   node --version
   ```
3. **Check MCP Configuration**: Verify `.cursor/mcp.json` exists and is valid JSON
4. **Check Permissions**: Ensure Cursor has permission to execute npx commands
5. **Check Logs**: View Cursor output panel for MCP error messages

---

### Playwright Server Issues

**Symptoms**:
- Browser automation not working
- Playwright commands fail

**Solutions**:
1. **Install Playwright Browsers**:
   ```bash
   npx playwright install
   ```
2. **Check Playwright Installation**:
   ```bash
   npx playwright --version
   ```
3. **Verify PLAYWRIGHT_BROWSERS_PATH**: Should be set to "0" in mcp.json

---

### File System Access Denied

**Symptoms**:
- Cannot read/write files
- Permission errors

**Solutions**:
1. **Check Directory Path**: Ensure path in mcp.json is correct
2. **Check Permissions**: Ensure Cursor has read/write access to project directory
3. **Run as Administrator**: On Windows, try running Cursor as administrator

---

### Git Operations Failing

**Symptoms**:
- Git commands not working
- Repository not found

**Solutions**:
1. **Verify Git Installation**:
   ```bash
   git --version
   ```
2. **Check Repository Path**: Ensure path in mcp.json points to git repository
3. **Check Git Status**: Verify repository is initialized
   ```bash
   git status
   ```

---

### Memory Server Not Persisting

**Symptoms**:
- Knowledge not remembered between sessions

**Solutions**:
1. **Check Memory Storage**: Memory server stores data in user directory
2. **Restart Cursor**: Sometimes memory needs a restart to persist
3. **Verify Server Running**: Check Cursor output for memory server logs

---

## Advanced Configuration

### Custom Environment Variables

You can add environment variables to MCP servers:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "0",
        "DEBUG": "pw:api",
        "HEADLESS": "false"
      }
    }
  }
}
```

---

### Adding More MCP Servers

You can add additional MCP servers for specific needs:

#### Puppeteer Server (Alternative to Playwright)
```json
{
  "puppeteer": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
    "description": "Puppeteer for alternative browser automation"
  }
}
```

#### Brave Search (for test data research)
```json
{
  "brave-search": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "your-api-key"
    },
    "description": "Search for testing best practices and solutions"
  }
}
```

#### Fetch (for API testing)
```json
{
  "fetch": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-fetch"],
    "description": "HTTP requests for API testing"
  }
}
```

---

### Performance Optimization

#### Reduce MCP Server Startup Time

1. **Pre-install servers globally**:
   ```bash
   npm install -g @executeautomation/playwright-mcp-server
   npm install -g @modelcontextprotocol/server-filesystem
   npm install -g @modelcontextprotocol/server-git
   ```

2. **Update mcp.json to use global installations**:
   ```json
   {
     "playwright": {
       "command": "playwright-mcp-server"
     }
   }
   ```

#### Limit Active Servers

If you don't need all servers, comment them out:

```json
{
  "mcpServers": {
    "playwright": { ... },
    "filesystem": { ... }
    // "git": { ... },  // Disabled
    // "memory": { ... }  // Disabled
  }
}
```

---

## Best Practices

### 1. Use MCP for Interactive Development

MCP is best for:
- ✅ Interactive test development
- ✅ Debugging specific issues
- ✅ Exploring new features
- ✅ Quick prototyping

Not ideal for:
- ❌ Running full test suites (use npm scripts)
- ❌ CI/CD pipelines (use Playwright CLI)
- ❌ Performance testing (use dedicated tools)

---

### 2. Combine MCP Servers

Use multiple servers together for powerful workflows:

```typescript
// Example: Debug and fix a test
// 1. Read test file (filesystem)
// 2. Analyze issue (sequential-thinking)
// 3. Test fix in browser (playwright)
// 4. Update test file (filesystem)
// 5. Commit fix (git)
// 6. Remember solution (memory)
```

---

### 3. Leverage Memory Server

Store important patterns:
- Common test patterns
- Selector strategies
- Authentication flows
- Data generation approaches
- Performance optimizations

---

### 4. Use Sequential Thinking for Complex Problems

For complex scenarios, use sequential thinking:
- Test architecture decisions
- Debugging multi-step failures
- Planning integration tests
- Refactoring strategies

---

## MCP vs Traditional Development

### Traditional Approach
```typescript
// 1. Manually write test
// 2. Run test with npm script
// 3. Check report for failures
// 4. Manually debug in browser
// 5. Update test
// 6. Repeat
```

### With MCP
```typescript
// 1. Describe what you want to test
// 2. AI reads existing patterns (filesystem)
// 3. AI generates test (filesystem)
// 4. AI tests in browser (playwright)
// 5. AI commits changes (git)
// 6. AI remembers pattern (memory)
```

**Result**: 3-5x faster test development and debugging

---

## Security Considerations

### File System Access

- MCP filesystem server has access to entire project directory
- Be cautious with sensitive data (credentials, API keys)
- Never commit `.env` files or credentials

### Git Operations

- MCP can commit and push code
- Review changes before pushing to remote
- Use branch protection rules

### Browser Automation

- Playwright server can access any URL
- Be cautious with production environments
- Use staging/test environments

---

## Resources

### Official Documentation
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [Playwright MCP Server](https://github.com/executeautomation/playwright-mcp-server)

### StrataHire Framework Docs
- [Main README](../../README.md) - Installation and overview
- [quick-start.md](./quick-start.md) - Get started
- [../guides/COMMANDS_REFERENCE.md](../guides/COMMANDS_REFERENCE.md) - Test execution commands

---

## Support

For MCP-related issues:
1. Check this documentation
2. Review Cursor output panel for MCP logs
3. Check [MCP GitHub Issues](https://github.com/modelcontextprotocol/servers/issues)
4. Verify Node.js and npm versions

For framework-specific issues:
1. Check framework documentation
2. Review test examples
3. Check existing tests for patterns

---

**Last Updated**: February 2026  
**MCP Version**: 1.0  
**Framework Version**: 1.0.0
