/**
 * Test Configuration
 * Centralized configuration for test credentials and settings
 */
export const testConfig = {
  credentials: {
    email: process.env.TEST_EMAIL || 'bh.nishant@concret.io',
    password: process.env.TEST_PASSWORD || 'Candidly@2025',
  },
  baseURL: process.env.BASE_URL || 'https://candidly--staging-web-app--fzt5kjl8m2pw.code.run/',
  timeouts: {
    default: 5000,
    networkIdle: 10000,
    fileUpload: 30000,
  },
};

