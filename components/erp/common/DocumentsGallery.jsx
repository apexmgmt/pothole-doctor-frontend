"use client";

import React, { useState } from "react";

import CustomButton from "./CustomButton";
import UploadModal from "./UploadModal";
import { ChevronUpIcon, ChevronDownIcon, DownloadIcon, PlusIcon, TrashIcon } from "@/public/icons";

const DocumentsGallery = ({ entityData, onUpload, onDownload, onDelete }) => {
  const [expandedSections, setExpandedSections] = useState({
    customerDocuments: true,
    l4561: false,
    jobDocuments: true,
    imageBefore: false,
    imageAfter: false,
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Sample document data organized by sections
  const documentSections = [
    {
      id: "customerDocuments",
      title: "customer Documents",
      documents: [
        {
          id: 1,
          name: "Fairground Rd. PNG",
          size: "206 KB",
          type: "image",
          thumbnail: "/images/fairground-rd.png", // You'll need to add these images
          url: "/documents/fairground-rd.png",
        },
        {
          id: 2,
          name: "Working. PDF",
          size: "206 KB",
          type: "pdf",
          thumbnail: null,
          url: "/documents/working.pdf",
        },
        {
          id: 3,
          name: "Road. PNG",
          size: "206 KB",
          type: "image",
          thumbnail: "/images/road.png",
          url: "/documents/road.png",
        },
      ],
    },
    {
      id: "l4561",
      title: "L-4561",
      documents: [
        {
          id: 4,
          name: "Contract. PDF",
          size: "150 KB",
          type: "pdf",
          thumbnail: null,
          url: "/documents/contract.pdf",
        },
      ],
    },
    {
      id: "jobDocuments",
      title: "Job Documents",
      documents: [
        {
          id: 5,
          name: "Working. PDF",
          size: "206 KB",
          type: "pdf",
          thumbnail: null,
          url: "/documents/working-job.pdf",
        },
        {
          id: 6,
          name: "Working. Zip",
          size: "206 KB",
          type: "zip",
          thumbnail: null,
          url: "/documents/working.zip",
        },
        {
          id: 7,
          name: "Working. PDF",
          size: "206 KB",
          type: "pdf",
          thumbnail: null,
          url: "/documents/working-final.pdf",
        },
      ],
    },
    {
      id: "imageBefore",
      title: "Image Before",
      documents: [
        {
          id: 8,
          name: "Before. PNG",
          size: "180 KB",
          type: "image",
          thumbnail: "/images/before.png",
          url: "/documents/before.png",
        },
      ],
    },
    {
      id: "imageAfter",
      title: "Image After",
      documents: [
        {
          id: 9,
          name: "After. PNG",
          size: "195 KB",
          type: "image",
          thumbnail: "/images/after.png",
          url: "/documents/after.png",
        },
      ],
    },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return (
          <div className="w-full h-24 bg-red-100 rounded-lg flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 13H8"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17H8"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 9H8"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "zip":
        return (
          <div className="w-full h-24 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12L10 10L12 12L10 14L8 12Z"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "image":
        return (
          <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
                stroke="#6B7280"
                strokeWidth="2"
              />
              <circle
                cx="8.5"
                cy="8.5"
                r="1.5"
                stroke="#6B7280"
                strokeWidth="2"
              />
              <polyline
                points="21,15 16,10 5,21"
                stroke="#6B7280"
                strokeWidth="2"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadFiles = (files) => {
    if (onUpload) {
      onUpload(files);
    } else {
      console.log("Upload files:", files);
    }
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleDownload = (document) => {
    if (onDownload) {
      onDownload(document);
    } else {
      console.log("Download document:", document);
    }
  };

  const handleDelete = (document) => {
    if (onDelete) {
      onDelete(document);
    } else {
      console.log("Delete document:", document);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-light">
          {entityData?.name || "Customer"} Documents
        </h3>
        <CustomButton
          variant="primary"
          size="sm"
          icon={PlusIcon}
          onClick={handleUploadClick}
        >
          Upload
        </CustomButton>
      </div>

      {/* Document Sections */}
      <div className="space-y-4">
        {documentSections.map((section) => (
          <div
            key={section.id}
            className="bg-bg-2 rounded-lg border border-border"
          >
            {/* Section Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg/20 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <h4 className="text-base font-medium text-light">
                {section.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray">
                  {section.documents.length} files
                </span>
                {expandedSections[section.id] ? (
                  <ChevronUpIcon className="w-4 h-4 text-gray" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-gray" />
                )}
              </div>
            </div>

            {/* Section Content */}
            {expandedSections[section.id] && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.documents.map((document) => (
                    <div key={document.id} className="group relative">
                      {/* Document Card */}
                      <div className="bg-bg rounded-lg border border-border p-3 hover:border-primary/50 transition-colors">
                        {/* Thumbnail/Icon */}
                        <div className="mb-3">
                          {document.thumbnail ? (
                            <div className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={document.thumbnail}
                                alt={document.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div className="w-full h-full bg-gray-200 rounded-lg items-center justify-center hidden">
                                {getFileIcon(document.type)}
                              </div>
                            </div>
                          ) : (
                            getFileIcon(document.type)
                          )}
                        </div>

                        {/* Document Info */}
                        <div className="space-y-1">
                          <h5
                            className="text-sm font-medium text-light truncate"
                            title={document.name}
                          >
                            {document.name}
                          </h5>
                          <p className="text-xs text-gray">{document.size}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(document);
                              }}
                              className="w-6 h-6 bg-bg-2 border border-border rounded flex items-center justify-center hover:bg-primary/20 transition-colors"
                              title="Download"
                            >
                              <DownloadIcon className="w-3 h-3 text-light" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(document);
                              }}
                              className="w-6 h-6 bg-bg-2 border border-border rounded flex items-center justify-center hover:bg-red-500/20 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-3 h-3 text-light" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseModal}
        onUpload={handleUploadFiles}
      />
    </div>
  );
};

export default DocumentsGallery;
