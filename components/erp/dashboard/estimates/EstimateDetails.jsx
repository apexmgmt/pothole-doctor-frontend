"use client";

import React, { useState } from "react";
import { PlusIcon, EditIcon } from "lucide-react";
import CustomButton from "../../common/CustomButton";

const EstimateDetails = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      content:
        "We'd love to hear from you about our entire service. Your comments and suggestions will be highly appreciated. Please complete the form below.",
      author: "David warner",
      timestamp: "Jan 12, 11:25PM",
    },
    {
      id: 2,
      content:
        "We'd love to hear from you about our entire service. Your comments and suggestions will be highly appreciated. Please complete the form below.",
      author: "David warner",
      timestamp: "Jan 12, 11:25PM",
    },
  ]);

  const estimateData = {
    title: "The Pothole Doctors",
    type: "DWHHALLKJ",
    number: "1564",
    serviceType: "Repair",
    location: "708-D Fairground Rd, Lucasville, OH 45648",
    bidDate: "20-07-2025",
    expirationDate: "20-07-2025",
    customer: "Ethan Bennett",
    paymentTerms: "NET 15",
    estimator: "Ethan Bennett",
  };

  const handlePerformTakeOf = () => {
    console.log("Perform take-of clicked");
  };

  const handleAddNote = () => {
    console.log("Add note clicked");
  };

  const handleEditDetails = () => {
    console.log("Edit details clicked");
  };

  const handleNewProposal = () => {
    console.log("New proposal clicked");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-light">Estimate Details</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Proposal */}
        <div className="space-y-6">
          {/* Proposal Section */}
          <div className="bg-bg-2 rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-light">Proposal</h2>
              <CustomButton
                variant="outline"
                size="sm"
                onClick={handleNewProposal}
                className="flex items-center gap-2"
              >
                <PlusIcon size={16} />
                New
              </CustomButton>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-light font-medium mb-1">Test</h3>
                <p className="text-gray text-sm">Will sharp</p>
              </div>

              <div>
                <h3 className="text-light font-medium mb-1">Account-ending</h3>
                <p className="text-gray text-sm">In: 2025</p>
              </div>

              <div>
                <h3 className="text-light font-medium mb-1">Prepared by</h3>
                <p className="text-gray text-sm">David warner</p>
              </div>
            </div>

            {/* Proposal Working Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-light font-medium mb-4">Proposal Working</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-light">
                  $15.00
                </span>
                <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
                  In progress
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Map and Notes */}
        <div className="space-y-6 ">
          <div className="bg-bg-2 rounded-lg border border-border p-6">
            {/* Take-of Button */}
            <div className="flex justify-end">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={handlePerformTakeOf}
              >
                Perform take-of
              </CustomButton>
            </div>

            {/* Map Section */}
            <div className="overflow-hidden mt-6">
              <div className="h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8782.784250390601!2d-83.0002177820114!3d38.89692686989827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8846f12ce993ade5%3A0x6ab2286df4dd88ac!2s708%20Fairground%20Rd%20Unit%20D%2C%20Lucasville%2C%20OH%2045648%2C%20USA!5e0!3m2!1sen!2sbd!4v1756041339641!5m2!1sen!2sbd"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Estimate Location"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-bg-2 rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-gray"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-light">Notes</h3>
              <CustomButton
                variant="outline"
                size="sm"
                onClick={handleAddNote}
                className="ml-auto flex items-center gap-2"
              >
                <PlusIcon size={16} />
                Add
              </CustomButton>
            </div>

            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-bg-3 rounded-lg border border-border"
                >
                  <p className="text-light text-sm mb-3 leading-relaxed">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray">
                      Created bt{" "}
                      <span className="text-light">{note.author}</span>
                    </span>
                    <span className="text-gray">{note.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6 bg-bg-2 rounded-lg border border-border p-6">
          {/* Details Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-light">Details</h2>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleEditDetails}
              className="flex items-center gap-2"
            >
              <EditIcon size={16} />
              Edit
            </CustomButton>
          </div>

          {/* Details Content */}
          <div className="">
            <div className="space-y-4">
              <div>
                <h4 className="text-gray text-sm mb-1">Estimate title</h4>
                <p className="text-light">{estimateData.title}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Estimate type</h4>
                <p className="text-light">{estimateData.type}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Estimate number</h4>
                <p className="text-light">{estimateData.number}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Service type</h4>
                <p className="text-light">{estimateData.serviceType}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Estimate location</h4>
                <p className="text-light">{estimateData.location}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Select bid date</h4>
                <p className="text-light">{estimateData.bidDate}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Expiration date</h4>
                <p className="text-light">{estimateData.expirationDate}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Customer</h4>
                <p className="text-light">{estimateData.customer}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Payment terms</h4>
                <p className="text-light">{estimateData.paymentTerms}</p>
              </div>

              <div>
                <h4 className="text-gray text-sm mb-1">Assigned estimator</h4>
                <p className="text-light">{estimateData.estimator}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateDetails;
