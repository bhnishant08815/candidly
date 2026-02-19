/**
 * Logout API Helper
 * Performs logout via API instead of UI for more reliable test cleanup
 */

import { APIRequestContext, Page } from '@playwright/test';
import { testConfig } from '../../config/test-config';

/**
 * Logout via API call
 * Uses the configured logout API endpoint with cookies from the current context
 *
 * @param request - APIRequestContext from page.request or context.request
 * @param baseURL - Base URL of the application (used for same-origin cookie handling)
 * @throws Error if logoutApi is not configured in test-config
 */
export async function logoutViaApi(
  request: APIRequestContext,
  baseURL: string
): Promise<boolean> {
  const logoutConfig = testConfig.logoutApi;

  if (!logoutConfig || !logoutConfig.url) {
    throw new Error(
      'Logout API not configured. Please set logoutApi.url in config/test-config.ts'
    );
  }

  const method = logoutConfig.method ?? 'GET';

  console.log(`🔓 Calling logout API: ${method} ${logoutConfig.url}`);

  const response = await request.fetch(logoutConfig.url, {
    method,
  });

  if (!response.ok()) {
    console.warn(
      `⚠️ Logout API returned non-2xx status: ${response.status()} ${response.statusText()}`
    );
    return false;
  }
  console.log(`✅ Logout API successful: ${response.status()}`);
  return true;
}

/**
 * Safely logout via API - won't throw on failure
 * Delegates to logoutViaApi with try/catch
 */
export async function logoutViaApiSafe(
  page: Page,
  verbose: boolean = false
): Promise<boolean> {
  try {
    const ok = await logoutViaApi(page.request, testConfig.baseURL);
    if (verbose && ok) {
      console.log('🔓 Logout API successful');
    }
    return ok;
  } catch (error) {
    if (verbose) {
      console.log(`⚠️ Logout API failed: ${error}`);
    }
    return false;
  }
}
