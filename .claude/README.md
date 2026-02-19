# .claude – Project AI configuration

This folder configures how Claude is used in this project: permissions, agents, and skills.

## settings.json

Controls which tools Claude can use in this project.

- **Current allow-list:** `Read`, `Write`, `Glob`, `Grep`, `Shell`
- To restrict (e.g. read-only): remove `Write` and `Shell` from `permissions.allow`.
- To expand: add tool names your Cursor/Claude setup supports.

## agents/

Task-specific agents. In Cursor, choose an agent by name when starting a chat or task so Claude follows that agent’s instructions and tools.

| Agent | Use when you need to… |
|-------|------------------------|
| **api-coverage-planner** | Plan or generate API tests from endpoints or OpenAPI specs (Playwright `APIRequestContext`) |
| **ci-reporter** | Parse CI output, test reports, and build logs into summaries |
| **coverage-hunter** | Find coverage gaps by mapping pages/APIs to existing tests |
| **docs-writer** | Generate or update docs, test plans, and inline comments |
| **flake-triage** | Diagnose flaky tests (traces, screenshots, patterns) |
| **mcp-explorer** | Explore MCP servers and their capabilities |
| **pr-hygiene** | Check PR quality (commits, test tags, standards) |
| **qa-orchestrator** | Coordinate QA work and route to the right specialist agent |
| **seed-data-manager** | Manage test data, fixtures, factories, seed scripts, cleanup |
| **security-scout** | Scan for hardcoded secrets, API keys, tokens, anti-patterns |
| **ui-test-designer** | Design UI tests (POM, selectors, waits, project conventions) |

## skills/

Reusable how-to guides Claude can follow when relevant.

| Skill | Purpose |
|-------|---------|
| **mcp-scout** | Choose the right MCP server (e.g. playwright vs playwright-test) for browser vs test-run tasks |
| **prompt-library** | Copy-paste prompts for UI/API test design, debugging, and other QA tasks |

## MCP (Model Context Protocol)

Browser automation for this project is configured in **`.cursor/mcp.json`** at the repo root (not inside `.claude`).

- **Playwright MCP** (`playwright`) is enabled so the AI can drive a browser: navigate, click, fill forms, take snapshots, etc.
- After changing `.cursor/mcp.json`, restart Cursor or reload the window so MCP servers reload.
- The app under test base URL is in `config/test-config.ts` (e.g. staging). When asking the AI to open the app, you can say e.g. “navigate to the staging app” or give the URL from that config.
- See the **mcp-scout** skill in `skills/` for when to use the Playwright MCP vs running Playwright tests via the terminal.

## How to use

1. **Permissions:** Edit `settings.json` to allow or disallow tools as needed.
2. **Agents:** In Cursor, select the agent that matches your task (e.g. `api-coverage-planner` for API tests) so responses follow that agent’s instructions.
3. **Skills:** Use prompts that match the skills (e.g. “Which MCP server should I use for…?” for **mcp-scout**, or prompts from **prompt-library** for QA automation).
4. **MCP:** Use `.cursor/mcp.json` for browser automation; restart Cursor after editing it.