/**
 * Test Configuration
 * Centralized configuration for test credentials and settings with environment support
 */

type Environment = 'staging' | 'production' | 'local';

export interface UserProfile {
  email: string;
  password: string;
  userName: string;
  initials?: string;
}

interface EnvironmentConfig {
  baseURL: string;
  timeouts: {
    default: number;
    networkIdle: number;
    fileUpload: number;
    action: number;
    navigation: number;
  };
  retries: number;
}

const environments: Record<Environment, EnvironmentConfig> = {
  staging: {
    baseURL: 'https://login--staging-web-app--fzt5kjl8m2pw.code.run/',
    timeouts: {
      default: 5000,
      networkIdle: 10000,
      fileUpload: 30000,
      action: 15000,
      navigation: 30000,
    },
    retries: 2,
  },
  production: {
    baseURL: process.env.PROD_URL || '',
    timeouts: {
      default: 10000,
      networkIdle: 20000,
      fileUpload: 60000,
      action: 20000,
      navigation: 45000,
    },
    retries: 3,
  },
  local: {
    baseURL: process.env.LOCAL_URL || 'http://localhost:3000',
    timeouts: {
      default: 3000,
      networkIdle: 5000,
      fileUpload: 15000,
      action: 10000,
      navigation: 20000,
    },
    retries: 1,
  },
};

const currentEnv = (process.env.TEST_ENV as Environment) || 'staging';
const envConfig = environments[currentEnv];

export const testConfig = {
  environment: currentEnv,
  baseURL: process.env.BASE_URL || envConfig.baseURL,
  timeouts: envConfig.timeouts,
  retries: envConfig.retries,
  
  // User profiles for multi-profile testing
  profiles: {
    admin: {
      email: process.env.TEST_EMAIL || 'bh.nishant@concret.io',
      password: process.env.TEST_PASSWORD || 'Candidly@2025',
      userName: process.env.TEST_USER_NAME || 'Nishant Bhardwaj',
      initials: 'NB'
    } as UserProfile,
    hr: {
      email: process.env.HR_EMAIL || 'nishant08815@gmail.com',
      password: process.env.HR_PASSWORD || 'Demo@123',
      userName: process.env.HR_USER_NAME || 'HR User',
      initials: 'HU'
    } as UserProfile
  },
  
  // Backward compatibility: Admin Profile credentials
  credentials: {
    email: process.env.TEST_EMAIL || 'bh.nishant@concret.io',
    password: process.env.TEST_PASSWORD || 'Candidly@2025',
    userName: process.env.TEST_USER_NAME || 'Nishant Bhardwaj',
  },
  // Backward compatibility: HR Profile credentials
  hrCredentials: {
    email: process.env.HR_EMAIL || 'nishant08815@gmail.com',
    password: process.env.HR_PASSWORD || 'Demo@123',
    userName: process.env.HR_USER_NAME || 'HR User',
  },
  
  // Logout API configuration for API-based logout
  logoutApi: {
    url: 'https://login--staging-services--896dbbxyfm6q.code.run/api/logout',
    method: 'GET' as const,
  },
};

