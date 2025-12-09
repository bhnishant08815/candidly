# Profile Testing Guide

## Current Setup

The job posting regression tests are configured to run with **both profiles automatically**. Each test case runs twice - once for each profile.

### Profiles Available:
1. **Admin Profile**: `bh.nishant@concret.io`
2. **HR Profile**: `nishant08815@gmail.com`

## How to Run Tests

# Run for BOTH profiles (Admin + HR)
- npx playwright test tests/job-posting/job-posting-regression.spec.ts

# Run ONLY for Admin Profile
- npx playwright test tests/job-posting/job-posting-regression.spec.ts --grep "Admin Profile"

# Run ONLY for HR Profile
- npx playwright test tests/job-posting/job-posting-regression.spec.ts --grep "HR Profile"

### Option 1: Run for ALL Profiles (Default Behavior)
```bash
npx playwright test tests/job-posting/job-posting-regression.spec.ts
```
This will run all tests for both profiles. You'll see test results like:
- `Job Posting Regression Tests - Default Profile > TC-JP01: Create job posting...`
- `Job Posting Regression Tests - HR Profile > TC-JP01: Create job posting...`

### Option 2: Run for a SPECIFIC Profile using Environment Variable
```bash
# Run only for Admin Profile
PROFILE_FILTER=admin npx playwright test tests/job-posting/job-posting-regression.spec.ts

# Run only for HR Profile
PROFILE_FILTER=hr npx playwright test tests/job-posting/job-posting-regression.spec.ts
```

### Option 3: Run for a SPECIFIC Profile using Playwright's grep
```bash
# Run only for Admin Profile
npx playwright test tests/job-posting/job-posting-regression.spec.ts --grep "Admin Profile"

# Run only for HR Profile
npx playwright test tests/job-posting/job-posting-regression.spec.ts --grep "HR Profile"
```

### Option 4: Run a Specific Test for a Specific Profile
```bash
# Run TC-JP01 only for HR Profile
npx playwright test tests/job-posting/job-posting-regression.spec.ts --grep "HR Profile.*TC-JP01"
```

## Understanding Test Output

When you run the tests, you'll see:
```
✓ Job Posting Regression Tests - Admin Profile > Manual Job Posting Creation > TC-JP01: Create job posting...
✓ Job Posting Regression Tests - HR Profile > Manual Job Posting Creation > TC-JP01: Create job posting...
```

Each test runs independently for each profile, so you can verify that the functionality works correctly for both user types.

## Adding More Profiles

To add more profiles, edit `config/test-config.ts`:

```typescript
export const testConfig = {
  credentials: { ... },
  hrCredentials: { ... },
  // Add new profile
  adminCredentials: {
    email: 'admin@example.com',
    password: 'Admin@123',
    userName: 'Admin User',
  },
};
```

Then update `tests/job-posting/job-posting-regression.spec.ts`:

```typescript
const profiles = [
  { name: 'Admin Profile', email: testConfig.credentials.email, password: testConfig.credentials.password },
  { name: 'HR Profile', email: testConfig.hrCredentials.email, password: testConfig.hrCredentials.password },
  { name: 'New Profile', email: testConfig.newProfileCredentials.email, password: testConfig.newProfileCredentials.password },
];
```

## Notes

- Each profile gets its own test suite, so tests are isolated
- Tests automatically login before each test and logout after
- You can verify different permissions/behaviors for different user roles
- Test results will show which profile each test ran with

