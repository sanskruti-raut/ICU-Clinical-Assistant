/**
 * Utility functions for formatting dates, times, and values
 */

/**
 * Format a date string to a more readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (e.g., "Apr 17, 2025, 2:30 PM")
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  /**
   * Format a date string to show time since that date
   * @param {string} dateString - ISO date string
   * @returns {string} Time elapsed since the date (e.g., "5m ago", "2h 30m ago")
   */
  export const formatTimeSince = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      
      // Convert to minutes
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 1) {
        return 'Just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
      } else {
        const days = Math.floor(diffMinutes / 1440);
        return `${days}d ago`;
      }
    } catch (error) {
      console.error('Error calculating time since:', error);
      return dateString;
    }
  };
  
  /**
   * Format a number with commas for thousands
   * @param {number} value - Number to format
   * @returns {string} Formatted number with commas
   */
  export const formatNumber = (value) => {
    if (value === undefined || value === null) return 'N/A';
    
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  /**
   * Format a decimal value to a specified number of decimal places
   * @param {number} value - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted decimal number
   */
  export const formatDecimal = (value, decimals = 1) => {
    if (value === undefined || value === null) return 'N/A';
    
    return Number(value).toFixed(decimals);
  };
  
  /**
   * Format a percentage value
   * @param {number} value - Number to format as percentage
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  export const formatPercentage = (value, decimals = 0) => {
    if (value === undefined || value === null) return 'N/A';
    
    return `${Number(value).toFixed(decimals)}%`;
  };
  
  /**
   * Format a duration in milliseconds to a readable format
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration (e.g., "2d 5h 30m")
   */
  export const formatDuration = (ms) => {
    if (ms === undefined || ms === null) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };
  
  /**
   * Format a value with appropriate units
   * @param {number} value - Value to format
   * @param {string} unit - Unit of measurement
   * @returns {string} Formatted value with unit
   */
  export const formatWithUnit = (value, unit) => {
    if (value === undefined || value === null) return 'N/A';
    
    return `${value} ${unit}`;
  };
  
  /**
   * Truncate text to a specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated text with ellipsis if needed
   */
  export const truncateText = (text, length = 50) => {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return `${text.substring(0, length)}...`;
  };
  
  export default {
    formatDateTime,
    formatTimeSince,
    formatNumber,
    formatDecimal,
    formatPercentage,
    formatDuration,
    formatWithUnit,
    truncateText
  };