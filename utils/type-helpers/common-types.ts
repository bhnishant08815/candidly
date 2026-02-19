/**
 * Common Type Definitions
 * Shared types for better type safety across the framework
 */

/**
 * Form field value types
 */
export type FormFieldValue = string | number | boolean | null | undefined;

/**
 * Form data structure
 */
export interface FormData {
  [fieldName: string]: FormFieldValue | FormFieldValue[];
}

/**
 * Test result status
 */
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'timedOut';

/**
 * Element state for waiting
 */
export type ElementState = 'visible' | 'hidden' | 'attached' | 'detached' | 'enabled' | 'disabled';

/**
 * Wait options
 */
export interface WaitOptions {
  timeout?: number;
  state?: ElementState;
  retries?: number;
}

/**
 * Fill options for form fields
 */
export interface FillOptions {
  clear?: boolean;
  force?: boolean;
  timeout?: number;
}

/**
 * Click options
 */
export interface ClickOptions {
  force?: boolean;
  timeout?: number;
  retries?: number;
}

/**
 * Select option configuration
 */
export interface SelectOption {
  label?: string;
  value?: string;
  index?: number;
  exact?: boolean;
}

/**
 * Navigation options
 */
export interface NavigationOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  timeout?: number;
}

/**
 * API response wrapper
 */
export interface APIResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

/**
 * Test data generator options
 */
export interface TestDataOptions {
  unique?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Cleanup options
 */
export interface CleanupOptions {
  deleteCreatedRecords?: boolean;
  logoutViaApi?: boolean;
  dismissNotifications?: boolean;
  closeDialogs?: boolean;
  verbose?: boolean;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  duration: number;
  startTime: number;
  endTime: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

/**
 * Assertion result
 */
export interface AssertionResult {
  passed: boolean;
  message?: string;
  expected?: unknown;
  actual?: unknown;
}
