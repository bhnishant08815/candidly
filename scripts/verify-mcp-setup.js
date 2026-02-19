#!/usr/bin/env node

/**
 * MCP Setup Verification Script
 * 
 * This script verifies that the MCP configuration is correctly set up
 * and all required dependencies are available.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logSection(message) {
  console.log();
  log(`=== ${message} ===`, 'blue');
}

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Read JSON file
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

// Main verification function
async function verifyMCPSetup() {
  log('\n🔍 MCP Setup Verification for StrataHire Framework\n', 'cyan');
  
  let allChecksPassed = true;
  
  // 1. Check Node.js version
  logSection('Node.js Version');
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 18) {
      logSuccess(`Node.js version: ${nodeVersion} (>= 18 required)`);
    } else {
      logError(`Node.js version: ${nodeVersion} (>= 18 required)`);
      logWarning('Please upgrade Node.js to version 18 or higher');
      allChecksPassed = false;
    }
  } catch (error) {
    logError('Node.js not found');
    allChecksPassed = false;
  }
  
  // 2. Check npm
  logSection('Package Manager');
  if (commandExists('npm')) {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    logSuccess(`npm version: ${npmVersion}`);
  } else {
    logError('npm not found');
    allChecksPassed = false;
  }
  
  // 3. Check npx
  if (commandExists('npx')) {
    logSuccess('npx is available');
  } else {
    logError('npx not found');
    allChecksPassed = false;
  }
  
  // 4. Check Git
  logSection('Git');
  if (commandExists('git')) {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    logSuccess(gitVersion);
  } else {
    logWarning('Git not found (optional for MCP git server)');
  }
  
  // 5. Check Playwright
  logSection('Playwright');
  try {
    const playwrightVersion = execSync('npx playwright --version', { encoding: 'utf8' }).trim();
    logSuccess(playwrightVersion);
  } catch {
    logWarning('Playwright not found. Run: npm install');
  }
  
  // 6. Check MCP configuration file
  logSection('MCP Configuration');
  const mcpConfigPath = path.join(process.cwd(), '.cursor', 'mcp.json');
  
  if (fileExists(mcpConfigPath)) {
    logSuccess('MCP configuration file exists: .cursor/mcp.json');
    
    const mcpConfig = readJSON(mcpConfigPath);
    if (mcpConfig) {
      logSuccess('MCP configuration is valid JSON');
      
      // Check configured servers
      if (mcpConfig.mcpServers) {
        const servers = Object.keys(mcpConfig.mcpServers);
        logInfo(`Configured MCP servers: ${servers.join(', ')}`);
        
        // Verify each server configuration
        servers.forEach(serverName => {
          const server = mcpConfig.mcpServers[serverName];
          if (server.command && server.args) {
            logSuccess(`  ✓ ${serverName}: properly configured`);
          } else {
            logError(`  ✗ ${serverName}: missing command or args`);
            allChecksPassed = false;
          }
        });
      } else {
        logError('No MCP servers configured');
        allChecksPassed = false;
      }
    } else {
      logError('MCP configuration is invalid JSON');
      allChecksPassed = false;
    }
  } else {
    logError('MCP configuration file not found: .cursor/mcp.json');
    logInfo('Run the MCP setup script to create it');
    allChecksPassed = false;
  }
  
  // 7. Check project structure
  logSection('Project Structure');
  const requiredDirs = ['tests', 'pages', 'utils', 'config'];
  
  requiredDirs.forEach(dir => {
    if (fileExists(path.join(process.cwd(), dir))) {
      logSuccess(`Directory exists: ${dir}/`);
    } else {
      logError(`Directory missing: ${dir}/`);
      allChecksPassed = false;
    }
  });
  
  // 8. Check key files
  const requiredFiles = [
    'package.json',
    'playwright.config.ts',
    'tsconfig.json'
  ];
  
  requiredFiles.forEach(file => {
    if (fileExists(path.join(process.cwd(), file))) {
      logSuccess(`File exists: ${file}`);
    } else {
      logError(`File missing: ${file}`);
      allChecksPassed = false;
    }
  });
  
  // 9. Check documentation
  logSection('MCP Documentation');
  const docFiles = [
    'docs/mcp/quick-start.md',
    'docs/mcp/configuration.md',
    'docs/mcp/README.md'
  ];
  
  docFiles.forEach(file => {
    if (fileExists(path.join(process.cwd(), file))) {
      logSuccess(`Documentation exists: ${file}`);
    } else {
      logWarning(`Documentation missing: ${file}`);
    }
  });
  
  // 10. Check if running in Cursor
  logSection('Cursor IDE');
  if (process.env.CURSOR_SESSION_ID || process.env.VSCODE_PID) {
    logSuccess('Running in Cursor/VSCode environment');
  } else {
    logWarning('Not detected as running in Cursor IDE');
    logInfo('MCP features require Cursor IDE');
  }
  
  // 11. Test MCP server availability (optional)
  logSection('MCP Server Availability');
  logInfo('Testing if MCP servers can be installed...');
  
  const testServers = [
    '@executeautomation/playwright-mcp-server',
    '@modelcontextprotocol/server-filesystem',
    '@modelcontextprotocol/server-git'
  ];
  
  testServers.forEach(server => {
    try {
      // Just check if the package exists (don't actually install)
      execSync(`npm view ${server} version`, { stdio: 'ignore' });
      logSuccess(`  ✓ ${server} is available`);
    } catch {
      logWarning(`  ⚠ ${server} may not be available`);
    }
  });
  
  // Final summary
  logSection('Summary');
  
  if (allChecksPassed) {
    log('\n✅ All checks passed! MCP is properly configured.\n', 'green');
    logInfo('Next steps:');
    logInfo('1. Restart Cursor IDE');
    logInfo('2. Open the StrataHire project');
    logInfo('3. Try asking the AI assistant to help with tests');
    logInfo('\nFor more information, see: docs/mcp/quick-start.md');
  } else {
    log('\n❌ Some checks failed. Please review the errors above.\n', 'red');
    logInfo('Common fixes:');
    logInfo('1. Install Node.js v18 or higher');
    logInfo('2. Run: npm install');
    logInfo('3. Ensure .cursor/mcp.json exists');
    logInfo('4. Restart Cursor IDE');
    logInfo('\nFor detailed help, see: docs/mcp/configuration.md');
  }
  
  console.log();
}

// Run verification
verifyMCPSetup().catch(error => {
  logError(`Verification failed: ${error.message}`);
  process.exit(1);
});
