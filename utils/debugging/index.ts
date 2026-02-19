/**
 * Debugging Utilities
 * Enhanced error reporting and debugging tools for test failures
 */

export {
  captureErrorContext,
  formatErrorContext,
  assertWithContext,
  type ErrorContext,
} from './error-context';

export {
  inspectElement,
  logElementDetails,
  capturePageState,
  logPageState,
  waitAndLogElementState,
} from './debug-helpers';
