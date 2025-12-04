/**
 * Test Data Generator Utility
 * Generates dynamic test data to avoid duplicate record issues
 */

export class TestDataGenerator {
  
  /**
   * Generates a unique job title with timestamp
   */
  static generateJobTitle(baseTitle?: string): string {
    const titles = ['Software Engineer', 'QA Engineer', 'DevOps Engineer', 'Product Manager', 
                    'Data Scientist', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
                    'AI/ML Engineer', 'Cloud Architect', 'Security Engineer', 'Mobile Developer'];
    const base = baseTitle || titles[Math.floor(Math.random() * titles.length)];
    const timestamp = Date.now().toString().slice(-6);
    return `${base}_${timestamp}`;
  }

  /**
   * Generates a unique phone number
   */
  static generatePhoneNumber(): string {
    const prefix = ['98', '97', '96', '95', '94', '93', '91', '88', '87', '86'];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${randomPrefix}${randomDigits}`;
  }

  /**
   * Generates a unique email address
   */
  static generateEmail(name?: string): string {
    const baseName = name || this.generateFirstName();
    const timestamp = Date.now().toString().slice(-6);
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'test.com', 'example.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${baseName.toLowerCase()}${timestamp}@${domain}`;
  }

  /**
   * Generates a random first name
   */
  static generateFirstName(): string {
    const names = ['John', 'Jane', 'Alex', 'Sam', 'Chris', 'Pat', 'Morgan', 'Taylor', 
                   'Jordan', 'Casey', 'Drew', 'Avery', 'Riley', 'Quinn', 'Reese'];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generates a random last name
   */
  static generateLastName(): string {
    const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
                   'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Thomas'];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generates a full name
   */
  static generateFullName(): string {
    return `${this.generateFirstName()} ${this.generateLastName()}`;
  }

  /**
   * Returns a random department
   */
  static getRandomDepartment(): string {
    const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
                         'HR', 'Finance', 'Operations', 'Customer Success'];
    return departments[Math.floor(Math.random() * departments.length)];
  }

  /**
   * Returns a random experience level
   */
  static getRandomExperienceLevel(): string {
    const levels = ['Entry Level (0-1 year)', 'Junior (1-3 years)', 'Mid-Level (3-5 years)', 
                    'Senior (5-7 years)', 'Lead (7-10 years)', 'Principal (10+ years)'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  /**
   * Returns a random employment type
   */
  static getRandomEmploymentType(): string {
    const types = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Generates a random number of open positions (1-10)
   */
  static generateOpenPositions(min: number = 1, max: number = 10): string {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  /**
   * Generates a role summary
   */
  static generateRoleSummary(role?: string): string {
    const roleBase = role || 'Software Engineer';
    const summaries = [
      `Designs scalable systems, leads technical initiatives, and optimizes CI/CD pipelines to ensure robust, high-performance software delivery.`,
      `Responsible for developing and maintaining high-quality software solutions while collaborating with cross-functional teams.`,
      `Leads the design and implementation of complex features while mentoring junior developers and ensuring code quality.`,
      `Architects and implements scalable solutions, drives technical excellence, and ensures best practices across the engineering team.`,
      `Collaborates with product and design teams to deliver user-centric features while maintaining high code quality standards.`
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  /**
   * Returns random skills array
   */
  static getRandomSkills(count: number = 3): string[] {
    const allSkills = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
                       'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring Boot',
                       'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions',
                       'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch',
                       'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
                       'Agile', 'Scrum', 'CI/CD', 'DevOps', 'Microservices', 'REST API', 'GraphQL'];
    
    const shuffled = allSkills.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Returns random responsibilities array
   */
  static getRandomResponsibilities(count: number = 3): string[] {
    const allResponsibilities = ['Automation Testing', 'Manual Testing', 'Code Review', 
                                  'System Design', 'API Development', 'Database Management',
                                  'Team Leadership', 'Technical Documentation', 'Performance Optimization',
                                  'Security Implementation', 'CI/CD Pipeline Management', 'Mentoring'];
    
    const shuffled = allResponsibilities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Generates compensation text
   */
  static generateCompensation(minLPA: number = 10, maxLPA: number = 50): string {
    const min = Math.floor(Math.random() * (maxLPA - minLPA) / 2) + minLPA;
    const max = min + Math.floor(Math.random() * 20) + 10;
    return `Expect ₹${min}L–₹${max}L+ total compensation (Base + Equity). Includes premium perks: remote flexibility, comprehensive family insurance, and professional development budgets.`;
  }

  /**
   * Generates a numeric compensation value
   */
  static generateCompensationValue(min: number = 10, max: number = 100): string {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  /**
   * Returns a random location
   */
  static getRandomLocation(): string {
    const locations = ['Jaipur', 'Gurgaon', 'Remote', 'Hybrid'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  /**
   * Returns random locations array
   */
  static getRandomLocations(count: number = 2): string[] {
    const locations = ['Jaipur', 'Gurgaon', 'Remote', 'Hybrid'];
    const shuffled = locations.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, locations.length));
  }

  /**
   * Returns all available locations
   */
  static getAllLocations(): string[] {
    return ['Jaipur', 'Gurgaon', 'Remote', 'Hybrid'];
  }

  /**
   * Returns a random qualification
   */
  static getRandomQualification(): string {
    const qualifications = ['B.Tech', 'M.Tech', 'MCA', 'BCA', 'B.E.', 'M.E.', 
                            'BSc Computer Science', 'MSc Computer Science', 'PhD'];
    return qualifications[Math.floor(Math.random() * qualifications.length)];
  }

  /**
   * Generates random experience years
   */
  static generateExperience(min: number = 0, max: number = 15): string {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  /**
   * Generates random notice period (in days)
   */
  static generateNoticePeriod(): string {
    const periods = ['0', '7', '15', '30', '45', '60', '90'];
    return periods[Math.floor(Math.random() * periods.length)];
  }

  /**
   * Generates random CTC value
   */
  static generateCTC(min: number = 5, max: number = 100): string {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  /**
   * Generates skills string (comma-separated)
   */
  static generateSkillsString(count: number = 3): string {
    return this.getRandomSkills(count).join(', ');
  }

  /**
   * Complete job posting data object
   */
  static generateJobPostingData(overrides: Partial<JobPostingData> = {}): JobPostingData {
    return {
      title: this.generateJobTitle(),
      department: this.getRandomDepartment(),
      experienceLevel: this.getRandomExperienceLevel(),
      employmentType: this.getRandomEmploymentType(),
      openPositions: this.generateOpenPositions(),
      roleSummary: this.generateRoleSummary(),
      responsibilities: this.getRandomResponsibilities(),
      qualification: this.getRandomQualification(),
      skills: this.getRandomSkills(),
      compensation: this.generateCompensation(),
      location: this.getRandomLocation(),
      ...overrides
    };
  }

  /**
   * Complete applicant data object
   * NOTE: 'role' must be provided - it should be an existing job posting title from the system
   */
  static generateApplicantData(overrides: Partial<ApplicantData> & { role: string }): ApplicantData {
    const { role, ...restOverrides } = overrides;
    return {
      resumePath: 'test-resources/functionalsample.pdf',
      phone: this.generatePhoneNumber(),
      role: role, // Must be an existing job posting
      experience: this.generateExperience(),
      noticePeriod: this.generateNoticePeriod(),
      currentCTC: this.generateCTC(5, 50),
      expectedCTC: this.generateCTC(10, 80),
      skills: this.generateSkillsString(),
      ...restOverrides
    };
  }
}

// Type definitions
export interface JobPostingData {
  title: string;
  department: string;
  experienceLevel: string;
  employmentType: string;
  openPositions: string;
  roleSummary: string;
  responsibilities: string[];
  qualification: string;
  skills: string[];
  compensation: string;
  location: string;
}

export interface ApplicantData {
  resumePath: string;
  phone: string;
  role: string;
  experience: string;
  noticePeriod: string;
  currentCTC: string;
  expectedCTC: string;
  skills: string;
}
