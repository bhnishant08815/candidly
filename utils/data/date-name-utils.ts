/**
 * Date and Name Utility Functions
 * Provides comprehensive date formatting, manipulation, and unique name generation utilities
 */

// Internal state for name generation (module-level to persist across calls)
let nameCounter: Record<string, number> = {};

/**
 * Generates unique names with numerical suffixes and worker index.
 * Thread-safe for parallel test execution.
 *
 * @param {...string} prefixes - Prefixes of the objects (e.g., 'Site', 'Approver Card').
 * @returns {string[]} - An array of unique object names with the specified prefixes and numerical suffixes.
 */
export function generateUniqueNames(...prefixes: string[]): string[] {
    return prefixes.map(prefix => {
        if (!nameCounter[prefix]) {
            nameCounter[prefix] = 1;
        }
        const workerIndex = process.env.TEST_WORKER_INDEX || '0';
        const count = nameCounter[prefix]++;
        const uniqueNumber = Date.now().toString();
        const last7Digit = uniqueNumber.slice(-7);
        const name = `${prefix} - ${count} - ${last7Digit} - ${workerIndex}`;

        return name;
    });
}

/**
 * Resets the name counter (useful for test cleanup or isolation).
 */
export function resetNameCounter(): void {
    nameCounter = {};
}

/**
 * Generates a unique ID using crypto API (more secure than random).
 *
 * @param {number} [idLength=8] - Length of the unique ID.
 * @returns {string} - A unique ID.
 */
export function generateUniqueId(idLength: number = 8): string {
    // Use crypto for better randomness (available in Node.js)
    const array = new Uint8Array(idLength);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, idLength);
}

/**
 * Generates a unique alphabetic ID using crypto API (only letters, no numbers).
 * Useful for names that must start and end with letters.
 *
 * @param {number} [idLength=6] - Length of the unique ID.
 * @returns {string} - A unique alphabetic ID (only a-z, A-Z).
 */
export function generateAlphabeticUniqueId(idLength: number = 6): string {
    // Use crypto for better randomness (available in Node.js)
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const array = new Uint8Array(idLength);
    crypto.getRandomValues(array);
    return Array.from(array, byte => alphabet[byte % alphabet.length]).join('');
}

/**
 * Returns today's date in MM/DD/YYYY format with optional offsets.
 * 
 * @param yearsOffset - The number of years to offset the date by. Default is 0.
 * @param monthsOffset - The number of months to offset the date by. Default is 0.
 * @returns The date in the format "MM/DD/YYYY".
 */
export function getDateMMDDYYYY(yearsOffset: number = 0, monthsOffset: number = 0): string {
    const today = new Date();
    const adjustedDate = new Date(
        today.getFullYear() + yearsOffset,
        today.getMonth() + monthsOffset,
        today.getDate()
    );

    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const year = adjustedDate.getFullYear();

    return `${month}/${day}/${year}`;
}

/**
 * Returns a formatted date string in "MM/DD/YYYY hh:mm AM/PM" format with optional day offset.
 * 
 * @param {string} baseDate - The base date string (e.g., "2025-04-30T08:00:00" or any valid date format).
 * @param {number} [dayOffset=0] - Number of days to offset the base date.
 * @returns {string} Formatted date in "MM/DD/YYYY hh:mm AM/PM" format.
 * @throws {Error} If the base date is invalid.
 */
export function getFormattedDate(baseDate: string, dayOffset: number = 0): string {
    const date = new Date(baseDate);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid base date: "${baseDate}".`);
    }

    date.setDate(date.getDate() + dayOffset);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return `${month}/${day}/${year} ${time}`;
}

/**
 * Returns random string with defined length.
 * 
 * @param length - Length of the random string.
 * @returns A random alphanumeric string.
 */
export function generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Formats a Date object to an ISO string (YYYY-MM-DD).
 * 
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Converts a date string in the format "MM/DD/YYYY" to the Salesforce date format "YYYY-MM-DD".
 *
 * @param date - The date string to convert.
 * @returns The converted date string in the Salesforce date format.
 * @throws {Error} If the date format is invalid.
 */
export function convertToSalesforceDate(date: string): string {
    const parts = date.split('/');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: "${date}". Expected MM/DD/YYYY.`);
    }
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Formats a time string to a specific format (HH:mm:ss.000Z).
 * 
 * @param time - The time string to format (e.g., "2:30 PM").
 * @returns The formatted time string.
 * @throws {Error} If the time format is invalid.
 */
export function formatTime(time: string): string {
    const parts = time.split(' ');
    if (parts.length !== 2) {
        throw new Error(`Invalid time format: "${time}". Expected format: "HH:mm AM/PM".`);
    }
    
    const [hourMinute, period] = parts;
    const [hours, minutes] = hourMinute.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
        throw new Error(`Invalid time format: "${time}".`);
    }

    let adjustedHours = hours;
    if (period === 'PM' && hours < 12) adjustedHours += 12;
    if (period === 'AM' && hours === 12) adjustedHours = 0;

    return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;
}

/**
 * Generates a random date and time string in the format "MM/DD/YYYY HH:mm AM/PM".
 * The date and time are randomly generated within the current day.
 * 
 * @returns {string} A random date and time string formatted as "MM/DD/YYYY HH:mm AM/PM".
 */
export function getRandomDateTime(): string {
    const randomDate = new Date();
    randomDate.setHours(Math.floor(Math.random() * 12) + 1);
    randomDate.setMinutes(Math.floor(Math.random() * 60));

    const month = String(randomDate.getMonth() + 1).padStart(2, '0');
    const day = String(randomDate.getDate()).padStart(2, '0');
    const year = randomDate.getFullYear();
    let hours = randomDate.getHours();
    const minutes = String(randomDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

/**
 * Utility to format a date string to match the "MM/DD/YY HH:mm AM/PM" format.
 * 
 * @param dateTime - The date string in "MM/DD/YYYY HH:mm AM/PM" format.
 * @returns The formatted date string in "MM/DD/YY HH:mm AM/PM" format.
 */
export function formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: "${dateTime}".`);
    }

    // Use Intl.DateTimeFormat to format the date and time
    const formatter = new Intl.DateTimeFormat('en-US', {
        year: '2-digit', // Use 2-digit year (i.e., '25' for '2025')
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true, // Ensures AM/PM format
    });

    // Format the date and time and remove any commas
    return formatter.format(date).replace(',', '');
}

/**
 * Checks if a date string (YYYY-MM-DD) is older than or equal to today.
 * 
 * @param dateStr - Date string in YYYY-MM-DD format.
 * @returns {boolean} True if the date is today or in the past.
 */
export function isDateOlderOrEqualToToday(dateStr: string): boolean {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    
    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    
    // Create date from input
    const inputDate = new Date(year, month - 1, day); // JS months are 0-based
    if (isNaN(inputDate.getTime())) return false;
    
    // Get today's date (set time to 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= today;
}

/**
 * Parses a date string in MM/DD/YYYY or DD/MM/YYYY format,
 * and returns the day, full month name, and year.
 *
 * @param dateStr - A string representing a date (e.g., "05/06/2025")
 * @param format - The format of the input string: "MM/DD/YYYY" or "DD/MM/YYYY"
 * @returns An object with day, month (full name), and year as strings
 * @throws Error if input is null, undefined, or in an invalid format
 */
export function formatToAbbreviatedDate(
    dateStr: string | null | undefined,
    format: 'MM/DD/YYYY' | 'DD/MM/YYYY'
): { day: string; month: string; year: string } {
    // Validate input presence
    if (!dateStr || typeof dateStr !== 'string') {
        throw new Error('Invalid input: date string is null, undefined, or not a string.');
    }
    
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: "${dateStr}". Expected MM/DD/YYYY or DD/MM/YYYY.`);
    }
    
    const [part1, part2, yearStr] = parts;
    const [monthStr, dayStr] = format === 'MM/DD/YYYY' ? [part1, part2] : [part2, part1];
    const monthNumber = parseInt(monthStr, 10);
    
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        throw new Error(`Invalid month: "${monthStr}" is not between 01 and 12.`);
    }
    
    const monthName = new Date(0, monthNumber - 1).toLocaleString('default', { month: 'long' });

    return {
        day: dayStr.padStart(2, '0'),
        month: monthName,
        year: yearStr
    };
}

/**
 * Gets the list of future dates that fall on a specific weekday, repeating weekly.
 * 
 * @param startDate - The starting date as a `Date` object or a date string (e.g., "2025-06-18").
 * @param targetWeekday - The day of the week to generate dates for. Must be a number from 0 to 6, where:
 *   0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
 * @param count - The number of weekly dates to generate.
 * @returns An array of date strings in "YYYY-MM-DD" format.
 * @throws {Error} If the date input is invalid or targetWeekday is out of range.
 */
export function getWeeklyDates(
    startDate: string | Date,
    targetWeekday: number,
    count: number
): string[] {
    if (targetWeekday < 0 || targetWeekday > 6) {
        throw new Error(`Invalid targetWeekday: ${targetWeekday}. Must be between 0 and 6.`);
    }
    
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    if (isNaN(start.getTime())) {
        throw new Error('Invalid date input');
    }

    const dates: string[] = [];
    const currentDay = start.getUTCDay();
    const offset = (targetWeekday - currentDay + 7) % 7 || 7;

    const firstDate = new Date(start);
    firstDate.setUTCDate(start.getUTCDate() + offset);

    for (let i = 0; i < count; i++) {
        const date = new Date(firstDate);
        date.setUTCDate(firstDate.getUTCDate() + i * 7);
        dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }

    return dates;
}

