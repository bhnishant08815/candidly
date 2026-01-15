import { Locator, Page } from '@playwright/test';
import { SemanticContext } from './semantic-locator';

/**
 * Result of a healing attempt
 */
export interface HealingResult {
  /** Whether healing was successful */
  success: boolean;

  /** The healed locator (if successful) */
  locator?: Locator;

  /** The strategy that worked (if successful) */
  strategy?: string;

  /** Description of the healed locator */
  locatorDescription?: string;

  /** All strategies that were tried */
  strategiesTried?: string[];

  /** Error message (if failed) */
  error?: string;
}

/**
 * Healing Strategy Interface
 */
interface HealingStrategy {
  name: string;
  priority: number;
  apply: (page: Page, context: SemanticContext) => Promise<Locator | null>;
}

/**
 * Locator Healing Service
 * Implements multiple strategies to find elements when primary locators fail.
 * Uses semantic context to intelligently locate elements based on their purpose.
 */
export class LocatorHealingService {
  private readonly page: Page;
  private readonly context: SemanticContext;
  private readonly timeout: number;
  private readonly strategies: HealingStrategy[];

  constructor(page: Page, context: SemanticContext, timeout: number = 10000) {
    this.page = page;
    this.context = context;
    this.timeout = timeout;
    
    // Initialize strategies in priority order
    this.strategies = this.initializeStrategies();
  }

  /**
   * Initialize healing strategies in priority order
   */
  private initializeStrategies(): HealingStrategy[] {
    return [
      // Strategy 1: Role-based with text (most reliable for semantic elements)
      {
        name: 'role-with-text',
        priority: 1,
        apply: async (page, context) => {
          if (!context.ariaRole || !context.textPatterns?.length) return null;
          
          for (const pattern of context.textPatterns) {
            try {
              const locator = page.getByRole(context.ariaRole as any, { 
                name: new RegExp(pattern, 'i') 
              });
              if (await this.isValidLocator(locator)) return locator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 2: Role-based with label patterns
      {
        name: 'role-with-label',
        priority: 2,
        apply: async (page, context) => {
          if (!context.ariaRole || !context.labelPatterns?.length) return null;
          
          for (const pattern of context.labelPatterns) {
            try {
              const locator = page.getByRole(context.ariaRole as any, { 
                name: new RegExp(pattern, 'i') 
              });
              if (await this.isValidLocator(locator)) return locator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 3: Label-based (for form inputs)
      {
        name: 'label',
        priority: 3,
        apply: async (page, context) => {
          if (!context.labelPatterns?.length) return null;
          
          for (const pattern of context.labelPatterns) {
            try {
              const locator = page.getByLabel(new RegExp(pattern, 'i'));
              if (await this.isValidLocator(locator)) return locator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 4: Placeholder-based (for inputs)
      {
        name: 'placeholder',
        priority: 4,
        apply: async (page, context) => {
          if (!context.placeholderPatterns?.length) return null;
          
          for (const pattern of context.placeholderPatterns) {
            try {
              const locator = page.getByPlaceholder(new RegExp(pattern, 'i'));
              if (await this.isValidLocator(locator)) return locator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 5: Text-based (for buttons, links, headings)
      {
        name: 'text',
        priority: 5,
        apply: async (page, context) => {
          if (!context.textPatterns?.length) return null;
          
          for (const pattern of context.textPatterns) {
            try {
              // Try exact match first
              let locator = page.getByText(pattern, { exact: true });
              if (await this.isValidLocator(locator)) return locator;
              
              // Try partial match
              locator = page.getByText(new RegExp(pattern, 'i'));
              if (await this.isValidLocator(locator)) return locator.first();
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 6: Test ID patterns
      {
        name: 'test-id',
        priority: 6,
        apply: async (page, context) => {
          if (!context.testIdPatterns?.length) return null;
          
          for (const pattern of context.testIdPatterns) {
            try {
              const locator = page.getByTestId(pattern);
              if (await this.isValidLocator(locator)) return locator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 7: Title attribute
      {
        name: 'title',
        priority: 7,
        apply: async (page, context) => {
          if (!context.titlePatterns?.length) return null;
          
          for (const pattern of context.titlePatterns) {
            try {
              const locator = page.getByTitle(new RegExp(pattern, 'i'));
              if (await this.isValidLocator(locator)) return locator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 8: Alt text (for images)
      {
        name: 'alt-text',
        priority: 8,
        apply: async (page, context) => {
          if (!context.altPatterns?.length) return null;
          
          for (const pattern of context.altPatterns) {
            try {
              const locator = page.getByAltText(new RegExp(pattern, 'i'));
              if (await this.isValidLocator(locator)) return locator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 9: Attribute-based CSS selectors
      {
        name: 'attribute',
        priority: 9,
        apply: async (page, context) => {
          if (!context.attributePatterns) return null;
          
          for (const [attr, value] of Object.entries(context.attributePatterns)) {
            try {
              // Build CSS selector for attribute
              const selector = `[${attr}="${value}"]`;
              const locator = page.locator(selector);
              if (await this.isValidLocator(locator)) return locator;
              
              // Try contains for partial match
              const containsSelector = `[${attr}*="${value}"]`;
              const containsLocator = page.locator(containsSelector);
              if (await this.isValidLocator(containsLocator)) return containsLocator;
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 10: Class patterns with element type
      {
        name: 'class-pattern',
        priority: 10,
        apply: async (page, context) => {
          if (!context.classPatterns?.length) return null;
          
          const tagMap: Record<string, string> = {
            'button': 'button',
            'input': 'input',
            'link': 'a',
            'heading': 'h1, h2, h3, h4, h5, h6',
            'text': 'p, span, div',
            'dropdown': 'select',
            'checkbox': 'input[type="checkbox"]',
            'radio': 'input[type="radio"]',
            'image': 'img',
            'custom': '*',
          };
          
          const tag = tagMap[context.elementType] || '*';
          
          for (const pattern of context.classPatterns) {
            try {
              // Try class contains
              const selector = `${tag}[class*="${pattern}"]`;
              const locator = page.locator(selector);
              if (await this.isValidLocator(locator)) return locator.first();
            } catch { /* continue */ }
          }
          return null;
        }
      },

      // Strategy 11: Pure role-based (without text, as last resort for typed elements)
      {
        name: 'pure-role',
        priority: 11,
        apply: async (page, context) => {
          if (!context.ariaRole) return null;
          
          try {
            // Get all elements of this role and try to find the right one
            const locator = page.getByRole(context.ariaRole as any);
            const count = await locator.count();
            
            // If only one, return it
            if (count === 1 && await this.isValidLocator(locator)) {
              return locator;
            }
            
            // If multiple, try to narrow down using text content from purpose
            if (count > 1 && count < 10) {
              for (let i = 0; i < count; i++) {
                const element = locator.nth(i);
                const text = await element.textContent();
                
                // Check if any text pattern matches
                if (context.textPatterns?.some(p => 
                  text?.toLowerCase().includes(p.toLowerCase())
                )) {
                  if (await this.isValidLocator(element)) return element;
                }
              }
            }
          } catch { /* continue */ }
          
          return null;
        }
      },

      // Strategy 12: XPath with text content (fallback)
      {
        name: 'xpath-text',
        priority: 12,
        apply: async (page, context) => {
          if (!context.textPatterns?.length) return null;
          
          const tagMap: Record<string, string> = {
            'button': 'button',
            'input': 'input',
            'link': 'a',
            'heading': '*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]',
            'text': '*',
            'dropdown': 'select',
            'checkbox': 'input[@type="checkbox"]',
            'radio': 'input[@type="radio"]',
            'image': 'img',
            'custom': '*',
          };
          
          const xpathTag = tagMap[context.elementType] || '*';
          
          for (const pattern of context.textPatterns) {
            try {
              // XPath contains text (case-insensitive using translate)
              const xpath = `//${xpathTag}[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${pattern.toLowerCase()}')]`;
              const locator = page.locator(xpath);
              if (await this.isValidLocator(locator)) return locator.first();
            } catch { /* continue */ }
          }
          return null;
        }
      },
    ];
  }

  /**
   * Check if a locator is valid (points to a visible element)
   */
  private async isValidLocator(locator: Locator): Promise<boolean> {
    try {
      const count = await locator.count();
      if (count === 0) return false;
      
      return await locator.first().isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Attempt to heal the locator using all available strategies
   */
  async heal(): Promise<HealingResult> {
    const strategiesTried: string[] = [];
    
    // Sort strategies by priority
    const sortedStrategies = [...this.strategies].sort((a, b) => a.priority - b.priority);
    
    for (const strategy of sortedStrategies) {
      strategiesTried.push(strategy.name);
      
      try {
        const locator = await strategy.apply(this.page, this.context);
        
        if (locator) {
          return {
            success: true,
            locator,
            strategy: strategy.name,
            locatorDescription: await this.getLocatorDescription(locator),
            strategiesTried,
          };
        }
      } catch (error) {
        // Log error but continue to next strategy
        console.debug(`Healing strategy "${strategy.name}" failed for "${this.context.purpose}":`, error);
      }
    }
    
    // All strategies failed
    return {
      success: false,
      strategiesTried,
      error: `All ${strategiesTried.length} healing strategies failed for "${this.context.purpose}"`,
    };
  }

  /**
   * Get a human-readable description of the locator
   */
  private async getLocatorDescription(locator: Locator): Promise<string> {
    try {
      const element = await locator.elementHandle();
      if (!element) return locator.toString();
      
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const id = await element.evaluate(el => el.id);
      const className = await element.evaluate(el => el.className);
      const text = (await locator.textContent())?.slice(0, 30);
      
      let description = tagName;
      if (id) description += `#${id}`;
      if (className && typeof className === 'string') {
        description += `.${className.split(' ').slice(0, 2).join('.')}`;
      }
      if (text) description += ` "${text}${text.length > 30 ? '...' : ''}"`;
      
      return description;
    } catch {
      return locator.toString();
    }
  }
}
