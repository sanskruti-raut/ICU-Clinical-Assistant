import React from 'react';

const StatusBadge = ({ status, className, size = 'md' }) => {
  let baseClasses = 'inline-flex items-center rounded-full font-medium';
  
  // Size variations
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  // Status variations
  const statusClasses = {
    // Risk levels
    critical: 'bg-red-100 text-red-800',
    high: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
    normal: 'bg-green-100 text-green-800',
    
    // Alert types
    'HR critical': 'bg-red-100 text-red-800',
    'Sepsis risk > 80%': 'bg-red-100 text-red-800',
    'BP Low': 'bg-yellow-100 text-yellow-800',
    'RR Elevated': 'bg-yellow-100 text-yellow-800',
    
    // Status types
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    acknowledged: 'bg-green-100 text-green-800',
    unacknowledged: 'bg-red-100 text-red-800',
    
    // Generic
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };
  
  // Determine status class based on sepsis score if it's a number
  let statusClass;
  if (typeof status === 'number') {
    if (status >= 80) {
      statusClass = statusClasses.critical;
    } else if (status >= 60) {
      statusClass = statusClasses.warning;
    } else {
      statusClass = statusClasses.normal;
    }
  } else {
    // Convert status to lowercase for consistent matching
    const statusLower = typeof status === 'string' ? status.toLowerCase() : 'default';
    statusClass = statusClasses[status] || statusClasses[statusLower] || statusClasses.default;
  }
  
  // Combine classes
  const combinedClasses = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    statusClass,
    className
  ].filter(Boolean).join(' ');
  
  // Display formatted sepsis score if status is a number
  const displayValue = typeof status === 'number' ? `${status}%` : status;
  
  return (
    <span className={combinedClasses}>
      {displayValue}
    </span>
  );
};

export default StatusBadge;