import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Screenshot Helper Utility
 * Provides methods to capture screenshots at key test steps
 * for better visual reporting
 */
export class ScreenshotHelper {
  private page: Page;
  private screenshotDir: string;
  private testName: string;
  private stepCounter: number = 0;

  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = this.sanitizeFileName(testName);
    this.screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots', this.testName);
    this.ensureDirectory();
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
      .substring(0, 100);
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Capture a screenshot with a descriptive name
   * @param stepName Descriptive name for the screenshot step
   * @param fullPage Whether to capture full page (default: false)
   */
  async capture(stepName: string, fullPage: boolean = false): Promise<string> {
    this.stepCounter++;
    const sanitizedStepName = this.sanitizeFileName(stepName);
    const fileName = `${this.stepCounter.toString().padStart(3, '0')}_${sanitizedStepName}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    await this.page.screenshot({
      path: filePath,
      fullPage: fullPage
    });

    return filePath;
  }

  /**
   * Capture screenshot of a specific element
   * @param selector CSS selector or locator
   * @param stepName Descriptive name for the screenshot
   */
  async captureElement(selector: string, stepName: string): Promise<string> {
    this.stepCounter++;
    const sanitizedStepName = this.sanitizeFileName(stepName);
    const fileName = `${this.stepCounter.toString().padStart(3, '0')}_${sanitizedStepName}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    const element = this.page.locator(selector).first();
    await element.screenshot({ path: filePath });

    return filePath;
  }

  /**
   * Capture screenshot before an action
   * @param actionName Name of the action about to be performed
   */
  async beforeAction(actionName: string): Promise<string> {
    return this.capture(`before_${actionName}`, false);
  }

  /**
   * Capture screenshot after an action
   * @param actionName Name of the action just performed
   */
  async afterAction(actionName: string): Promise<string> {
    return this.capture(`after_${actionName}`, false);
  }

  /**
   * Capture screenshot on success
   * @param stepName Name of the successful step
   */
  async onSuccess(stepName: string): Promise<string> {
    return this.capture(`success_${stepName}`, false);
  }

  /**
   * Capture screenshot on error
   * @param stepName Name of the step that failed
   */
  async onError(stepName: string): Promise<string> {
    return this.capture(`error_${stepName}`, true);
  }
}

