/**
 * Healing Event - Records a single locator healing occurrence
 */
export interface HealingEvent {
  /** Element purpose (from semantic context) */
  purpose: string;

  /** Element type */
  elementType: string;

  /** Whether primary locator failed */
  primaryLocatorFailed: boolean;

  /** Strategy that successfully healed the locator */
  healedStrategy: string;

  /** Description of the healed locator */
  healedLocator: string;

  /** Timestamp of the healing event */
  timestamp: Date;

  /** Optional: Page URL where healing occurred */
  pageUrl?: string;

  /** Optional: Test name where healing occurred */
  testName?: string;
}

/**
 * Healing Report Summary
 */
export interface HealingReportSummary {
  totalHealed: number;
  failuresPrevented: number;
  strategiesUsed: Map<string, number>;
  elementsHealed: Map<string, HealingEvent[]>;
  recommendations: string[];
}

/**
 * Healing Reporter
 * Collects and reports locator healing events for visibility and maintenance
 */
export class HealingReporter {
  private static events: HealingEvent[] = [];
  private static isEnabled: boolean = true;

  /**
   * Enable or disable healing reporting
   */
  static setEnabled(enabled: boolean): void {
    HealingReporter.isEnabled = enabled;
  }

  /**
   * Add a healing event
   */
  static addHealingEvent(event: HealingEvent): void {
    if (!HealingReporter.isEnabled) return;
    
    HealingReporter.events.push(event);
    
    // Log immediately for visibility
    console.log(
      `🔧 HEALED: "${event.purpose}" using ${event.healedStrategy} → ${event.healedLocator}`
    );
  }

  /**
   * Get all healing events
   */
  static getEvents(): HealingEvent[] {
    return [...HealingReporter.events];
  }

  /**
   * Clear all events
   */
  static clearEvents(): void {
    HealingReporter.events = [];
  }

  /**
   * Generate healing report summary
   */
  static generateSummary(): HealingReportSummary {
    const events = HealingReporter.events;
    const strategiesUsed = new Map<string, number>();
    const elementsHealed = new Map<string, HealingEvent[]>();
    
    for (const event of events) {
      // Count strategy usage
      const count = strategiesUsed.get(event.healedStrategy) || 0;
      strategiesUsed.set(event.healedStrategy, count + 1);
      
      // Group by element
      const elementEvents = elementsHealed.get(event.purpose) || [];
      elementEvents.push(event);
      elementsHealed.set(event.purpose, elementEvents);
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    for (const [purpose, healEvents] of elementsHealed) {
      if (healEvents.length >= 2) {
        const mostUsedStrategy = healEvents
          .map(e => e.healedStrategy)
          .reduce((a, b, _, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
          );
        
        recommendations.push(
          `"${purpose}" was healed ${healEvents.length} times. ` +
          `Consider updating the primary locator to use "${mostUsedStrategy}" strategy.`
        );
      }
    }
    
    return {
      totalHealed: events.length,
      failuresPrevented: events.length,
      strategiesUsed,
      elementsHealed,
      recommendations,
    };
  }

  /**
   * Print formatted healing report to console
   */
  static printReport(): void {
    const summary = HealingReporter.generateSummary();
    
    console.log('\n');
    console.log('🔧 LOCATOR HEALING REPORT');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (summary.totalHealed === 0) {
      console.log('✅ No locators needed healing - all primary locators worked!');
      console.log('═══════════════════════════════════════════════════════════════\n');
      return;
    }
    
    // Print each healed element
    for (const [purpose, events] of summary.elementsHealed) {
      for (const event of events) {
        console.log(`✅ Healed: "${event.purpose}"`);
        console.log(`   Strategy: ${event.healedStrategy}`);
        console.log(`   Healed locator: ${event.healedLocator}`);
        console.log('');
      }
    }
    
    console.log('───────────────────────────────────────────────────────────────');
    
    // Print strategy usage
    console.log('Strategy Usage:');
    for (const [strategy, count] of summary.strategiesUsed) {
      console.log(`  • ${strategy}: ${count} time(s)`);
    }
    
    console.log('');
    
    // Print recommendations
    if (summary.recommendations.length > 0) {
      console.log('📋 Recommendations:');
      for (const rec of summary.recommendations) {
        console.log(`  ⚠️  ${rec}`);
      }
      console.log('');
    }
    
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`Total healed: ${summary.totalHealed} | Failures prevented: ${summary.failuresPrevented}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  }

  /**
   * Get report as JSON for external reporting
   */
  static getReportAsJSON(): string {
    const summary = HealingReporter.generateSummary();
    
    return JSON.stringify({
      totalHealed: summary.totalHealed,
      failuresPrevented: summary.failuresPrevented,
      strategiesUsed: Object.fromEntries(summary.strategiesUsed),
      elementsHealed: Object.fromEntries(
        Array.from(summary.elementsHealed.entries()).map(([k, v]) => [
          k,
          v.map(e => ({
            strategy: e.healedStrategy,
            locator: e.healedLocator,
            timestamp: e.timestamp.toISOString(),
          })),
        ])
      ),
      recommendations: summary.recommendations,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Save report to file
   */
  static async saveReportToFile(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const report = HealingReporter.getReportAsJSON();
    await fs.writeFile(filePath, report, 'utf-8');
    console.log(`📄 Healing report saved to: ${filePath}`);
  }
}
