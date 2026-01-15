import { Locator, Page } from '@playwright/test';

/**
 * Selector Cache Utility
 * Caches frequently used locators to improve performance
 */
export class SelectorCache {
  private static cache = new Map<string, { locator: Locator; timestamp: number }>();
  private static readonly CACHE_TTL = 30000; // 30 seconds
  private static readonly MAX_CACHE_SIZE = 100;

  /**
   * Get or create a cached locator
   * @param page Playwright page object
   * @param selector CSS selector, XPath, or locator string
   * @param cacheKey Optional custom cache key (defaults to selector)
   * @returns Cached or new locator
   */
  static getLocator(page: Page, selector: string, cacheKey?: string): Locator {
    const key = cacheKey || selector;
    
    // Check cache
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      // Verify the locator is still valid by checking if page is the same
      // Note: Locators are tied to pages, so we need to recreate if page changed
      return page.locator(selector);
    }
    
    // Create new locator
    const locator = page.locator(selector);
    
    // Add to cache (with size limit)
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      locator,
      timestamp: Date.now()
    });
    
    return locator;
  }

  /**
   * Clear the selector cache
   * Useful after navigation or page state changes
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries from cache
   */
  static clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL
    };
  }
}






