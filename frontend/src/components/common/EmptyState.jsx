import React from "react";

/**
 * Reusable Empty state component for when data arrays are empty
 * @param {string} title - Main empty state message
 * @param {string} description - Optional description/hint
 * @param {string} icon - Optional emoji/icon (default: "📭")
 * @param {React.ReactNode} action - Optional action button
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({
  title = "No records found",
  description = "",
  icon = "📭",
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-center max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
