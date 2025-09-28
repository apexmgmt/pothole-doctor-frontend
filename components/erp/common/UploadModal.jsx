"use client";

import React, { useRef } from "react";

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileArray = Array.from(e.target.files);
      if (onUpload) {
        onUpload(fileArray);
      }
      onClose();
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-2 rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.0013 3.75V12.0833M10.0013 3.75C9.4178 3.75 8.32758 5.41192 7.91797 5.83333M10.0013 3.75C10.5848 3.75 11.6751 5.41192 12.0846 5.83333"
                stroke="#F4F4F5"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16.6654 13.75C16.6654 15.8183 16.2337 16.25 14.1654 16.25H5.83203C3.7637 16.25 3.33203 15.8183 3.33203 13.75"
                stroke="#F4F4F5"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <h2 className="text-lg font-medium text-white">Upload files</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div
            className="border border-dashed border-border rounded-lg p-7 text-center bg-border/40 cursor-pointer"
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleChange}
              className="hidden"
            />

            <div className="flex items-center justify-center gap-4">
              <svg
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5013 3.75V12.0833M10.5013 3.75C9.9178 3.75 8.82758 5.41192 8.41797 5.83333M10.5013 3.75C11.0848 3.75 12.1751 5.41192 12.5846 5.83333"
                  stroke="#A7A7AE"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M17.1654 13.75C17.1654 15.8183 16.7337 16.25 14.6654 16.25H6.33203C4.2637 16.25 3.83203 15.8183 3.83203 13.75"
                  stroke="#A7A7AE"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <p className="text-gray-300 text-lg">Choose your file</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
