import { TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestPerformance {
  title: string;
  duration: number;
  status: string;
  suite: string;
  timestamp: number;
}

interface PerformanceReport {
  timestamp: string;
  totalTests: number;
  averageDuration: number;
  slowTests: TestPerformance[];
  fastTests: TestPerformance[];
  bySuite: Record<string, { count: number; totalDuration: number; averageDuration: number }>;
}

/**
 * Performance Monitor Utility
 * Tracks test execution times and identifies bottlenecks
 */
export class PerformanceMonitor {
  private testResults: TestPerformance[] = [];
  private readonly SLOW_TEST_THRESHOLD = 30000; // 30 seconds
  private readonly outputDir = path.join(process.cwd(), 'performance-reports');

  constructor() {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Record test execution
   */
  recordTest(test: TestCase, result: TestResult): void {
    const testPerf: TestPerformance = {
      title: test.title,
      duration: result.duration,
      status: result.status,
      suite: test.parent?.title || 'Unknown',
      timestamp: Date.now()
    };
    
    this.testResults.push(testPerf);
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const totalTests = this.testResults.length;
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    // Identify slow tests (above threshold)
    const slowTests = this.testResults
      .filter(t => t.duration > this.SLOW_TEST_THRESHOLD)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10); // Top 10 slowest

    // Identify fast tests (below 5 seconds)
    const fastTests = this.testResults
      .filter(t => t.duration < 5000)
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 10); // Top 10 fastest

    // Group by suite
    const bySuite: Record<string, { count: number; totalDuration: number; averageDuration: number }> = {};
    this.testResults.forEach(test => {
      if (!bySuite[test.suite]) {
        bySuite[test.suite] = { count: 0, totalDuration: 0, averageDuration: 0 };
      }
      bySuite[test.suite].count++;
      bySuite[test.suite].totalDuration += test.duration;
    });

    // Calculate averages
    Object.keys(bySuite).forEach(suite => {
      bySuite[suite].averageDuration = bySuite[suite].totalDuration / bySuite[suite].count;
    });

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      averageDuration,
      slowTests,
      fastTests,
      bySuite
    };
  }

  /**
   * Save performance report to file
   */
  saveReport(): void {
    const report = this.generateReport();
    const filename = `performance-${Date.now()}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // Also save latest report
    const latestPath = path.join(this.outputDir, 'latest-performance.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Performance report saved to: ${filepath}`);
    console.log(`   Total tests: ${report.totalTests}`);
    console.log(`   Average duration: ${(report.averageDuration / 1000).toFixed(2)}s`);
    console.log(`   Slow tests (>${this.SLOW_TEST_THRESHOLD / 1000}s): ${report.slowTests.length}`);
    
    if (report.slowTests.length > 0) {
      console.log(`\n   Top slow tests:`);
      report.slowTests.slice(0, 5).forEach((test, i) => {
        console.log(`   ${i + 1}. ${test.title} (${(test.duration / 1000).toFixed(2)}s)`);
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalTests: number;
    averageDuration: number;
    slowTestCount: number;
    fastestTest: TestPerformance | null;
    slowestTest: TestPerformance | null;
  } {
    if (this.testResults.length === 0) {
      return {
        totalTests: 0,
        averageDuration: 0,
        slowTestCount: 0,
        fastestTest: null,
        slowestTest: null
      };
    }

    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0);
    const averageDuration = totalDuration / this.testResults.length;
    const slowTestCount = this.testResults.filter(t => t.duration > this.SLOW_TEST_THRESHOLD).length;
    
    const sorted = [...this.testResults].sort((a, b) => a.duration - b.duration);
    const fastestTest = sorted[0];
    const slowestTest = sorted[sorted.length - 1];

    return {
      totalTests: this.testResults.length,
      averageDuration,
      slowTestCount,
      fastestTest,
      slowestTest
    };
  }

  /**
   * Clear all recorded results
   */
  clear(): void {
    this.testResults = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();






