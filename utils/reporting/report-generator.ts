import * as fs from 'fs';
import * as path from 'path';

const fsp = fs.promises;
import { FullConfig, FullResult, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { performanceMonitor } from './performance-monitor';

interface TestSummary {
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
  screenshots: string[];
  video?: string;
  suite: string;
  retry: number;
}

interface SuiteSummary {
  title: string;
  tests: TestSummary[];
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

interface ReportData {
  title: string;
  timestamp: string;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  suites: SuiteSummary[];
  environment: {
    browser: string;
    os: string;
    nodeVersion: string;
  };
}

export class ClientReportGenerator {
  private outputDir: string;
  private screenshotsDir: string;
  private reportData: ReportData;
  private testResults: Map<string, TestSummary[]> = new Map();

  constructor(options?: { outputFolder?: string } | string) {
    // Handle both object options (from Playwright config) and string (direct instantiation)
    if (typeof options === 'object' && options !== null && 'outputFolder' in options) {
      this.outputDir = options.outputFolder || 'client-reports';
    } else if (typeof options === 'string') {
      this.outputDir = options;
    } else {
      this.outputDir = 'client-reports';
    }
    this.screenshotsDir = path.join(this.outputDir, 'screenshots');

    this.reportData = {
      title: 'Test Execution Report',
      timestamp: new Date().toISOString(),
      duration: 0,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      suites: [],
      environment: {
        browser: 'Chromium',
        os: process.platform,
        nodeVersion: process.version
      }
    };
  }

  private async ensureDirectories(): Promise<void> {
    await fsp.mkdir(this.outputDir, { recursive: true });
    await fsp.mkdir(this.screenshotsDir, { recursive: true });
  }

  async onBegin(config: FullConfig, suite: Suite): Promise<void> {
    await this.ensureDirectories();
    this.reportData.title = `Test Execution Report - ${new Date().toLocaleDateString()}`;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const suiteTitle = this.getSuiteTitle(test);
    if (!this.testResults.has(suiteTitle)) {
      this.testResults.set(suiteTitle, []);
    }

    const screenshots = result.attachments
      .filter(att => att.name === 'screenshot' || att.path?.endsWith('.png'))
      .map(att => att.path || '')
      .filter(Boolean);

    const video = result.attachments
      .find(att => att.name === 'video' || att.path?.endsWith('.webm'))
      ?.path;

    const testSummary: TestSummary = {
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
      screenshots: screenshots,
      video: video,
      suite: suiteTitle,
      retry: result.retry
    };

    this.testResults.get(suiteTitle)!.push(testSummary);

    performanceMonitor.recordTest(test, result);

    // Update counters
    this.reportData.totalTests++;
    if (result.status === 'passed') this.reportData.passed++;
    else if (result.status === 'failed' || result.status === 'timedOut') this.reportData.failed++;
    else if (result.status === 'skipped') this.reportData.skipped++;
  }

  async onEnd(result: FullResult): Promise<void> {
    this.reportData.duration = result.duration;
    this.processSuites();
    await this.generateHTMLReport();
    await this.copyScreenshots();
    await performanceMonitor.saveReport();
  }

  private getSuiteTitle(test: TestCase): string {
    const titles: string[] = [];
    let parent: Suite | undefined = test.parent;
    while (parent) {
      if (parent.title) {
        titles.unshift(parent.title);
      }
      parent = parent.parent;
    }
    return titles.join(' > ') || 'Root Suite';
  }

  private processSuites(): void {
    for (const [suiteTitle, tests] of this.testResults.entries()) {
      const suiteSummary: SuiteSummary = {
        title: suiteTitle,
        tests: tests,
        passed: tests.filter(t => t.status === 'passed').length,
        failed: tests.filter(t => t.status === 'failed' || t.status === 'timedOut').length,
        skipped: tests.filter(t => t.status === 'skipped').length,
        duration: tests.reduce((sum, t) => sum + t.duration, 0)
      };
      this.reportData.suites.push(suiteSummary);
    }
  }

  private async copyScreenshots(): Promise<void> {
    const failedStatuses = ['failed' as const, 'timedOut' as const];
    const testResultsDir = path.join(process.cwd(), 'test-results');

    for (const [, tests] of this.testResults) {
      for (const test of tests) {
        if (!failedStatuses.includes(test.status)) continue;

        const allPaths: Array<{ path: string; update: (dest: string) => void }> = [];
        test.screenshots.forEach((p, idx) =>
          allPaths.push({ path: p, update: (dest) => { test.screenshots[idx] = dest; } })
        );
        if (test.video) {
          allPaths.push({ path: test.video, update: (dest) => { test.video = dest; } });
        }

        for (const { path: srcPath, update } of allPaths) {
          try {
            const resolvedSrc = path.isAbsolute(srcPath) ? srcPath : path.join(process.cwd(), srcPath);
            await fsp.access(resolvedSrc);
            const relativePath = path.relative(testResultsDir, resolvedSrc);
            const destPath = path.join(this.screenshotsDir, relativePath);
            await fsp.mkdir(path.dirname(destPath), { recursive: true });
            await fsp.copyFile(resolvedSrc, destPath);
            update(destPath);
          } catch {
            // File not found or copy failed, skip
          }
        }
      }
    }
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fsp.mkdir(dest, { recursive: true });
    const entries = await fsp.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else if (entry.name.endsWith('.png') || entry.name.endsWith('.webm')) {
        await fsp.copyFile(srcPath, destPath);
      }
    }
  }

  private async generateHTMLReport(): Promise<void> {
    const html = this.generateHTML();
    const reportPath = path.join(this.outputDir, `test-report-${Date.now()}.html`);
    await fsp.writeFile(reportPath, html);
    const latestPath = path.join(this.outputDir, 'latest-report.html');
    await fsp.writeFile(latestPath, html);
    console.log(`\n📊 Client report generated: ${reportPath}`);
    console.log(`📊 Latest report: ${latestPath}`);
  }

  private generateHTML(): string {
    const passRate = this.reportData.totalTests > 0 
      ? ((this.reportData.passed / this.reportData.totalTests) * 100).toFixed(1)
      : '0';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.reportData.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-card.passed {
            border-left: 5px solid #10b981;
        }
        
        .stat-card.failed {
            border-left: 5px solid #ef4444;
        }
        
        .stat-card.skipped {
            border-left: 5px solid #f59e0b;
        }
        
        .stat-card.total {
            border-left: 5px solid #6366f1;
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card.passed .stat-value {
            color: #10b981;
        }
        
        .stat-card.failed .stat-value {
            color: #ef4444;
        }
        
        .stat-card.skipped .stat-value {
            color: #f59e0b;
        }
        
        .stat-card.total .stat-value {
            color: #6366f1;
        }
        
        .pass-rate {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            font-size: 1.5em;
            font-weight: 600;
        }
        
        .content {
            padding: 30px;
        }
        
        .suite {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }
        
        .suite-header {
            background: #f9fafb;
            padding: 20px;
            border-bottom: 2px solid #e5e7eb;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
        }
        
        .suite-header:hover {
            background: #f3f4f6;
        }
        
        .suite-header h2 {
            font-size: 1.3em;
            color: #1f2937;
        }
        
        .suite-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
        }
        
        .suite-stats span {
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: 600;
        }
        
        .suite-stats .passed {
            background: #d1fae5;
            color: #065f46;
        }
        
        .suite-stats .failed {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .suite-stats .skipped {
            background: #fef3c7;
            color: #92400e;
        }
        
        .suite-content {
            display: none;
            padding: 20px;
        }
        
        .suite-content.expanded {
            display: block;
        }
        
        .test-item {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid;
            background: #f9fafb;
        }
        
        .test-item.passed {
            border-left-color: #10b981;
        }
        
        .test-item.failed {
            border-left-color: #ef4444;
            background: #fef2f2;
        }
        
        .test-item.skipped {
            border-left-color: #f59e0b;
        }
        
        .test-item.timedOut {
            border-left-color: #ef4444;
            background: #fef2f2;
        }
        
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .test-title {
            font-weight: 600;
            color: #1f2937;
        }
        
        .test-duration {
            color: #6b7280;
            font-size: 0.9em;
        }
        
        .test-error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 12px;
            margin-top: 10px;
            color: #991b1b;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
        }
        
        .screenshots {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            flex-wrap: wrap;
        }
        
        .screenshot {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            max-width: 300px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .screenshot:hover {
            transform: scale(1.05);
            border-color: #667eea;
        }
        
        .screenshot img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .screenshot-label {
            padding: 5px;
            background: #f3f4f6;
            text-align: center;
            font-size: 0.8em;
            color: #6b7280;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            justify-content: center;
            align-items: center;
        }
        
        .modal.active {
            display: flex;
        }
        
        .modal-content {
            max-width: 90%;
            max-height: 90%;
        }
        
        .modal-content img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
        }
        
        .close-modal {
            position: absolute;
            top: 20px;
            right: 30px;
            color: white;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .footer {
            padding: 20px;
            text-align: center;
            background: #f9fafb;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        
        .environment-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 10px;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .header h1 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Execution Report</h1>
            <div class="subtitle">${new Date(this.reportData.timestamp).toLocaleString()}</div>
        </div>
        
        <div class="stats">
            <div class="stat-card total">
                <div class="stat-value">${this.reportData.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-value">${this.reportData.passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-value">${this.reportData.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card skipped">
                <div class="stat-value">${this.reportData.skipped}</div>
                <div class="stat-label">Skipped</div>
            </div>
        </div>
        
        <div class="pass-rate">
            Pass Rate: ${passRate}%
        </div>
        
        <div class="content">
            ${this.generateSuitesHTML()}
        </div>
        
        <div class="footer">
            <div>Total Duration: ${(this.reportData.duration / 1000).toFixed(2)}s</div>
            <div class="environment-info">
                <span>Browser: ${this.reportData.environment.browser}</span>
                <span>OS: ${this.reportData.environment.os}</span>
                <span>Node: ${this.reportData.environment.nodeVersion}</span>
            </div>
        </div>
    </div>
    
    <div class="modal" id="imageModal">
        <span class="close-modal" onclick="closeModal()">&times;</span>
        <div class="modal-content">
            <img id="modalImage" src="" alt="Screenshot">
        </div>
    </div>
    
    <script>
        // Suite expand/collapse
        document.querySelectorAll('.suite-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                content.classList.toggle('expanded');
            });
        });
        
        // Expand all suites by default
        document.querySelectorAll('.suite-content').forEach(content => {
            content.classList.add('expanded');
        });
        
        // Image modal
        function openModal(imgSrc) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.classList.add('active');
            modalImg.src = imgSrc;
        }
        
        function closeModal() {
            document.getElementById('imageModal').classList.remove('active');
        }
        
        // Close modal on outside click
        document.getElementById('imageModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close modal on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    </script>
</body>
</html>`;
  }

  private generateSuitesHTML(): string {
    return this.reportData.suites.map(suite => {
      const testsHTML = suite.tests.map(test => {
        const screenshotsHTML = test.screenshots.map((screenshot, idx) => {
          const relativePath = path.relative(this.outputDir, screenshot).replace(/\\/g, '/');
          return `
            <div class="screenshot" onclick="openModal('${relativePath}')">
              <img src="${relativePath}" alt="Screenshot ${idx + 1}" loading="lazy">
              <div class="screenshot-label">Screenshot ${idx + 1}</div>
            </div>`;
        }).join('');

        const errorHTML = test.error ? `
          <div class="test-error">${this.escapeHtml(test.error)}</div>
        ` : '';

        return `
          <div class="test-item ${test.status}">
            <div class="test-header">
              <div class="test-title">${this.escapeHtml(test.title)}</div>
              <div class="test-duration">${(test.duration / 1000).toFixed(2)}s</div>
            </div>
            ${errorHTML}
            ${test.screenshots.length > 0 ? `<div class="screenshots">${screenshotsHTML}</div>` : ''}
          </div>`;
      }).join('');

      return `
        <div class="suite">
          <div class="suite-header">
            <h2>${this.escapeHtml(suite.title)}</h2>
            <div class="suite-stats">
              <span class="passed">✓ ${suite.passed}</span>
              <span class="failed">✗ ${suite.failed}</span>
              <span class="skipped">⊘ ${suite.skipped}</span>
            </div>
          </div>
          <div class="suite-content">
            ${testsHTML}
          </div>
        </div>`;
    }).join('');
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Export as default for Playwright reporter
export default ClientReportGenerator;






