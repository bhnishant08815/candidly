/**
 * Test Data Generator Utility
 * Generates dynamic test data to avoid duplicate record issues
 */

export class TestDataGenerator {
  
  /**
   * Generates a unique job title with timestamp
   * Provides diverse, realistic job titles with various levels and specializations
   */
  static generateJobTitle(baseTitle?: string): string {
    // If base title is provided, use it directly
    if (baseTitle) {
      const timestamp = Date.now().toString().slice(-6);
      return `${baseTitle}_${timestamp}`;
    }

    // Comprehensive list of job titles organized by category
    const levels = ['Junior', 'Senior', 'Lead', 'Principal', 'Staff', 'Associate'];
    const engineeringRoles = [
      'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
      'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Developer', 'Angular Developer',
      'Vue.js Developer', 'Node.js Developer', 'Python Developer', 'Java Developer', '.NET Developer',
      'Go Developer', 'Rust Developer', 'DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer',
      'Cloud Engineer', 'Infrastructure Engineer', 'Security Engineer', 'QA Engineer', 'Test Engineer',
      'Automation Engineer', 'Performance Engineer', 'Data Engineer', 'ML Engineer', 'AI Engineer',
      'Machine Learning Engineer', 'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
      'Blockchain Developer', 'Game Developer', 'Embedded Systems Engineer', 'Firmware Engineer'
    ];
    
    const architectureRoles = [
      'Software Architect', 'Solution Architect', 'Cloud Architect', 'Enterprise Architect',
      'System Architect', 'Technical Architect', 'Data Architect', 'Security Architect'
    ];
    
    const managementRoles = [
      'Engineering Manager', 'Technical Lead', 'Team Lead', 'Development Manager',
      'Product Manager', 'Technical Product Manager', 'Program Manager', 'Project Manager',
      'Scrum Master', 'Agile Coach', 'Delivery Manager'
    ];
    
    const dataRoles = [
      'Data Scientist', 'Data Analyst', 'Business Analyst', 'Data Engineer',
      'Analytics Engineer', 'BI Developer', 'Research Scientist', 'Statistician'
    ];
    
    const designRoles = [
      'UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Interaction Designer',
      'Visual Designer', 'Design Systems Designer', 'UX Researcher'
    ];
    
    const otherRoles = [
      'Technical Writer', 'Developer Advocate', 'Solutions Engineer', 'Sales Engineer',
      'Customer Success Engineer', 'Support Engineer', 'QA Lead', 'Release Manager',
      'Build Engineer', 'Database Administrator', 'Network Engineer', 'Systems Administrator'
    ];

    // Combine all roles
    const allRoles = [
      ...engineeringRoles,
      ...architectureRoles,
      ...managementRoles,
      ...dataRoles,
      ...designRoles,
      ...otherRoles
    ];

    // Randomly decide whether to add a level prefix (30% chance)
    const shouldAddLevel = Math.random() < 0.3;
    let selectedRole = allRoles[Math.floor(Math.random() * allRoles.length)];
    
    if (shouldAddLevel && !selectedRole.includes('Lead') && !selectedRole.includes('Manager') && 
        !selectedRole.includes('Principal') && !selectedRole.includes('Staff')) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      selectedRole = `${level} ${selectedRole}`;
    }

    // Add technology specialization for some roles (20% chance)
    if (Math.random() < 0.2 && (selectedRole.includes('Developer') || selectedRole.includes('Engineer'))) {
      const technologies = ['React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'AWS', 'Azure', 'GCP', 
                           'Kubernetes', 'Docker', 'Microservices', 'GraphQL', 'TypeScript', 'Scala'];
      const tech = technologies[Math.floor(Math.random() * technologies.length)];
      selectedRole = `${selectedRole} (${tech})`;
    }

    const timestamp = Date.now().toString().slice(-6);
    return `${selectedRole}_${timestamp}`;
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
   * Returns a valid existing location for job postings
   * Uses existing locations in the system to avoid creating duplicates
   */
  static generateCustomLocation(): string {
    return this.getRandomLocation();
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
   * Generates random notice period months
   */
  static generateNoticePeriodMonths(): string {
    const months = ['0', '1', '2', '3'];
    return months[Math.floor(Math.random() * months.length)];
  }

  /**
   * Generates random notice period days
   */
  static generateNoticePeriodDays(): string {
    const days = ['0', '7', '15', '30'];
    return days[Math.floor(Math.random() * days.length)];
  }

  /**
   * Generates random experience months (0-11)
   */
  static generateExperienceMonths(): string {
    return String(Math.floor(Math.random() * 12));
  }

  /**
   * Generates random salary value (annual, full amount like 1000000)
   */
  static generateSalary(minLakhs: number = 5, maxLakhs: number = 50): string {
    const lakhs = Math.floor(Math.random() * (maxLakhs - minLakhs + 1)) + minLakhs;
    return String(lakhs * 100000); // Convert to full amount
  }

  /**
   * Generates random education details
   */
  static generateEducation(): string {
    const degrees = ['B.Tech in Computer Science', 'M.Tech in Software Engineering', 'BCA', 'MCA', 
                     'BSc Computer Science', 'MSc Computer Science', 'B.E. in IT', 'MBA in Technology'];
    const colleges = ['IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore', 'IIIT Hyderabad'];
    return `${degrees[Math.floor(Math.random() * degrees.length)]}, ${colleges[Math.floor(Math.random() * colleges.length)]}`;
  }

  /**
   * Generates random work experience summary
   */
  static generateWorkExperience(): string {
    const roles = ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Full Stack Developer', 'Backend Developer'];
    const companies = ['TCS', 'Infosys', 'Wipro', 'Tech Mahindra', 'HCL', 'Cognizant', 'Accenture'];
    return `${roles[Math.floor(Math.random() * roles.length)]} at ${companies[Math.floor(Math.random() * companies.length)]}`;
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
      location: this.generateCustomLocation(),
      ...overrides
    };
  }

  /**
   * Complete applicant data object
   * NOTE: 'role' is optional - if not provided, a random role will be selected from available job postings
   */
  static generateApplicantData(overrides: Partial<ApplicantData> = {}): ApplicantData {
    const { role, ...restOverrides } = overrides;
    // Always generate all fields - never leave any field empty
    const defaultData: ApplicantData = {
      resumePath: 'test-resources/functionalsample.pdf',
      phone: this.generatePhoneNumber(),
      role: role, // Optional - if not provided, will be randomly selected from dropdown
      experienceYears: this.generateExperience(1, 10),
      experienceMonths: this.generateExperienceMonths(),
      noticePeriodMonths: this.generateNoticePeriodMonths(),
      noticePeriodDays: this.generateNoticePeriodDays(),
      currentSalary: this.generateSalary(5, 30),
      expectedSalary: this.generateSalary(10, 50),
      education: this.generateEducation(),
      workExperience: this.generateWorkExperience(),
      skills: this.generateSkillsString(),
      currency: 'INR' // Default currency
    };
    
    // Merge with overrides, but ensure no field is left empty
    const merged = { ...defaultData, ...restOverrides };
    
    // Ensure optional fields always have values
    if (!merged.education || merged.education.trim() === '') {
      merged.education = this.generateEducation();
    }
    if (!merged.workExperience || merged.workExperience.trim() === '') {
      merged.workExperience = this.generateWorkExperience();
    }
    if (!merged.skills || merged.skills.trim() === '') {
      merged.skills = this.generateSkillsString();
    }
    if (!merged.experienceMonths || merged.experienceMonths.trim() === '') {
      merged.experienceMonths = this.generateExperienceMonths();
    }
    if (!merged.noticePeriodDays || merged.noticePeriodDays.trim() === '') {
      merged.noticePeriodDays = this.generateNoticePeriodDays();
    }
    
    return merged;
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
  role?: string; // Optional - if not provided, will be randomly selected from available job postings
  experienceYears: string;
  experienceMonths?: string;
  noticePeriodMonths: string;
  noticePeriodDays?: string;
  currentSalary: string;
  expectedSalary: string;
  education?: string;
  workExperience?: string;
  skills?: string;
  currency?: string;
}
