import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Job Posting Automation', () => {
  test('should create a new job posting', async ({ authenticatedPage, dashboardPage, jobPostingPage }) => {
    // Navigate to Postings
    await dashboardPage.navigateToPostings();

    // Create job posting using Page Object Model
    await jobPostingPage.createJobPosting({
      title: 'Qa Architect',
      department: 'Engineering',
      experienceLevel: 'Senior (5-7 years)',
      employmentType: 'Full-Time',
      openPositions: '1',
      roleSummary: 'Designs scalable automation frameworks, leads quality strategy, and optimizes CI/CD pipelines to ensure robust, high-performance software delivery.',
      responsibilities: ['Automation Testing', 'Manaul Testing', 'SQL', 'Ai', 'Designing'],
      qualification: 'B.tech',
      skills: ['Framework', 'CICD', 'Cursor'],
      compensation: 'Expect ₹30L–₹45L+ total compensation (Base + Equity). Demand premium perks: remote flexibility, comprehensive family insurance, and professional development budgets. You command top-tier rates for delivering strategic architectural value.',
      location: 'Gurgaon'
    });

    console.log('Job posting created and saved as draft. Current URL:', authenticatedPage.url());
  });
});

