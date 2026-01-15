import * as fs from 'fs';
import * as path from 'path';

// Try to import archiver, but handle if not installed
let archiver: any;
try {
  archiver = require('archiver');
} catch (e) {
  console.warn('⚠️  archiver not installed. Install with: npm install --save-dev archiver');
}

/**
 * Report Packager Utility
 * Packages test reports and screenshots into a zip file for client delivery
 */
export class ReportPackager {
  private reportDir: string;
  private outputDir: string;

  constructor(reportDir: string = 'client-reports', outputDir: string = 'client-reports') {
    this.reportDir = reportDir;
    this.outputDir = outputDir;
  }

  /**
   * Package the latest report into a zip file
   * @param includeScreenshots Whether to include screenshots (default: true)
   * @returns Path to the created zip file
   */
  async packageReport(includeScreenshots: boolean = true): Promise<string> {
    if (!archiver) {
      throw new Error('archiver package is required. Install with: npm install --save-dev archiver');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const zipFileName = `test-report-${timestamp}.zip`;
    const zipPath = path.join(this.outputDir, zipFileName);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      output.on('close', () => {
        console.log(`\n📦 Report packaged: ${zipPath}`);
        console.log(`   Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Add HTML report
      const latestReport = path.join(this.reportDir, 'latest-report.html');
      if (fs.existsSync(latestReport)) {
        archive.file(latestReport, { name: 'test-report.html' });
      }

      // Add all HTML reports
      const htmlReports = fs.readdirSync(this.reportDir)
        .filter(file => file.endsWith('.html'))
        .map(file => path.join(this.reportDir, file));
      
      htmlReports.forEach(report => {
        archive.file(report, { name: path.basename(report) });
      });

      // Add screenshots if requested
      if (includeScreenshots) {
        const screenshotsDir = path.join(this.reportDir, 'screenshots');
        if (fs.existsSync(screenshotsDir)) {
          archive.directory(screenshotsDir, 'screenshots');
        }
      }

      // Add README with instructions
      const readmeContent = this.generateReadme();
      archive.append(readmeContent, { name: 'README.txt' });

      archive.finalize();
    });
  }

  private generateReadme(): string {
    return `
TEST REPORT PACKAGE
===================

This package contains the test execution report and associated screenshots.

CONTENTS:
---------
- test-report.html: Main HTML report (open in any web browser)
- screenshots/: Folder containing all test screenshots
- README.txt: This file

HOW TO VIEW:
------------
1. Extract this zip file to a folder
2. Open 'test-report.html' in any modern web browser (Chrome, Firefox, Edge, Safari)
3. The report is interactive - click on suite headers to expand/collapse
4. Click on screenshots to view them in full size

REPORT FEATURES:
----------------
- Visual test results with pass/fail indicators
- Screenshots for failed tests and key steps
- Test execution statistics
- Environment information
- Detailed error messages for failed tests

For questions or issues, please contact the QA team.

Generated: ${new Date().toLocaleString()}
`;
  }

  /**
   * Clean up old reports (keep only the last N reports)
   * @param keepCount Number of recent reports to keep
   */
  cleanupOldReports(keepCount: number = 5): void {
    const files = fs.readdirSync(this.reportDir)
      .filter(file => file.endsWith('.html') && file !== 'latest-report.html')
      .map(file => ({
        name: file,
        path: path.join(this.reportDir, file),
        time: fs.statSync(path.join(this.reportDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    const filesToDelete = files.slice(keepCount);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Deleted old report: ${file.name}`);
    });
  }
}

// CLI usage
if (require.main === module) {
  const packager = new ReportPackager();
  packager.packageReport(true)
    .then(zipPath => {
      console.log(`✅ Report packaged successfully: ${zipPath}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error packaging report:', err);
      process.exit(1);
    });
}






