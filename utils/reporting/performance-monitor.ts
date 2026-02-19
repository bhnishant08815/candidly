import { TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

const fsp = fs.promises;

interface TestPerformance {
  title: string;
  duration: number;
  status: string;
  suite: string;
  timestamp: number;
  retry?: number;
}

interface FlakyTest {
  title: string;
  suite: string;
  failureRate: number;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  recentFailures: number;
  averageDuration: number;
}

interface PerformanceReport {
  timestamp: string;
  totalTests: number;
  averageDuration: number;
  slowTests: TestPerformance[];
  fastTests: TestPerformance[];
  bySuite: Record<string, { count: number; totalDuration: number; averageDuration: number }>;
  flakyTests: FlakyTest[];
}

/**
 * Performance Monitor Utility
 * Tracks test execution times and identifies bottlenecks
 */
const MAX_STORED_TESTS = 1000;

export class PerformanceMonitor {
  private testResults: TestPerformance[] = [];
  private readonly SLOW_TEST_THRESHOLD = 30000; // 30 seconds
  private readonly outputDir = path.join(process.cwd(), 'performance-reports');

  constructor() {
    // Directory is created on first saveReport()
  }

  /**
   * Record test execution. Keeps only the last MAX_STORED_TESTS to bound memory.
   */
  recordTest(test: TestCase, result: TestResult): void {
    const testPerf: TestPerformance = {
      title: test.title,
      duration: result.duration,
      status: result.status,
      suite: test.parent?.title || 'Unknown',
      timestamp: Date.now(),
      retry: result.retry
    };
    this.testResults.push(testPerf);
    if (this.testResults.length > MAX_STORED_TESTS) {
      this.testResults = this.testResults.slice(-MAX_STORED_TESTS);
    }
  }

  /**
   * Detect flaky tests based on failure patterns
   * A test is considered flaky if it has both passed and failed runs
   */
  detectFlakyTests(minRuns: number = 3, failureRateThreshold: number = 0.2): FlakyTest[] {
    // Group tests by title and suite
    const testGroups = new Map<string, TestPerformance[]>();
    
    this.testResults.forEach(test => {
      const key = `${test.suite}::${test.title}`;
      if (!testGroups.has(key)) {
        testGroups.set(key, []);
      }
      testGroups.get(key)!.push(test);
    });

    const flakyTests: FlakyTest[] = [];

    testGroups.forEach((runs, key) => {
      if (runs.length < minRuns) return;

      const [suite, title] = key.split('::');
      const passedRuns = runs.filter(r => r.status === 'passed').length;
      const failedRuns = runs.filter(r => r.status === 'failed' || r.status === 'timedOut').length;
      const totalRuns = runs.length;
      const failureRate = failedRuns / totalRuns;

      // Consider flaky if it has both passes and failures, and failure rate is above threshold
      if (passedRuns > 0 && failedRuns > 0 && failureRate >= failureRateThreshold) {
        const recentRuns = runs.slice(-10); // Last 10 runs
        const recentFailures = recentRuns.filter(r => r.status === 'failed' || r.status === 'timedOut').length;
        const averageDuration = runs.reduce((sum, r) => sum + r.duration, 0) / runs.length;

        flakyTests.push({
          title,
          suite,
          failureRate,
          totalRuns,
          passedRuns,
          failedRuns,
          recentFailures,
          averageDuration,
        });
      }
    });

    // Sort by failure rate (highest first)
    return flakyTests.sort((a, b) => b.failureRate - a.failureRate);
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

    // Detect flaky tests
    const flakyTests = this.detectFlakyTests(3, 0.2);

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      averageDuration,
      slowTests,
      fastTests,
      bySuite,
      flakyTests
    };
  }

  /**
   * Save performance report to file (async)
   */
  async saveReport(): Promise<void> {
    await fsp.mkdir(this.outputDir, { recursive: true });
    const report = this.generateReport();
    const filename = `performance-${Date.now()}.json`;
    const filepath = path.join(this.outputDir, filename);
    const json = JSON.stringify(report, null, 2);
    await fsp.writeFile(filepath, json);
    const latestPath = path.join(this.outputDir, 'latest-performance.json');
    await fsp.writeFile(latestPath, json);
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
    if (report.flakyTests.length > 0) {
      console.log(`\n   ⚠️  Flaky tests detected: ${report.flakyTests.length}`);
      report.flakyTests.slice(0, 5).forEach((test, i) => {
        const failurePercent = (test.failureRate * 100).toFixed(1);
        console.log(`   ${i + 1}. ${test.title} (${failurePercent}% failure rate, ${test.failedRuns}/${test.totalRuns} failed)`);
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
   * Get trend analysis for a specific test
   */
  getTestTrend(testTitle: string, suite?: string): {
    runs: TestPerformance[];
    passRate: number;
    averageDuration: number;
    durationTrend: 'increasing' | 'decreasing' | 'stable';
    statusTrend: 'improving' | 'degrading' | 'stable';
  } {
    const relevantTests = this.testResults.filter(t => {
      const titleMatch = t.title === testTitle;
      const suiteMatch = suite ? t.suite === suite : true;
      return titleMatch && suiteMatch;
    });

    if (relevantTests.length === 0) {
      return {
        runs: [],
        passRate: 0,
        averageDuration: 0,
        durationTrend: 'stable',
        statusTrend: 'stable',
      };
    }

    const passed = relevantTests.filter(t => t.status === 'passed').length;
    const passRate = passed / relevantTests.length;
    const averageDuration = relevantTests.reduce((sum, t) => sum + t.duration, 0) / relevantTests.length;

    // Analyze duration trend (compare first half vs second half)
    const midPoint = Math.floor(relevantTests.length / 2);
    const firstHalf = relevantTests.slice(0, midPoint);
    const secondHalf = relevantTests.slice(midPoint);
    const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.duration, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.duration, 0) / secondHalf.length;
    const durationDiff = secondHalfAvg - firstHalfAvg;
    const durationTrend: 'increasing' | 'decreasing' | 'stable' = 
      durationDiff > 2000 ? 'increasing' : durationDiff < -2000 ? 'decreasing' : 'stable';

    // Analyze status trend (compare first half vs second half)
    const firstHalfPassRate = firstHalf.filter(t => t.status === 'passed').length / firstHalf.length;
    const secondHalfPassRate = secondHalf.filter(t => t.status === 'passed').length / secondHalf.length;
    const statusDiff = secondHalfPassRate - firstHalfPassRate;
    const statusTrend: 'improving' | 'degrading' | 'stable' = 
      statusDiff > 0.1 ? 'improving' : statusDiff < -0.1 ? 'degrading' : 'stable';

    return {
      runs: relevantTests,
      passRate,
      averageDuration,
      durationTrend,
      statusTrend,
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






