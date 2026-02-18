import React from "react";

/**
 * Reusable Loading spinner component
 * @param {string} message - Optional loading message (default: "Loading...")
 * @param {string} className - Additional CSS classes
 */
const Loading = ({ message = "Loading...", className = "" }) => {
  return (
    <div
      className={`flex flex-col justify-center items-center py-12 ${className}`}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-lg text-gray-500">{message}</p>
    </div>
  );
};

export default Loading;
