/**
 * Test Data Tracker
 * Tracks all records created during test execution for cleanup purposes
 */

export interface TrackedResource {
  type: 'jobPosting' | 'applicant' | 'interview';
  identifier: string; // ID if available, otherwise title/name/email
  metadata?: {
    title?: string;
    name?: string;
    email?: string;
  };
}

const MAX_TEST_IDS = 500;
const MAX_RESOURCES_PER_TEST = 50;

/**
 * Tracks resources created during test execution
 * Used to clean up test data after tests complete.
 * Memory is bounded: oldest test IDs are evicted when limits are exceeded.
 */
export class TestDataTracker {
  private static resources: Map<string, TrackedResource[]> = new Map();
  private static insertionOrder: string[] = [];

  /**
   * Evict oldest test IDs until under limit.
   */
  private static evictIfNeeded(): void {
    while (this.insertionOrder.length > MAX_TEST_IDS) {
      const oldest = this.insertionOrder.shift();
      if (oldest) this.resources.delete(oldest);
    }
  }

  /**
   * Track a resource created during test execution
   * @param testId - Unique test identifier (from test.info().testId)
   * @param resource - Resource information to track
   */
  static track(testId: string, resource: TrackedResource): void {
    if (!this.resources.has(testId)) {
      this.resources.set(testId, []);
      this.insertionOrder.push(testId);
      this.evictIfNeeded();
    }
    const list = this.resources.get(testId)!;
    if (list.length >= MAX_RESOURCES_PER_TEST) return;
    list.push(resource);
  }
  
  /**
   * Get all tracked resources for a test
   * @param testId - Unique test identifier
   * @returns Array of tracked resources
   */
  static getTrackedResources(testId: string): TrackedResource[] {
    return this.resources.get(testId) || [];
  }
  
  /**
   * Clear tracked resources for a test
   * @param testId - Unique test identifier
   */
  static clear(testId: string): void {
    this.resources.delete(testId);
  }
  
  /**
   * Clear all tracked resources (useful for global cleanup)
   */
  static clearAll(): void {
    this.resources.clear();
    this.insertionOrder = [];
  }
}
