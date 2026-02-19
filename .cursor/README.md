# Cursor MCP Configuration

This directory contains the Model Context Protocol (MCP) configuration for the StrataHire test automation framework.

## What's in This Directory

### `mcp.json`

The main MCP configuration file that defines which MCP servers are available to the AI assistant in Cursor.

**Configured Servers**:

1. **Playwright** - Browser automation and testing
2. **File System** - Read/write access to project files
3. **Git** - Version control operations
4. **Sequential Thinking** - Complex problem-solving
5. **Memory** - Knowledge graph for patterns and solutions

## How It Works

When you use the AI assistant in Cursor, it can interact with these MCP servers to:

- 🌐 **Test in browser** - Launch browsers and test your application
- 📁 **Read/write files** - Create and modify test files intelligently
- 🔧 **Manage git** - Commit changes and manage branches
- 🧠 **Plan complex tasks** - Break down and solve complex problems
- 💾 **Remember patterns** - Learn and remember project-specific patterns

## Getting Started

1. **Restart Cursor** after this configuration is created
2. **Open the StrataHire project**
3. **Ask the AI assistant** for help with any test automation task

### Example Requests

- "Create a new test for applicant filtering"
- "Debug the failing test TC-JP15"
- "Update the JobPostingPage selectors"
- "Generate a test report summary"

## Documentation

For detailed information, see:

- **Quick Start**: [../docs/mcp/quick-start.md](../docs/mcp/quick-start.md)
- **Full Configuration Guide**: [../docs/mcp/configuration.md](../docs/mcp/configuration.md)
- **Architecture**: [../docs/mcp/architecture.md](../docs/mcp/architecture.md)
- **Examples**: [../docs/mcp/examples.md](../docs/mcp/examples.md)

## Verification

To verify your MCP setup is working:

```bash
npm run verify:mcp
```

This will check:
- Node.js version (v18+)
- npm and npx availability
- MCP configuration validity
- Project structure
- Documentation presence

## Troubleshooting

### MCP Not Working?

1. **Restart Cursor** (most common fix)
2. **Check Node.js version**: `node --version` (need v18+)
3. **Verify configuration**: Ensure `mcp.json` is valid JSON
4. **Check Cursor output**: View → Output → Select "MCP"

### Server Not Starting?

- Ensure `npx` is available: `npx --version`
- Check internet connection (servers are downloaded on first use)
- Try installing manually: `npx -y @executeautomation/playwright-mcp-server`

## Security

MCP servers have limited access:

- **File System**: Only this project directory
- **Git**: Only this repository
- **Browser**: Controlled by Playwright, sandboxed contexts
- **Network**: Only configured test URLs

## Customization

You can modify `mcp.json` to:

- Add new MCP servers
- Change environment variables
- Adjust server configurations
- Enable/disable specific servers

See [configuration.md](../docs/mcp/configuration.md) for details.

## Support

For issues or questions:

1. Check the documentation in `docs/`
2. Run verification: `npm run verify:mcp`
3. Review Cursor output panel
4. Check [MCP GitHub](https://github.com/modelcontextprotocol/servers)

---

**Last Updated**: February 2026  
**MCP Version**: 1.0
