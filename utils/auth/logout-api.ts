/**
 * Logout API Helper
 * Performs logout via API instead of UI for more reliable test cleanup
 */

import { APIRequestContext } from '@playwright/test';
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
): Promise<void> {
  const logoutConfig = testConfig.logoutApi;
  
  if (!logoutConfig || !logoutConfig.url) {
    throw new Error(
      'Logout API not configured. Please set logoutApi.url in config/test-config.ts'
    );
  }

  const method = logoutConfig.method ?? 'POST';
  
  console.log(`🔓 Calling logout API: ${method} ${logoutConfig.url}`);
  
  try {
    const response = await request.fetch(logoutConfig.url, {
      method: method,
    });
    
    if (!response.ok()) {
      console.warn(
        `⚠️ Logout API returned non-2xx status: ${response.status()} ${response.statusText()}`
      );
    } else {
      console.log(`✅ Logout API successful: ${response.status()}`);
    }
  } catch (error) {
    console.error('❌ Logout API call failed:', error);
    throw error;
  }
}
