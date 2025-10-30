"use client";

import React from "react";

/**
 * CommonLayout - A reusable component for section headers with dynamic title and buttons
 *
 * @param {Object} props
 * @param {string} props.title - The main title for the section
 * @param {Array} props.buttons - Array of button objects with label, icon, onClick, and isActive properties
 * @param {string} props.className - Additional CSS classes for the container
 * @param {React.ReactNode} props.children - Content to render below the header
 */

const CommonLayout = ({ title, buttons = [], className = "", children }) => {
  return (
    <div className={`bg-bg-2 rounded-lg border border-border p-5 ${className}`}>
      {/* Header Section */}
      <div className="pb-4 border-b border-border">
        {/* Title */}
        <h2 className="text-xl font-semibold text-light mb-4">{title}</h2>

        {/* Switcher Buttons */}
        {buttons.length > 0 && (
          <div className="">
            <div className="inline-flex bg-border/40 border border-border rounded-lg p-1 gap-1">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 cursor-pointer ${button.isActive
                    ? "bg-light/20 text-light shadow-sm"
                    : "text-gray hover:text-light hover:bg-light/5"
                    }`}
                >
                  {button.icon && (
                    <button.icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{button.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="">{children}</div>
    </div>
  );
};

export default CommonLayout;
