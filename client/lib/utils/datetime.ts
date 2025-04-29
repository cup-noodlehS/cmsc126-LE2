/**
 * Converts an ISO date string or Date object to mm/dd/yyyy format
 * @param date - ISO date string or Date object
 * @returns formatted date string in mm/dd/yyyy format
 */
export function formatToMMDDYYYY(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    // Add leading zeros if needed and get components
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${month}/${day}/${year}`;
}

/**
 * Example usage:
 * formatToMMDDYYYY('2024-03-15T10:30:00Z') // returns "03/15/2024"
 * formatToMMDDYYYY(new Date()) // returns current date in mm/dd/yyyy format
 */

/**
 * Formats a given ISO 8601 datetime string to a readable date format.
 * Example:
 * Input: "2025-2-24T09:33:53.512Z"
 * Output: "Feb 24, 2025"
 *
 * @param {string} dateTimeString - The ISO 8601 datetime string to format.
 * @returns {string} - The formatted date string in "Mon DD, YYYY" format.
 */
export function formatDateTimeToReadableDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Formats a date to show elapsed time in a human-readable format (similar to YouTube)
 * Examples: "just now", "2 minutes ago", "3 hours ago", "5 days ago", "2 weeks ago", etc.
 *
 * @param date - ISO date string or Date object representing the past time
 * @returns formatted elapsed time string
 */
export function formatTimeElapsed(date: string | Date): string {
    const pastDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    // Get time difference in milliseconds
    const diffMs = now.getTime() - pastDate.getTime();

    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);

    // Less than a minute
    if (diffSec < 60) {
        return 'just now';
    }

    // Minutes (less than an hour)
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Hours (less than a day)
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Days (less than a week)
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }

    // Weeks (less than a month)
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
        return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Months (less than a year)
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    }

    // Years
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
}
