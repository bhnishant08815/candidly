#!/usr/bin/env node
/**
 * Script to show Playwright report with automatic port conflict resolution
 * Tries to use port 9323, but automatically finds an available port if needed
 */

import { execSync, spawn } from 'child_process';
import { platform } from 'os';

const DEFAULT_PORT = 9323;

function isPortInUse(port: number): boolean {
  try {
    if (platform() === 'win32') {
      // Windows: Check if port is in use
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: 'pipe' });
      const lines = result.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
      // Check if any line shows LISTENING state
      return lines.some(line => line.includes('LISTENING'));
    } else {
      // Unix-like: Check if port is in use
      execSync(`lsof -ti:${port}`, { encoding: 'utf-8', stdio: 'pipe' });
      return true;
    }
  } catch {
    return false;
  }
}

function killProcessOnPort(port: number): boolean {
  try {
    if (platform() === 'win32') {
      // Windows: Find and kill process using the port
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      const lines = result.trim().split(/\r?\n/).filter(line => line.includes('LISTENING'));
      for (const line of lines) {
        const match = line.match(/\s+(\d+)\s*$/);
        if (match) {
          const pid = match[1];
          try {
            execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf-8', stdio: 'pipe' });
            console.log(`Killed process ${pid} using port ${port}`);
            return true;
          } catch {
            // Process might have already terminated
          }
        }
      }
    } else {
      // Unix-like: Kill process using the port
      const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' }).trim();
      execSync(`kill -9 ${pid}`, { encoding: 'utf-8', stdio: 'pipe' });
      console.log(`Killed process ${pid} using port ${port}`);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function findAvailablePort(startPort: number, maxAttempts: number = 10): number {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (!isPortInUse(port)) {
      return port;
    }
  }
  throw new Error(`Could not find an available port starting from ${startPort}`);
}

async function main() {
  let port = DEFAULT_PORT;

  // Check if default port is in use
  if (isPortInUse(port)) {
    console.log(`Port ${port} is already in use. Attempting to free it...`);
    
    // Try to kill the process using the port
    const killed = killProcessOnPort(port);
    
    // Wait a moment for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check again if port is still in use
    if (isPortInUse(port)) {
      console.log(`Port ${port} is still in use. Finding an alternative port...`);
      port = findAvailablePort(port + 1);
      console.log(`Using port ${port} instead.`);
    } else {
      console.log(`Port ${port} is now available.`);
    }
  }

  // Run playwright show-report with the determined port
  console.log(`Starting Playwright report server on port ${port}...`);
  const playwrightProcess = spawn('npx', ['playwright', 'show-report', '--port', port.toString()], {
    stdio: 'inherit',
    shell: true
  });

  playwrightProcess.on('error', (error) => {
    console.error(`Failed to start Playwright report server: ${error.message}`);
    process.exit(1);
  });

  playwrightProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

