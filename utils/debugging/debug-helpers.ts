import { Page, Locator } from '@playwright/test';

/**
 * Debugging Helper Utilities
 * Tools to help debug test failures and inspect page state
 */

/**
 * Inspect element details for debugging
 */
export async function inspectElement(locator: Locator): Promise<{
  count: number;
  visible: boolean;
  enabled: boolean;
  text: string | null;
  attributes: Record<string, string | null>;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  computedStyles: Record<string, string>;
}> {
  const count = await locator.count();
  
  if (count === 0) {
    return {
      count: 0,
      visible: false,
      enabled: false,
      text: null,
      attributes: {},
      boundingBox: null,
      computedStyles: {},
    };
  }

  const first = locator.first();
  
  const [visible, enabled, text, boundingBox] = await Promise.all([
    first.isVisible().catch(() => false),
    first.isEnabled().catch(() => false),
    first.textContent().catch(() => null),
    first.boundingBox().catch(() => null),
  ]);

  // Get attributes
  const attributes: Record<string, string | null> = {};
  try {
    const element = await first.elementHandle();
    if (element) {
      const attrs = await element.evaluate((el) => {
        const result: Record<string, string | null> = {};
        for (const attr of el.attributes) {
          result[attr.name] = attr.value;
        }
        return result;
      });
      Object.assign(attributes, attrs);
    }
  } catch (e) {
    // Failed to get attributes
  }

  // Get computed styles
  const computedStyles: Record<string, string> = {};
  try {
    const element = await first.elementHandle();
    if (element) {
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          position: computed.position,
          zIndex: computed.zIndex,
        };
      });
      Object.assign(computedStyles, styles);
    }
  } catch (e) {
    // Failed to get styles
  }

  return {
    count,
    visible,
    enabled,
    text,
    attributes,
    boundingBox,
    computedStyles,
  };
}

/**
 * Log element details for debugging
 */
export async function logElementDetails(
  locator: Locator,
  label: string = 'Element'
): Promise<void> {
  const details = await inspectElement(locator);
  
  console.log(`\n🔍 ${label} Details:`);
  console.log(`   Count: ${details.count}`);
  console.log(`   Visible: ${details.visible}`);
  console.log(`   Enabled: ${details.enabled}`);
  console.log(`   Text: ${details.text || '(empty)'}`);
  
  if (details.boundingBox) {
    const bb = details.boundingBox;
    console.log(`   Position: (${bb.x}, ${bb.y})`);
    console.log(`   Size: ${bb.width}x${bb.height}`);
  }
  
  if (Object.keys(details.attributes).length > 0) {
    console.log(`   Attributes:`, details.attributes);
  }
  
  if (Object.keys(details.computedStyles).length > 0) {
    console.log(`   Styles:`, details.computedStyles);
  }
}

/**
 * Capture page state snapshot
 */
export async function capturePageState(page: Page): Promise<{
  url: string;
  title: string;
  viewport: { width: number; height: number } | null;
  visibleElements: number;
  dialogs: string[];
  consoleErrors: string[];
}> {
  const [url, title, viewport] = await Promise.all([
    page.url(),
    page.title().catch(() => ''),
    Promise.resolve(page.viewportSize()),
  ]);

  // Count visible elements
  const visibleElements = await page.locator('body *').count().catch(() => 0);

  // Find open dialogs
  const dialogs: string[] = [];
  try {
    const dialogLocators = await page.locator('[role="dialog"]').all();
    for (const dialog of dialogLocators) {
      const text = await dialog.textContent().catch(() => '');
      if (text) dialogs.push(text.substring(0, 100));
    }
  } catch (e) {
    // Failed to get dialogs
  }

  // Get console errors (if available)
  const consoleErrors: string[] = [];
  // Note: This would require setting up console listeners before page load
  // For now, return empty array

  return {
    url,
    title,
    viewport,
    visibleElements,
    dialogs,
    consoleErrors,
  };
}

/**
 * Log page state for debugging
 */
export async function logPageState(page: Page, label: string = 'Page State'): Promise<void> {
  const state = await capturePageState(page);
  
  console.log(`\n📄 ${label}:`);
  console.log(`   URL: ${state.url}`);
  console.log(`   Title: ${state.title}`);
  if (state.viewport) {
    console.log(`   Viewport: ${state.viewport.width}x${state.viewport.height}`);
  }
  console.log(`   Visible Elements: ${state.visibleElements}`);
  if (state.dialogs.length > 0) {
    console.log(`   Open Dialogs: ${state.dialogs.length}`);
    state.dialogs.forEach((dialog, i) => {
      console.log(`     ${i + 1}. ${dialog}`);
    });
  }
}

/**
 * Wait and log element state changes
 */
export async function waitAndLogElementState(
  locator: Locator,
  expectedState: 'visible' | 'hidden' | 'enabled' | 'disabled',
  timeout: number = 5000,
  label: string = 'Element'
): Promise<void> {
  const startTime = Date.now();
  
  try {
    if (expectedState === 'visible') {
      await locator.waitFor({ state: 'visible', timeout });
    } else if (expectedState === 'hidden') {
      await locator.waitFor({ state: 'hidden', timeout });
    } else if (expectedState === 'enabled') {
      await locator.waitFor({ state: 'attached', timeout });
      const enabled = await locator.isEnabled();
      if (!enabled) {
        throw new Error(`Element is not enabled after ${timeout}ms`);
      }
    } else if (expectedState === 'disabled') {
      await locator.waitFor({ state: 'attached', timeout });
      const enabled = await locator.isEnabled();
      if (enabled) {
        throw new Error(`Element is still enabled after ${timeout}ms`);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`✓ ${label} became ${expectedState} after ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`✗ ${label} did not become ${expectedState} after ${duration}ms`);
    await logElementDetails(locator, label);
    throw error;
  }
}
