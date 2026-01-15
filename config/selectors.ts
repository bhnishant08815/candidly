import { Page, Locator } from '@playwright/test';

/**
 * Centralized Selector Management
 * Provides a single source of truth for all selectors with fallback strategies
 */

export const Selectors = {
  login: {
    emailInput: "input[placeholder='johndoe@business.com']",
    passwordInput: 'input[type="password"]',
    loginButton: "button:has-text('Login')",
    continueButton: "button:has-text('Continue')",
    signInButton: "span:has-text('Sign In')",
  },
  jobPosting: {
    addNewJob: "button:has-text('Add New Job')",
    jobTitle: "textbox[name='Job Title *']",
    openPositions: "spinbutton[name='Open Positions Count *']",
    roleSummary: "textbox[name='Role Summary *']",
    responsibilityInput: "textbox[name='Add a responsibility']",
    qualificationInput: "textbox[name='Add a qualification']",
    skillInput: "textbox[name='Add a skill']",
    compensationInput: "textbox[name='Compensation and Benefits *']",
    continueButton: "button:has-text('Continue')",
    reviewButton: "button:has-text('Review')",
    saveAsDraft: "text=/Save as Draft/i",
    aiPoweredButton: "button:has-text(/AI-Powered/i)",
    documentUploadButton: "button:has-text(/Document Upload/i)",
    dialog: "dialog[name='Add New Job Posting']",
  },
  applicants: {
    addApplicantButton: "button:has-text('Add Applicant')",
    uploadArea: "text=Click to upload or drag and",
    dialog: "dialog[name='Add New Applicant']",
    fullNameInput: "textbox[name='Full Name *']",
    emailInput: "textbox[name='Email *']",
    phoneInput: "textbox[name='Phone *']",
  },
  dashboard: {
    postingsButton: "button:has-text('Postings')",
    applicantsButton: "button:has-text('Applicants')",
    interviewsButton: "button:has-text('Interviews')",
    notificationsClose: "button[aria-label*='close']",
  },
} as const;

/**
 * Create a resilient locator with fallback strategies
 * @param page Playwright page instance
 * @param selectors Array of selector strategies to try (in order of preference)
 * @param strategy Selector strategy type
 * @returns Locator that matches the first working selector
 */
export function createResilientLocator(
  page: Page,
  selectors: string[],
  strategy: 'role' | 'text' | 'css' | 'xpath' = 'css'
): Locator {
  for (const selector of selectors) {
    try {
      let locator: Locator;
      
      switch (strategy) {
        case 'role':
          // For role strategy, selector should be in format "role,name"
          const [role, name] = selector.split(',');
          locator = page.getByRole(role as any, { name: name?.trim() });
          break;
        case 'text':
          locator = page.getByText(selector);
          break;
        case 'xpath':
          locator = page.locator(selector);
          break;
        default:
          locator = page.locator(selector);
      }
      
      // Quick check if locator exists (non-blocking)
      const count = locator.count();
      if (count !== undefined) {
        return locator;
      }
    } catch {
      // Continue to next selector
      continue;
    }
  }
  
  throw new Error(`No selector matched from: ${selectors.join(', ')}`);
}

/**
 * Get locator by role with fallback
 */
export function getByRoleWithFallback(
  page: Page,
  role: string,
  name: string,
  fallbacks?: string[]
): Locator {
  try {
    return page.getByRole(role as any, { name });
  } catch {
    if (fallbacks && fallbacks.length > 0) {
      return createResilientLocator(page, fallbacks, 'css');
    }
    throw new Error(`Could not find element with role="${role}" and name="${name}"`);
  }
}

