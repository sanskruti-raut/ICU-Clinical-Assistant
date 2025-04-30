import React from 'react';

const Card = ({ 
  title, 
  children, 
  className = '', 
  titleClassName = '',
  contentClassName = '',
  icon,
  headerAction
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {icon && <span className="text-gray-500">{icon}</span>}
            <h3 className={`font-medium text-gray-700 ${titleClassName}`}>{title}</h3>
          </div>
          {headerAction && (
            <div className="flex items-center">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={`p-4 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;