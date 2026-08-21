import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-4',
    large: 'w-16 h-16 border-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div
        className={`${sizeClasses[size]} border-t-indigo-500 border-r-transparent border-slate-200 dark:border-slate-700 rounded-full animate-spin`}
      />
      {text && <p className="text-slate-600 dark:text-slate-400 text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
