/**
 * Date utility functions for safe date handling across the application
 */

/**
 * Safely formats a date with error handling
 * @param date - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string or fallback message
 */
export function formatDate(
  date: string | Date | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) {
    return 'N/A';
  }

  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided:', date);
      return 'Invalid Date';
    }

    // Default formatting options
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return dateObj.toLocaleDateString('en-US', options || defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Safely formats a date with time
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date and time string or fallback message
 */
export function formatDateTime(
  date: string | Date | number | null | undefined
): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Checks if a date is valid
 * @param date - Date to validate
 * @returns boolean indicating if date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Formats a date for display in a short format
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted short date string
 */
export function formatShortDate(
  date: string | Date | number | null | undefined
): string {
  return formatDate(date, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculates relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string
 */
export function getRelativeTime(
  date: string | Date | number | null | undefined
): string {
  if (!date || !isValidDate(date)) {
    return 'Unknown';
  }

  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown';
  }
}

/**
 * Parses and validates a date input
 * @param dateInput - Date input to parse
 * @returns Date object or null if invalid
 */
export function parseDate(
  dateInput: string | Date | number | null | undefined
): Date | null {
  if (!dateInput) return null;

  try {
    const dateObj = new Date(dateInput);
    return isNaN(dateObj.getTime()) ? null : dateObj;
  } catch {
    return null;
  }
}

/**
 * Formats date for CSV export
 * @param date - Date to format
 * @returns ISO date string or empty string
 */
export function formatDateForExport(
  date: string | Date | number | null | undefined
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  try {
    return parsedDate.toISOString().split('T')[0];
  } catch {
    return '';
  }
}
