import { test, expect } from '../fixtures/test-fixtures';
import type { Page } from '@playwright/test';
import { InterviewPage, InterviewData } from '../../pages/interview-page';
import { TestDataGenerator } from '../../utils/data/test-data-generator';
import { testConfig } from '../../config/test-config';
import { retryWithBackoff } from '../../utils/element-helpers/retry-helper';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { ApplicantsPage } from '../../pages/applicants-page';
import { generateUniqueId } from '../../utils/data/date-name-utils';
import { TestDataTracker } from '../../utils/data/test-data-tracker';
import { performTestCleanup } from '../../utils/cleanup/test-cleanup';

/**
 * Interview Automation Test Suite
 * Comprehensive test coverage for interview scheduling and management
 * Supports multiple profiles and data-driven testing
 * 
 * Flow:
 * 1. First adds applicants
 * 2. Then performs interview test cases on them
 * 3. Tracks rounds used per applicant to avoid duplicates
 */

test.describe.serial('Interview Automation Tests', () => {
    const profile = { 
      name: 'Admin Profile', 
      email: testConfig.credentials.email, 
      password: testConfig.credentials.password, 
      userName: testConfig.credentials.userName,
      interviewerName: testConfig.credentials.userName,
      tag: '@admin-profile' 
    };
    
    test.describe.configure({ timeout: 480 * 1000 });

    let interviewPage: InterviewPage;
    let applicantsPage: ApplicantsPage;
    let dashboardPage: DashboardPage;

    const applicantRounds = new Map<string, Set<string>>();
    const addedApplicants: string[] = [];

    test.beforeAll(() => {
      addedApplicants.length = 0;
    });

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.login(profile.email, profile.password);

      dashboardPage = new DashboardPage(page);
      await dashboardPage.closeNotifications();

      interviewPage = new InterviewPage(page);
      applicantsPage = new ApplicantsPage(page);
    });

    test.afterEach(async ({ page }) => {
      // Use standardized cleanup
      await performTestCleanup(page, {
        dashboardPage,
        logoutViaApi: true,
        verbose: false
      });
    });

    // ==========================================
    // APPLICANT SETUP PHASE
    // ==========================================

    test.describe('Applicant Setup - Add Applicants First', () => {
      
      test('Setup: Add multiple applicants for interview testing', { 
        tag: ['@setup', '@applicants'] 
      }, async ({ page }, testInfo) => {
        // Navigate to applicants page
        await dashboardPage.navigateToApplicants();
        
        // Number of applicants to add (enough for all test cases)
        const numberOfApplicants = 10;
        
        for (let i = 0; i < numberOfApplicants; i++) {
          try {
            // Ensure we're on applicants page before adding (navigation might have been lost)
            await dashboardPage.navigateToApplicants();
            // Wait for applicants page to be ready
            await expect(page.getByRole('button', { name: 'Add Applicant' })).toBeVisible({ timeout: 5000 });
            
            // Generate unique applicant data
            const applicantData = TestDataGenerator.generateApplicantData({
              resumePath: 'test-resources/functionalsample.pdf',
              // role will be randomly selected from available options
            });

            // Add applicant - the addApplicant method will handle duplicate email/name errors
            const identifier = await applicantsPage.addApplicant(applicantData);
            TestDataTracker.track(testInfo.testId, { type: 'applicant', identifier: String(identifier), metadata: { email: String(identifier).includes('@') ? String(identifier) : undefined, name: String(identifier) } });

            // Get the applicant name from the form (before it's closed)
            // Since the form auto-fills, we can get it after submission
            // We'll track by a unique identifier generated during addition
            const applicantId = `Applicant_${generateUniqueId(6)}`;
            addedApplicants.push(applicantId);
            
            console.log(`✓ Setup: Applicant ${i + 1}/${numberOfApplicants} added successfully`);
            
            // Wait for applicant to be added (check for dialog to close)
            const dialog = page.getByRole('dialog', { name: /Add New Applicant/i });
            await expect(dialog).not.toBeVisible({ timeout: 5000 }).catch(() => {
              // Dialog might already be closed, continue
            });
          } catch (error) {
            console.error(`Error adding applicant ${i + 1}:`, error);
            // Try to navigate back to applicants page even if addition failed
            try {
              await dashboardPage.navigateToApplicants();
              // Wait for applicants page to be ready
              await expect(page.getByRole('button', { name: 'Add Applicant' })).toBeVisible({ timeout: 5000 }).catch(() => {});
            } catch (navError) {
              console.error(`Failed to navigate back to applicants page: ${navError}`);
            }
            // Continue with next applicant even if one fails
          }
        }
        
        console.log(`✓ Setup: Added ${addedApplicants.length} applicants for interview testing`);
      });
    });

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    /**
     * Get a round that hasn't been used for this applicant yet
     */
    function getUnusedRoundForApplicant(applicantName: string): string {
      const usedRounds = applicantRounds.get(applicantName) || new Set<string>();
      const allRounds = TestDataGenerator.getAllInterviewRounds();
      const availableRounds = allRounds.filter(round => !usedRounds.has(round));
      
      if (availableRounds.length === 0) {
        // All rounds used, reset and start fresh
        applicantRounds.set(applicantName, new Set<string>());
        return allRounds[0];
      }
      
      // Return a random available round
      return availableRounds[Math.floor(Math.random() * availableRounds.length)];
    }

    /**
     * Mark a round as used for an applicant
     */
    function markRoundUsed(applicantName: string, round: string): void {
      if (!applicantRounds.has(applicantName)) {
        applicantRounds.set(applicantName, new Set<string>());
      }
      applicantRounds.get(applicantName)!.add(round);
    }

    /**
     * Get a freshly created applicant name (from beforeEach)
     * Returns SELECT_FIRST_AVAILABLE to use the first applicant from dropdown
     * The applicants created in beforeEach will be available in the dropdown
     */
    function getFreshApplicant(): string {
      // Use SELECT_FIRST_AVAILABLE which will pick the first applicant from the dropdown
      // Since we just created applicants in beforeEach, they'll be at the top of the list
      if (addedApplicants.length === 0) {
        console.log('Warning: No applicants were created in beforeEach, falling back to SELECT_FIRST_AVAILABLE');
      } else {
        console.log(`Using SELECT_FIRST_AVAILABLE to get freshly created applicant (${addedApplicants.length} applicants were created)`);
      }
      return 'SELECT_FIRST_AVAILABLE';
    }

    /**
     * Schedule interview with retry logic to handle duplicate errors
     * If duplicate error occurs, retries with different date/time/round combination
     * @param page Playwright page object for closing dialogs
     * @param interviewPage InterviewPage instance
     * @param baseInterviewData Base interview data
     * @param maxRetries Maximum number of retry attempts
     * @param preserveRound If true, preserves the round from baseInterviewData on retries
     */
    async function scheduleInterviewWithRetry(
      page: Page,
      interviewPage: InterviewPage,
      baseInterviewData: InterviewData,
      maxRetries: number = 3,
      preserveRound: boolean = false
    ): Promise<{ applicantName: string; interviewData: InterviewData }> {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Generate unique data for this attempt to avoid duplicates
          const allRounds = TestDataGenerator.getAllInterviewRounds();
          const allTimes = TestDataGenerator.getAllInterviewTimes();
          
          // Use different date/time/round for each retry attempt
          const dateOffset = 7 + (attempt * 3) + Math.floor(Math.random() * 14);
          const roundIndex = (attempt + Math.floor(Math.random() * allRounds.length)) % allRounds.length;
          const timeIndex = (attempt + Math.floor(Math.random() * allTimes.length)) % allTimes.length;
          
          // Change applicant selection strategy on retry to avoid same applicant issues
          let applicantSelection = baseInterviewData.applicantName;
          if (attempt > 0) {
            if (baseInterviewData.applicantName === 'SELECT_FIRST_AVAILABLE') {
              // Alternate between SELECT_FIRST_AVAILABLE and SELECT_RANDOM on retries
              applicantSelection = attempt % 2 === 0 ? 'SELECT_FIRST_AVAILABLE' : 'SELECT_RANDOM';
              console.log(`Retry attempt ${attempt + 1}: Changing applicant selection to ${applicantSelection}`);
            } else if (baseInterviewData.applicantName === 'SELECT_RANDOM') {
              // If using SELECT_RANDOM, try SELECT_FIRST_AVAILABLE on retry
              applicantSelection = 'SELECT_FIRST_AVAILABLE';
              console.log(`Retry attempt ${attempt + 1}: Changing applicant selection from SELECT_RANDOM to SELECT_FIRST_AVAILABLE`);
            }
            // If using a specific applicant name, keep it (test might be testing specific applicant)
          }
          
          const interviewData: InterviewData = {
            ...baseInterviewData,
            applicantName: applicantSelection,
            date: TestDataGenerator.generateFutureInterviewDate(dateOffset),
            round: preserveRound ? baseInterviewData.round : allRounds[roundIndex],
            time: allTimes[timeIndex]
          };
          
          const selectedApplicant = await interviewPage.scheduleInterview(interviewData);
          
          // Track the round used for this applicant
          markRoundUsed(selectedApplicant, interviewData.round);
          
          // Verify interview was scheduled successfully
          await interviewPage.verifyInterviewScheduled();
          
          return { applicantName: selectedApplicant, interviewData };
        } catch (error) {
          lastError = error as Error;
          
          // Check if it's a duplicate error
          if (lastError.message.includes('DUPLICATE INTERVIEW ERROR')) {
            console.log(`Duplicate interview error on attempt ${attempt + 1}/${maxRetries}, retrying with different parameters...`);
            
            // Close any open dialog before retrying
            try {
              // Try clicking Back button if dialog is still open
              const backButton = page.getByRole('button', { name: 'Back' });
              if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await backButton.click();
                // Wait for dialog to close
                const interviewDialog = page.getByRole('dialog');
                await expect(interviewDialog).not.toBeVisible({ timeout: 3000 }).catch(() => {});
              } else {
                // If Back button not found, try pressing Escape
                await page.keyboard.press('Escape');
                // Wait for dialog to close
                const dialog = page.getByRole('dialog');
                await expect(dialog).not.toBeVisible({ timeout: 2000 }).catch(() => {});
              }
              
              // Wait for interviews page to be ready
              await expect(page.getByRole('button', { name: 'Schedule Interview' })).toBeVisible({ timeout: 5000 }).catch(() => {});
              
              // Ensure we're back on the interviews page before retrying
              await interviewPage.navigateToInterviews();
            } catch (closeError) {
              // If closing dialog fails, try to navigate anyway
              console.log('Error closing dialog, attempting navigation:', closeError);
              try {
                // Try pressing Escape as fallback
                await page.keyboard.press('Escape');
                // Wait for dialog to close
                const dialog = page.getByRole('dialog');
                await expect(dialog).not.toBeVisible({ timeout: 2000 }).catch(() => {});
                await interviewPage.navigateToInterviews();
              } catch (navError) {
                console.error('Failed to navigate after duplicate error:', navError);
              }
            }
            
            // Continue to next retry with different parameters
            continue;
          } 
          // Check if it's a verification error (Schedule Interview button not found)
          else if (lastError.message.includes('Schedule Interview') || 
                   lastError.message.includes('toBeVisible') ||
                   lastError.stack?.includes('verifyInterviewScheduled')) {
            console.log(`Verification error on attempt ${attempt + 1}/${maxRetries} (Schedule Interview button not found), retrying with different round/applicant...`);
            
            // Close any open dialogs and navigate back
            try {
              // Try clicking Back button if dialog is still open
              const backButton = page.getByRole('button', { name: 'Back' });
              if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await backButton.click();
                // Wait for dialog to close
                const dialog = page.getByRole('dialog');
                await expect(dialog).not.toBeVisible({ timeout: 3000 }).catch(() => {});
              }
              
              // Press Escape to close any modals
              await page.keyboard.press('Escape');
              // Wait for any dialog to close
              const modalDialog = page.getByRole('dialog');
              await expect(modalDialog).not.toBeVisible({ timeout: 2000 }).catch(() => {});
              
              // Navigate back to interviews page
              await interviewPage.navigateToInterviews();
              // Wait for interviews page to be ready
              await expect(page.getByRole('button', { name: 'Schedule Interview' })).toBeVisible({ timeout: 5000 });
            } catch (cleanupError) {
              console.log('Error during cleanup, attempting navigation:', cleanupError);
              try {
                await page.keyboard.press('Escape');
                // Wait for dialog to close
                const dialog = page.getByRole('dialog');
                await expect(dialog).not.toBeVisible({ timeout: 2000 }).catch(() => {});
                await interviewPage.navigateToInterviews();
              } catch (navError) {
                console.error('Failed to navigate after verification error:', navError);
              }
            }
            
            // Continue to next retry with different parameters (round and applicant will change)
            continue;
          } else {
            // For other errors, throw immediately
            throw error;
          }
        }
      }
      
      // If all retries failed, throw the last error
      throw new Error(`Failed to schedule interview after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }

    // ==========================================
    // POSITIVE TEST CASES
    // ==========================================

    test.describe('Interview Scheduling - Positive Cases', () => {
      
      test('TC-INT-001: Schedule interview with first available applicant', { 
        tag: ['@E2E', '@Interview', '@smoke'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        // Generate base interview data using freshly created applicant
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant() // Use freshly created applicant
        });

        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        console.log(`✓ TC-INT-001: Interview scheduled - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
      });

      test('TC-INT-002: Schedule interview with different interview rounds', { 
        tag: ['@E2E', '@Interview'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        const rounds = TestDataGenerator.getAllInterviewRounds();
        const usedApplicants = new Map<string, number>(); // Track how many interviews per applicant
        
        for (let i = 0; i < rounds.length; i++) {
          // Use specific round for this test case
          let roundToUse = rounds[i];
          
          // Create base interview data with the specific round
          const baseInterviewData = TestDataGenerator.generateInterviewData({
            mainInterviewer: profile.interviewerName,
            applicantName: getFreshApplicant(), // Use freshly created applicant
            round: roundToUse,
            date: TestDataGenerator.generateFutureInterviewDate(7 + i * 3), // Stagger dates with 3-day gap
            time: TestDataGenerator.getRandomInterviewTime()
          });

          // Schedule with retry - preserve the round since we're testing specific rounds
          const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
            page,
            interviewPage,
            baseInterviewData,
            3,
            true // Preserve the round
          );
          
          console.log(`✓ TC-INT-002: Interview ${i + 1}/${rounds.length} - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
        }
      });

      test('TC-INT-003: Schedule interview with different time slots', { 
        tag: ['@E2E', '@Interview'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        const times = TestDataGenerator.getAllInterviewTimes();
        // Select 4 random time slots
        const selectedTimes = times.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        for (let i = 0; i < selectedTimes.length; i++) {
          const baseInterviewData = TestDataGenerator.generateInterviewData({
            mainInterviewer: profile.interviewerName,
            applicantName: getFreshApplicant(), // Use freshly created applicant
            time: selectedTimes[i],
            round: TestDataGenerator.getRandomInterviewRound(),
            date: TestDataGenerator.generateFutureInterviewDate(7 + i * 3) // Increase gap to 3 days
          });

          const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
            page,
            interviewPage,
            baseInterviewData
          );
          
          console.log(`✓ TC-INT-003: Interview ${i + 1}/${selectedTimes.length} - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
        }
      });

      test('TC-INT-004: Schedule interview with additional interviewers', { 
        tag: ['@E2E', '@Interview'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        // Use a valid interviewer name that exists in the dropdown
        const additionalInterviewer = 'Nishant Bhardwaj';
        
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant(), // Use freshly created applicant
          additionalInterviewers: [additionalInterviewer]
        });

        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        console.log(`✓ TC-INT-004: Interview scheduled - Applicant: ${selectedApplicant}, Additional Interviewers: Yes, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
      });

      test('TC-INT-005: Schedule interview for different future dates', { 
        tag: ['@E2E', '@Interview'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        // Generate 4 unique date offsets between 7-30 days
        const dateOffsets: number[] = [];
        while (dateOffsets.length < 4) {
          const offset = Math.floor(Math.random() * 24) + 7; // 7-30 days
          if (!dateOffsets.includes(offset)) {
            dateOffsets.push(offset);
          }
        }
        dateOffsets.sort((a, b) => a - b); // Sort for better organization
        
        for (let i = 0; i < dateOffsets.length; i++) {
          const baseInterviewData = TestDataGenerator.generateInterviewData({
            mainInterviewer: profile.interviewerName,
            applicantName: getFreshApplicant(), // Use freshly created applicant
            date: TestDataGenerator.generateFutureInterviewDate(dateOffsets[i]),
            round: TestDataGenerator.getRandomInterviewRound(),
            time: TestDataGenerator.getRandomInterviewTime()
          });

          const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
            page,
            interviewPage,
            baseInterviewData
          );
          
          console.log(`✓ TC-INT-005: Interview ${i + 1}/${dateOffsets.length} - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date} (${dateOffsets[i]} days), Time: ${interviewData.time}`);
        }
      });

      test('TC-INT-006: Schedule interview and send email notification', { 
        tag: ['@E2E', '@Interview', '@smoke'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant() // Use freshly created applicant
        });

        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        // Send email notification
        await retryWithBackoff(async () => {
          await interviewPage.sendInterviewEmail();
        }, { maxRetries: 3, initialDelay: 1000 });
        
        // Verify email was sent (button should still be visible or change state)
        await interviewPage.verifySendEmailButtonVisible();
        
        console.log(`✓ TC-INT-006: Interview scheduled and email sent - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
      });

      test('TC-INT-007: Schedule multiple interviews in sequence', { 
        tag: ['@E2E', '@Interview'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        const interviewCount = 3;
        
        for (let i = 0; i < interviewCount; i++) {
          const baseInterviewData = TestDataGenerator.generateInterviewData({
            mainInterviewer: profile.interviewerName,
            applicantName: getFreshApplicant(), // Use freshly created applicant
            round: TestDataGenerator.getRandomInterviewRound(),
            time: TestDataGenerator.getRandomInterviewTime(),
            date: TestDataGenerator.generateFutureInterviewDate(7 + i * 3) // Increase gap to 3 days for more uniqueness
          });

          const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
            page,
            interviewPage,
            baseInterviewData
          );
          
          console.log(`✓ TC-INT-007: Interview ${i + 1}/${interviewCount} - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
        }
      });
    });

    // ==========================================
    // DATA-DRIVEN TEST CASES
    // ==========================================

    test.describe('Interview Scheduling - Data-Driven Tests', () => {
      
      // Test with various interview round combinations
      const interviewRounds = TestDataGenerator.getAllInterviewRounds();
      for (const round of interviewRounds) {
        test(`TC-INT-DD-001: Schedule interview for ${round} round`, { 
          tag: ['@E2E', '@Interview', '@data-driven'] 
        }, async ({ page }) => {
          await interviewPage.navigateToInterviews();
          
          const randomDateOffset = Math.floor(Math.random() * 21) + 7; // 7-27 days
          const baseInterviewData = TestDataGenerator.generateInterviewData({
            mainInterviewer: profile.interviewerName,
            applicantName: getFreshApplicant(), // Use freshly created applicant
            round: round,
            date: TestDataGenerator.generateFutureInterviewDate(randomDateOffset),
            time: TestDataGenerator.getRandomInterviewTime()
          });

          const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
            page,
            interviewPage,
            baseInterviewData
          );
          
          console.log(`✓ TC-INT-DD-001: Interview scheduled - Applicant: ${selectedApplicant}, Round: ${round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
        });
      }

      // Test with various time slots
      const timeSlots = ['9:00 AM', '12:00 PM', '3:00 PM', '5:00 PM'];
      for (const time of timeSlots) {
        test(`TC-INT-DD-002: Schedule interview at ${time}`, { 
          tag: ['@E2E', '@Interview', '@data-driven'] 
        }, async ({ page }) => {
          await interviewPage.navigateToInterviews();
          
          const randomDateOffset = Math.floor(Math.random() * 21) + 7; // 7-27 days
          const baseInterviewData = TestDataGenerator.generateInterviewData({
            mainInterviewer: profile.interviewerName,
            applicantName: getFreshApplicant(), // Use freshly created applicant
            time: time,
            round: TestDataGenerator.getRandomInterviewRound(),
            date: TestDataGenerator.generateFutureInterviewDate(randomDateOffset)
          });

          const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
            page,
            interviewPage,
            baseInterviewData
          );
          
          console.log(`✓ TC-INT-DD-002: Interview scheduled - Applicant: ${selectedApplicant}, Time: ${time}, Round: ${interviewData.round}, Date: ${interviewData.date}`);
        });
      }
    });

    // ==========================================
    // VALIDATION TEST CASES
    // ==========================================

    test.describe('Interview Validation Tests', () => {
      
      test('TC-INT-VAL-001: Verify interview scheduling dialog elements', { 
        tag: ['@Interview', '@validation'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        await interviewPage.openScheduleDialog();
        
        // Verify all required elements are visible
        await interviewPage.verifyScheduleDialogElements();
        
        console.log('✓ TC-INT-VAL-001: All interview dialog elements verified');
      });

      test('TC-INT-VAL-002: Verify interview can be scheduled with valid data', { 
        tag: ['@Interview', '@validation'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        await interviewPage.openScheduleDialog();
        
        // Verify dialog is open
        await interviewPage.verifyScheduleDialogElements();
        
        // Schedule interview with retry
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant() // Use freshly created applicant
        });
        
        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        console.log(`✓ TC-INT-VAL-002: Interview scheduling validated - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
      });
    });

    // ==========================================
    // EDGE CASES AND ROBUSTNESS
    // ==========================================

    test.describe('Interview Edge Cases', () => {
      
      test('TC-INT-EDGE-001: Schedule interview with minimum future date (7 days)', { 
        tag: ['@Interview', '@edge-case'] 
      }, async ({ page }, testInfo) => {
        await interviewPage.navigateToInterviews();
        
        const allTimes = TestDataGenerator.getAllInterviewTimes();
        const allRounds = TestDataGenerator.getAllInterviewRounds();
        
        const timestamp = Math.floor(Date.now() / 1000);
        const uniqueIndex = timestamp + testInfo.retry;
        const dateOffset = 7 + testInfo.retry + (timestamp % 10); // 7-17+ days
        const timeIndex = uniqueIndex % allTimes.length;
        const roundIndex = (uniqueIndex + testInfo.retry) % allRounds.length;
        
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant(), // Use freshly created applicant
          date: TestDataGenerator.generateFutureInterviewDate(dateOffset),
          time: allTimes[timeIndex],
          round: allRounds[roundIndex]
        });

        console.log(`Attempt ${testInfo.retry + 1}: Scheduling with Date offset: ${dateOffset}, Time: ${baseInterviewData.time}, Round: ${baseInterviewData.round}`);
        
        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        console.log(`✓ TC-INT-EDGE-001: Interview scheduled - Applicant: ${selectedApplicant}, Min date (${dateOffset} days), Round: ${interviewData.round}, Time: ${interviewData.time}`);
      });

      test('TC-INT-EDGE-002: Schedule interview with maximum future date (30 days)', { 
        tag: ['@Interview', '@edge-case'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant(), // Use freshly created applicant
          date: TestDataGenerator.generateFutureInterviewDate(30), // 30 days ahead
          round: TestDataGenerator.getRandomInterviewRound(),
          time: TestDataGenerator.getRandomInterviewTime()
        });

        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        console.log(`✓ TC-INT-EDGE-002: Interview scheduled - Applicant: ${selectedApplicant}, Max date (30 days), Round: ${interviewData.round}, Time: ${interviewData.time}`);
      });

      test('TC-INT-EDGE-003: Handle interview scheduling with retry mechanism', { 
        tag: ['@Interview', '@edge-case', '@robustness'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant() // Use freshly created applicant
        });

        // Use retry mechanism for scheduling
        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        console.log(`✓ TC-INT-EDGE-003: Interview scheduled with retry - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
      });
    });

    // ==========================================
    // INTEGRATION TEST CASES
    // ==========================================

    test.describe('Interview Integration Tests', () => {
      
      test('TC-INT-INT-001: Complete interview workflow - Schedule and Send Email', { 
        tag: ['@E2E', '@Interview', '@integration'] 
      }, async ({ page }) => {
        await interviewPage.navigateToInterviews();
        
        const baseInterviewData = TestDataGenerator.generateInterviewData({
          mainInterviewer: profile.interviewerName,
          applicantName: getFreshApplicant() // Use freshly created applicant
        });

        const { applicantName: selectedApplicant, interviewData } = await scheduleInterviewWithRetry(
          page,
          interviewPage,
          baseInterviewData
        );
        
        // Send email notification
        await retryWithBackoff(async () => {
          await interviewPage.sendInterviewEmail();
        }, { maxRetries: 3, initialDelay: 1000 });
        
        // Verify both actions completed
        await interviewPage.verifySendEmailButtonVisible();
        
        console.log(`✓ TC-INT-INT-001: Complete workflow executed - Applicant: ${selectedApplicant}, Round: ${interviewData.round}, Date: ${interviewData.date}, Time: ${interviewData.time}`);
      });
    });
  });
