import React from "react";

/**
 * Reusable Error message component - ONLY for actual server/network errors
 * Should NOT be used for empty data states
 * @param {string} message - The error message to display
 * @param {function} onRetry - Optional retry callback
 * @param {string} className - Additional CSS classes
 */
const ErrorMessage = ({ message, onRetry, className = "" }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between ${className}`}
    >
      <div className="flex items-center">
        <span className="mr-2">⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm ml-4"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
