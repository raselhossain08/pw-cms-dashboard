/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format date to YYYY-MM-DD format
 * @param date - Date string, Date object, or undefined
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDateToYYYYMMDD(date: string | Date | undefined | null): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return "N/A";
  }
}

/**
 * Format date to a human-readable format (e.g., "Jan 15, 2024")
 * @param date - Date string, Date object, or undefined
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDateToReadable(date: string | Date | undefined | null): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "N/A";
  }
}

/**
 * Format date with time (e.g., "Jan 15, 2024 at 3:45 PM")
 * @param date - Date string, Date object, or undefined
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDateTimeToReadable(date: string | Date | undefined | null): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "N/A";
  }
}

/**
 * Calculate time difference from now (e.g., "2 days ago", "in 3 hours")
 * @param date - Date string, Date object, or undefined
 * @returns Relative time string or "N/A" if invalid
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      // Future date
      const absDiff = Math.abs(diffInSeconds);
      if (absDiff < 60) return "in a few seconds";
      if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
      if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
      if (absDiff < 2592000) return `in ${Math.floor(absDiff / 86400)} days`;
      return formatDateToReadable(dateObj);
    }
    
    // Past date
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDateToReadable(dateObj);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return "N/A";
  }
}

/**
 * Check if a date is valid
 * @param date - Date string, Date object, or undefined
 * @returns true if date is valid, false otherwise
 */
export function isValidDate(date: string | Date | undefined | null): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param date - Date string, Date object, or undefined
 * @returns Formatted date string for input fields or empty string if invalid
 */
export function formatDateForInput(date: string | Date | undefined | null): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    return formatDateToYYYYMMDD(dateObj);
  } catch (error) {
    return "";
  }
}
