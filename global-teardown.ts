/**
 * Global Teardown
 * Runs once after ALL tests complete
 * Used for cleanup that should happen at the end of the entire test run
 */

import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 ========================================');
  console.log('   GLOBAL TEARDOWN - Post-Test Cleanup');
  console.log('==========================================\n');

  const startTime = Date.now();

  try {
    // 1. Clean up temporary test files (optional)
    await cleanupTempFiles();

    // 2. Log test run completion
    logTestRunCompletion();

    // 3. Optional: Clean up stale auth state files if they're too old
    await cleanupStaleAuthState();

  } catch (error) {
    console.error('⚠️ Global teardown encountered an error:', error);
    // Don't throw - let tests complete even if teardown fails
  }

  const duration = Date.now() - startTime;
  console.log(`\n✅ Global teardown completed in ${duration}ms\n`);
}

/**
 * Clean up temporary files created during tests
 */
async function cleanupTempFiles(): Promise<void> {
  const tempDirs = [
    'test-temp',
    'test-output/temp',
  ];

  for (const dir of tempDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  ✓ Cleaned up: ${dir}`);
      } catch (error) {
        console.log(`  ⚠️ Could not clean ${dir}: ${error}`);
      }
    }
  }
}

/**
 * Log test run completion summary
 */
function logTestRunCompletion(): void {
  const timestamp = new Date().toISOString();
  console.log(`  ✓ Test run completed at: ${timestamp}`);
  console.log(`  ✓ Environment: ${process.env.TEST_ENV || 'staging'}`);
  console.log(`  ✓ CI Mode: ${process.env.CI ? 'Yes' : 'No'}`);
}

/**
 * Clean up stale auth state files
 * Only cleans files older than 24 hours to avoid disrupting parallel runs
 */
async function cleanupStaleAuthState(): Promise<void> {
  const authFiles = [
    'auth-state.json',
  ];

  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const file of authFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        const age = Date.now() - stats.mtimeMs;
        
        if (age > maxAge) {
          fs.unlinkSync(fullPath);
          console.log(`  ✓ Removed stale auth state: ${file} (age: ${Math.round(age / 3600000)}h)`);
        } else {
          console.log(`  ℹ️ Auth state ${file} is recent (age: ${Math.round(age / 60000)}min), keeping`);
        }
      } catch (error) {
        console.log(`  ⚠️ Could not check ${file}: ${error}`);
      }
    }
  }
}

export default globalTeardown;
