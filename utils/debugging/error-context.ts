import { Page, Locator } from '@playwright/test';
import * as path from 'path';

/**
 * Enhanced Error Context Utility
 * Provides rich context for debugging test failures
 */

export interface ErrorContext {
  testTitle: string;
  step: string;
  pageUrl?: string;
  elementInfo?: {
    selector?: string;
    text?: string;
    isVisible?: boolean;
    isEnabled?: boolean;
    boundingBox?: { x: number; y: number; width: number; height: number } | null;
  };
  pageState?: {
    title?: string;
    url?: string;
    viewport?: { width: number; height: number };
  };
  timestamp: string;
  screenshotPath?: string;
}

/**
 * Capture error context for debugging
 */
export async function captureErrorContext(
  page: Page,
  testTitle: string,
  step: string,
  element?: Locator
): Promise<ErrorContext> {
  const context: ErrorContext = {
    testTitle,
    step,
    timestamp: new Date().toISOString(),
  };

  try {
    // Capture page state
    context.pageState = {
      title: await page.title().catch(() => undefined),
      url: page.url(),
      viewport: page.viewportSize() || undefined,
    };
    context.pageUrl = page.url();

    // Capture element info if provided
    if (element) {
      try {
        const count = await element.count();
        if (count > 0) {
          const firstElement = element.first();
          context.elementInfo = {
            selector: element.toString(),
            text: await firstElement.textContent().catch(() => undefined),
            isVisible: await firstElement.isVisible().catch(() => false),
            isEnabled: await firstElement.isEnabled().catch(() => false),
            boundingBox: await firstElement.boundingBox().catch(() => null),
          };
        } else {
          context.elementInfo = {
            selector: element.toString(),
            text: undefined,
            isVisible: false,
            isEnabled: false,
          };
        }
      } catch (e) {
        context.elementInfo = {
          selector: element.toString(),
        };
      }
    }

    // Capture screenshot
    const screenshotDir = path.join(process.cwd(), 'test-results', 'error-screenshots');
    const screenshotFilename = `error-${Date.now()}-${testTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const screenshotPath = path.join(screenshotDir, screenshotFilename);
    
    try {
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      context.screenshotPath = screenshotPath;
    } catch (e) {
      // Screenshot capture failed, continue without it
    }
  } catch (e) {
    // If context capture fails, return what we have
  }

  return context;
}

/**
 * Format error context as a readable string
 */
export function formatErrorContext(context: ErrorContext): string {
  const lines: string[] = [];
  
  lines.push(`\n🔍 Error Context:`);
  lines.push(`   Test: ${context.testTitle}`);
  lines.push(`   Step: ${context.step}`);
  lines.push(`   Time: ${context.timestamp}`);
  
  if (context.pageState) {
    lines.push(`\n📄 Page State:`);
    if (context.pageState.title) {
      lines.push(`   Title: ${context.pageState.title}`);
    }
    if (context.pageState.url) {
      lines.push(`   URL: ${context.pageState.url}`);
    }
    if (context.pageState.viewport) {
      lines.push(`   Viewport: ${context.pageState.viewport.width}x${context.pageState.viewport.height}`);
    }
  }
  
  if (context.elementInfo) {
    lines.push(`\n🎯 Element Info:`);
    if (context.elementInfo.selector) {
      lines.push(`   Selector: ${context.elementInfo.selector}`);
    }
    if (context.elementInfo.text !== undefined) {
      lines.push(`   Text: ${context.elementInfo.text || '(empty)'}`);
    }
    if (context.elementInfo.isVisible !== undefined) {
      lines.push(`   Visible: ${context.elementInfo.isVisible}`);
    }
    if (context.elementInfo.isEnabled !== undefined) {
      lines.push(`   Enabled: ${context.elementInfo.isEnabled}`);
    }
    if (context.elementInfo.boundingBox) {
      const bb = context.elementInfo.boundingBox;
      lines.push(`   Position: (${bb.x}, ${bb.y}), Size: ${bb.width}x${bb.height}`);
    }
  }
  
  if (context.screenshotPath) {
    lines.push(`\n📸 Screenshot: ${context.screenshotPath}`);
  }
  
  return lines.join('\n');
}

/**
 * Enhanced assertion wrapper with context
 */
export async function assertWithContext<T>(
  page: Page,
  testTitle: string,
  step: string,
  assertion: () => Promise<T>,
  element?: Locator
): Promise<T> {
  try {
    return await assertion();
  } catch (error) {
    const context = await captureErrorContext(page, testTitle, step, element);
    const contextMessage = formatErrorContext(context);
    
    // Enhance error message with context
    if (error instanceof Error) {
      error.message = `${error.message}\n${contextMessage}`;
    }
    
    throw error;
  }
}
