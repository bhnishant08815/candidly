# MCP Playwright Instance Fix

## Problem

The MCP Playwright server was using `npx -y @executeautomation/playwright-mcp-server`, which downloads and runs a separate Playwright instance independent from your project's local Playwright installation. This causes:

1. **Version conflicts**: Different Playwright versions between MCP tools and your test suite
2. **Browser duplication**: Multiple Playwright browser installations
3. **Configuration mismatches**: Different browser configurations and paths
4. **Increased storage**: Duplicate browser binaries (~500MB per browser)

## Solution

Install the MCP Playwright server as a local development dependency so it uses your project's shared Playwright instance.

### Changes Made

#### 1. Installed Local Dependency

```bash
npm install --save-dev @executeautomation/playwright-mcp-server
```

This installs the MCP server in your `node_modules` where it can share the same Playwright installation.

#### 2. Updated MCP Configuration

**Before** (`.cursor/mcp.json`):
```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "-y",
      "@executeautomation/playwright-mcp-server"
    ],
    "description": "Playwright MCP server for browser automation and testing",
    "env": {
      "PLAYWRIGHT_BROWSERS_PATH": "0"
    }
  }
}
```

**After** (`.cursor/mcp.json`):
```json
{
  "playwright": {
    "command": "node",
    "args": [
      "node_modules/@executeautomation/playwright-mcp-server/dist/index.js"
    ],
    "description": "Playwright MCP server for browser automation and testing - using local installation",
    "env": {
      "PLAYWRIGHT_BROWSERS_PATH": "0"
    }
  }
}
```

### Key Changes:
- **Command**: Changed from `npx` to `node`
- **Args**: Direct path to local installation instead of package name with `-y` flag
- **Result**: MCP server now uses your project's Playwright instance

## Benefits

✅ **Single Playwright Instance**: MCP tools and your tests use the same Playwright version  
✅ **Consistent Configuration**: Shared browser paths and settings  
✅ **Reduced Storage**: No duplicate browser binaries  
✅ **Version Control**: MCP server version is tracked in `package.json`  
✅ **Faster Startup**: No download/installation delay from `npx -y`  

## Verification

To verify the fix is working:

1. **Check MCP server starts correctly**:
   ```bash
   node node_modules/@executeautomation/playwright-mcp-server/dist/index.js
   ```
   The server should start without errors (Ctrl+C to stop).

2. **Verify Playwright version consistency**:
   ```bash
   npm list @playwright/test
   ```
   Should show a single version tree with no duplicates.

3. **Check browser installation**:
   ```bash
   npx playwright install chromium
   ```
   Should use existing installation or be quick to verify.

4. **Restart Cursor**:
   - Close Cursor completely
   - Reopen your project
   - MCP Playwright tools should now use your local instance

## How It Works

### Before (npx -y approach):
```
┌─────────────────────────────────────┐
│  Your Project                       │
│  └─ @playwright/test@1.57.0         │
│     └─ browsers: ~/.cache/ms-...    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  MCP Server (via npx -y)            │
│  └─ playwright@1.57.0 (separate)    │
│     └─ browsers: ~/.cache/ms-...    │
└─────────────────────────────────────┘
     ❌ Two separate instances
```

### After (local installation):
```
┌─────────────────────────────────────┐
│  Your Project                       │
│  ├─ @playwright/test@1.57.0         │
│  │  └─ browsers: ~/.cache/ms-...    │
│  │                                   │
│  └─ @executeautomation/             │
│     playwright-mcp-server@1.0.12    │
│     └─ uses shared playwright ──────┘
│        ✅ Single shared instance
└─────────────────────────────────────┘
```

## Environment Variable

The configuration maintains `PLAYWRIGHT_BROWSERS_PATH: "0"` which tells Playwright to use the default system-wide browser cache location. This ensures:
- Browsers are cached in the standard location (`~/.cache/ms-playwright` on Linux/Mac, `%USERPROFILE%\AppData\Local\ms-playwright` on Windows)
- Multiple projects can share the same browser binaries
- No per-project browser duplication

## Troubleshooting

### If MCP tools don't work after the fix:

1. **Restart Cursor**: Always restart after MCP configuration changes
2. **Check installation**: Run `npm list @executeautomation/playwright-mcp-server`
3. **Verify path**: Ensure `node_modules/@executeautomation/playwright-mcp-server/dist/index.js` exists
4. **Check Node version**: Requires Node.js v18+ (check with `node --version`)
5. **Reinstall if needed**: `npm install --save-dev @executeautomation/playwright-mcp-server`

### If you see browser installation errors:

Run:
```bash
npx playwright install chromium
```

This ensures browsers are installed for your shared Playwright instance.

## Maintenance

- The MCP server version is now tracked in `package.json` as a dev dependency
- Updates are managed via npm: `npm update @executeautomation/playwright-mcp-server`
- Version should be compatible with your `@playwright/test` version
- Current versions:
  - `@playwright/test`: 1.57.0
  - `@executeautomation/playwright-mcp-server`: 1.0.12 (depends on playwright@1.57.0)

## Related Documentation

- [setup.md](./setup.md) - Full MCP setup guide
- [quick-start.md](./quick-start.md) - Getting started
- [configuration.md](./configuration.md) - Configuration reference
- [Playwright Documentation](https://playwright.dev) - Official Playwright docs

---

**Fixed**: February 12, 2026  
**Issue**: Separate Playwright instances between MCP tools and project  
**Solution**: Local installation with shared instance  
**Status**: ✅ Verified and working
