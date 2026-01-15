import { Locator, Page, expect } from '@playwright/test';
import { LocatorHealingService, HealingResult } from './locator-healing-service';
import { HealingReporter } from './healing-reporter';

/**
 * Semantic Context Interface
 * Describes the semantic meaning and purpose of an element for intelligent auto-healing
 */
export interface SemanticContext {
  /** Human-readable purpose of the element (e.g., "Login Button", "Email Input") */
  purpose: string;

  /** Element type for semantic matching */
  elementType: 'button' | 'input' | 'link' | 'heading' | 'text' | 'dropdown' | 'checkbox' | 'radio' | 'image' | 'custom';

  /** Text patterns that might identify this element (partial matches) */
  textPatterns?: string[];

  /** ARIA role for role-based fallback (e.g., 'button', 'textbox', 'link') */
  ariaRole?: string;

  /** Label or accessible name patterns */
  labelPatterns?: string[];

  /** Placeholder text patterns (for inputs) */
  placeholderPatterns?: string[];

  /** Test ID patterns */
  testIdPatterns?: string[];

  /** CSS class patterns (partial matches) */
  classPatterns?: string[];

  /** Attribute patterns for fallback (e.g., { 'data-action': 'submit' }) */
  attributePatterns?: Record<string, string>;

  /** Title attribute patterns */
  titlePatterns?: string[];

  /** Alt text patterns (for images) */
  altPatterns?: string[];

  /** Nearby element context description (for documentation) */
  nearbyContext?: string;

  /** Form context if inside a form (e.g., 'login', 'registration') */
  formContext?: string;
}

/**
 * Semantic Locator Options
 */
export interface SemanticLocatorOptions {
  /** Timeout for element operations (default: 10000ms) */
  timeout?: number;

  /** Whether to enable auto-healing (default: true) */
  enableHealing?: boolean;

  /** Maximum healing attempts (default: 5) */
  maxHealingAttempts?: number;

  /** Whether to log healing events (default: true) */
  logHealing?: boolean;
}

/**
 * Semantic Locator
 * Wraps a primary locator with semantic context for intelligent auto-healing.
 * When the primary locator fails, uses the semantic context to find the element
 * using alternative strategies.
 */
export class SemanticLocator {
  private readonly page: Page;
  private readonly primaryLocator: Locator;
  private readonly fallbackLocators: Locator[];
  private readonly context: SemanticContext;
  private readonly options: Required<SemanticLocatorOptions>;
  private readonly healingService: LocatorHealingService;
  
  // Track if this locator was healed in the current session
  private wasHealed: boolean = false;
  private healedWith: string | null = null;

  constructor(
    page: Page,
    primaryLocator: Locator,
    context: SemanticContext,
    fallbackLocators: Locator[] = [],
    options: SemanticLocatorOptions = {}
  ) {
    this.page = page;
    this.primaryLocator = primaryLocator;
    this.context = context;
    this.fallbackLocators = fallbackLocators;
    
    // Set default options
    this.options = {
      timeout: options.timeout ?? 10000,
      enableHealing: options.enableHealing ?? true,
      maxHealingAttempts: options.maxHealingAttempts ?? 5,
      logHealing: options.logHealing ?? true,
    };

    this.healingService = new LocatorHealingService(page, context, this.options.timeout);
  }

  /**
   * Get a working locator - tries primary first, then fallbacks, then healing strategies
   * @returns A locator that points to the element
   */
  async getLocator(): Promise<Locator> {
    // Try primary locator first
    if (await this.isLocatorValid(this.primaryLocator)) {
      return this.primaryLocator;
    }

    // Try explicit fallback locators
    for (const fallback of this.fallbackLocators) {
      if (await this.isLocatorValid(fallback)) {
        this.reportHealing('explicit fallback', fallback.toString());
        return fallback;
      }
    }

    // If healing is disabled, throw error
    if (!this.options.enableHealing) {
      throw new Error(
        `Primary locator failed for "${this.context.purpose}" and healing is disabled. ` +
        `No fallback locators matched.`
      );
    }

    // Try healing strategies
    const healingResult = await this.healingService.heal();
    
    if (healingResult.success && healingResult.locator) {
      this.reportHealing(healingResult.strategy!, healingResult.locatorDescription!);
      return healingResult.locator;
    }

    // All strategies failed
    throw new Error(
      `Unable to find element "${this.context.purpose}". ` +
      `Primary locator and all ${this.options.maxHealingAttempts} healing strategies failed. ` +
      `Strategies tried: ${healingResult.strategiesTried?.join(', ') || 'none'}`
    );
  }

  /**
   * Check if a locator points to a visible element
   */
  private async isLocatorValid(locator: Locator): Promise<boolean> {
    try {
      const count = await locator.count();
      if (count === 0) return false;
      
      return await locator.first().isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Report that healing occurred
   */
  private reportHealing(strategy: string, locatorDescription: string): void {
    this.wasHealed = true;
    this.healedWith = strategy;

    if (this.options.logHealing) {
      HealingReporter.addHealingEvent({
        purpose: this.context.purpose,
        elementType: this.context.elementType,
        primaryLocatorFailed: true,
        healedStrategy: strategy,
        healedLocator: locatorDescription,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get the semantic context
   */
  getContext(): SemanticContext {
    return this.context;
  }

  /**
   * Check if this locator was healed
   */
  wasElementHealed(): boolean {
    return this.wasHealed;
  }

  /**
   * Get the strategy used for healing (if healed)
   */
  getHealingStrategy(): string | null {
    return this.healedWith;
  }

  // ============ Convenience Methods ============

  /**
   * Click the element with auto-healing
   */
  async click(options?: { force?: boolean; timeout?: number }): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toBeVisible({ timeout: options?.timeout ?? this.options.timeout });
    await expect(locator).toBeEnabled({ timeout: options?.timeout ?? this.options.timeout });
    await locator.scrollIntoViewIfNeeded();
    await locator.click({ force: options?.force, timeout: options?.timeout ?? this.options.timeout });
  }

  /**
   * Fill the element with text (for inputs)
   */
  async fill(text: string, options?: { clear?: boolean; timeout?: number }): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toBeVisible({ timeout: options?.timeout ?? this.options.timeout });
    await expect(locator).toBeEnabled({ timeout: options?.timeout ?? this.options.timeout });
    
    if (options?.clear !== false) {
      await locator.clear();
    }
    
    await locator.fill(text);
  }

  /**
   * Get text content of the element
   */
  async getText(): Promise<string> {
    const locator = await this.getLocator();
    await expect(locator).toBeVisible({ timeout: this.options.timeout });
    return await locator.textContent() ?? '';
  }

  /**
   * Get input value
   */
  async getValue(): Promise<string> {
    const locator = await this.getLocator();
    return await locator.inputValue();
  }

  /**
   * Check if element is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      const locator = await this.getLocator();
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const locator = await this.getLocator();
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is disabled
   */
  async isDisabled(): Promise<boolean> {
    try {
      const locator = await this.getLocator();
      return await locator.isDisabled();
    } catch {
      return false;
    }
  }

  /**
   * Verify element is visible with assertion
   */
  async expectVisible(timeout?: number): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toBeVisible({ timeout: timeout ?? this.options.timeout });
  }

  /**
   * Verify element is hidden with assertion
   */
  async expectHidden(timeout?: number): Promise<void> {
    // For hidden check, use primary locator since element might not be findable
    await expect(this.primaryLocator).toBeHidden({ timeout: timeout ?? this.options.timeout });
  }

  /**
   * Verify element has specific text
   */
  async expectText(text: string | RegExp, timeout?: number): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toHaveText(text, { timeout: timeout ?? this.options.timeout });
  }

  /**
   * Verify element has specific value
   */
  async expectValue(value: string | RegExp, timeout?: number): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toHaveValue(value, { timeout: timeout ?? this.options.timeout });
  }

  /**
   * Verify element has specific attribute
   */
  async expectAttribute(name: string, value: string | RegExp, timeout?: number): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toHaveAttribute(name, value, { timeout: timeout ?? this.options.timeout });
  }

  /**
   * Select an option from a dropdown
   */
  async selectOption(value: string | { label?: string; value?: string }): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toBeVisible({ timeout: this.options.timeout });
    await locator.selectOption(value);
  }

  /**
   * Check/uncheck a checkbox or radio
   */
  async setChecked(checked: boolean): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toBeVisible({ timeout: this.options.timeout });
    await locator.setChecked(checked);
  }

  /**
   * Hover over the element
   */
  async hover(): Promise<void> {
    const locator = await this.getLocator();
    await expect(locator).toBeVisible({ timeout: this.options.timeout });
    await locator.scrollIntoViewIfNeeded();
    await locator.hover();
  }

  /**
   * Get attribute value
   */
  async getAttribute(name: string): Promise<string | null> {
    const locator = await this.getLocator();
    return await locator.getAttribute(name);
  }

  /**
   * Wait for element to be in specific state
   */
  async waitFor(state: 'visible' | 'hidden' | 'attached' | 'detached', timeout?: number): Promise<void> {
    const locator = await this.getLocator();
    await locator.waitFor({ state, timeout: timeout ?? this.options.timeout });
  }
}
