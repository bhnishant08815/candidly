# Use Integrated MCP More Efficiently for Accurate Results

You have five MCP servers in [.cursor/mcp.json](../../.cursor/mcp.json): **playwright**, **filesystem**, **git**, **sequential-thinking**, and **memory**. Below is how to use them efficiently and for more accurate outcomes.

---

## 1. Phrase requests so the right tools get used

**Efficiency**: The model picks tools from your words. Be explicit about what you want done and where.

- **Bad**: "Fix the tests" → vague; model may guess scope.
- **Good**: "Fix test TC-JP15 in `tests/job-posting/job-posting-regression.spec.ts` — it fails with 'Element not found' on the submit button."

Include when relevant: **test IDs** (e.g. TC-JP15), **file paths**, **error messages**, and **existing patterns** to follow (e.g. "like in applicants-regression.spec.ts").

Your [cheatsheet.md](./cheatsheet.md) uses the pattern: **[Action] [What] [Where/How] [Additional context]** — stick to that for consistency and accuracy.

---

## 2. Use the right server for the task (and combine them)

| Goal | Prefer | Why |
|------|--------|-----|
| Create/edit tests, page objects, fixtures | **Filesystem** | Read existing code first, then write in the same style. |
| Debug in UI, check selectors, try flows | **Playwright** | Real browser state; avoids "works in theory" fixes. |
| Multi-step planning, flaky analysis, refactor design | **Sequential thinking** | Breaks down complexity step-by-step for fewer mistakes. |
| Persist patterns, selectors, fixes | **Memory** | Future answers reuse your project's patterns. |
| Commit/branch/diff after changes | **Git** | Keeps history clean and reviewable. |

**Efficiency tip**: One prompt can trigger several tools. Example from [quick-start.md](./quick-start.md):

- *"Read JobPostingPage, test the create-job flow in the browser, then suggest improvements."*  
  → Filesystem (read) → Playwright (test) → Sequential thinking (suggest).

For debugging a single test: *"Debug TC-JP15: read the test and page object, run the flow in the browser, then fix the code."*  
That naturally uses Filesystem + Playwright + Filesystem again for the fix.

---

## 3. Browser (Playwright) MCP — use in the right order

For **accurate** browser results, the AI should:

1. **Navigate first**, then **lock** the tab, then interact (lock requires an existing tab).
2. **Take a snapshot** before clicks/inputs so it sees current DOM and uses correct refs.
3. **Wait incrementally** (e.g. short waits + snapshots) instead of one long wait, so it proceeds as soon as the page is ready.

You don't need to configure this; it's in the assistant's instructions. But when you ask for browser validation, being specific helps: e.g. *"Open [exact URL], go to the job posting form, and verify the submit button selector from JobPostingPage."*

---

## 4. Feed the Memory server for long-term accuracy

The **memory** server (knowledge graph) improves future answers if you use it deliberately:

- After a **selector or test fix**: *"Remember: the job submit button is `[data-testid=submit-job]` and we use it in JobPostingPage."*
- After **refactoring**: *"Remember: we use the `authenticated` fixture for all tests that need login; see test-fixtures.ts."*
- When you **find a recurring issue**: *"Remember: applicant list loads slowly; use waitForSelector on `.applicant-row` before asserting count."*

Storing patterns, selectors, and pitfalls in Memory makes later "create a test" or "fix this" prompts more accurate and consistent with your codebase. See [configuration.md](./configuration.md) "Leverage Memory Server."

---

## 5. Use sequential thinking for complex or flaky issues

For **accurate** results on hard problems, ask explicitly for planning or stepwise analysis:

- *"Use sequential thinking to plan an integration test: create job → add applicant → schedule interview."*
- *"Use sequential thinking to debug why TC-A05 is flaky: list hypotheses, then suggest checks."*

That pushes the model to use the sequential-thinking server and reduce skipped steps or wrong assumptions. [configuration.md](./configuration.md) recommends it for test architecture, multi-step debugging, and refactoring strategies.

---

## 6. Keep MCP usage scoped (efficiency)

From [configuration.md](./configuration.md) Best Practices:

- **Do use MCP for**: interactive test development, debugging a concrete failure, exploring a new feature, quick prototyping.
- **Don't use MCP for**: running the full suite (use `npm run test` or Playwright CLI), CI/CD (use your pipeline), or heavy performance testing (use dedicated tools).

So: use MCP for targeted, interactive tasks; use scripts/CLI for bulk runs and CI. That keeps MCP fast and relevant.

---

## 7. Verify and iterate

- Run **`npm run verify:mcp`** occasionally to ensure all servers and paths (e.g. Playwright) are valid. See [scripts/verify-mcp-setup.js](../../scripts/verify-mcp-setup.js).
- If a result is wrong or incomplete: **refine the prompt** with the missing context (file name, test ID, error text, or "use the same pattern as in X") and ask again. One clear follow-up is often enough for a correct fix.

---

## Summary: high-impact habits

1. **Be specific** in prompts: test IDs, file paths, errors, and "follow pattern in X."
2. **Combine servers** in one request (e.g. read → test in browser → fix → remember).
3. **Use Memory** for patterns, selectors, and recurring fixes.
4. **Use Sequential thinking** for complex or flaky scenarios.
5. **Reserve MCP for focused tasks**; use CLI/scripts for full runs and CI.
6. **Verify** with `npm run verify:mcp` and **iterate** with clearer context when results are off.

Your existing [cheatsheet.md](./cheatsheet.md) and [quick-start.md](./quick-start.md) already support this; the above ties them to "efficiency" and "accuracy" in one place.

---

**Last Updated**: February 2026
