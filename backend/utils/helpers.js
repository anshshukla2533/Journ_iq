/**
 * Utility functions for date/time operations and common helpers
 */

/**
 * Get a formatted timestamp string
 * @returns {string} Formatted timestamp
 */
export const getTimeStamp = () => {
    const now = new Date();
    return now.toISOString();
};

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get relative time string (e.g., "2 minutes ago", "1 hour ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return formatDate(then);
    } else if (days > 0) {
        return `${days}d ago`;
    } else if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return 'Just now';
    }
};

/**
 * Generate a conversation ID from two user IDs
 * @param {string} userId1 First user ID
 * @param {string} userId2 Second user ID
 * @returns {string} Sorted and concatenated user IDs
 */
export const generateConversationId = (userId1, userId2) => {
    return [userId1, userId2].sort().join(':');
};

/**
 * Truncate a string to a specified length
 * @param {string} str String to truncate
 * @param {number} length Maximum length
 * @returns {string} Truncated string with ellipsis if needed
 */
export const truncateString = (str, length = 50) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
};

/**
 * Extract file extension from a filename or path
 * @param {string} filename Filename or path
 * @returns {string} File extension without dot
 */
export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if a string is a valid URL
 * @param {string} str String to check
 * @returns {boolean} True if string is a valid URL
 */
export const isValidUrl = (str) => {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
};

/**
 * Format file size to human readable string
 * @param {number} bytes File size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a random string of specified length
 * @param {number} length Length of string to generate
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 * @param {*} value Value to check
 * @returns {boolean} True if value is empty
 */
export const isEmpty = (value) => {
    return (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    );
};

/**
 * Deep clone an object
 * @param {*} obj Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};