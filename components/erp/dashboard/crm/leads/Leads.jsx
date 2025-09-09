"use client";

import React, { useState } from "react";
import CommonLayout from "../CommonLayout";
import CustomTable from "../../../common/CustomTable";
import {
  DetailsIcon,
  FilterIcon,
  LeadIcon,
  PlusIcon,
} from "@/public/icons/icons";

const Leads = () => {
  const [activeTab, setActiveTab] = useState("lead");
  const [selectedRows, setSelectedRows] = useState([]);

  // Sample lead data based on the image
  const leadsData = [
    {
      id: "001545464",
      name: "Pothole Doctors",
      phone: "(740) 330-5155",
      company: "The Pothole Doctors",
      email: "todd@potholedoctors.com",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      leadSource: "Repair",
      stage: "Open",
    },
    {
      id: "001545464",
      name: "Pothole Doctors",
      phone: "(740) 330-5155",
      company: "The Pothole Doctors",
      email: "todd@potholedoctors.com",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      leadSource: "Repair",
      stage: "Prospect",
    },
    {
      id: "001545464",
      name: "Pothole Doctors",
      phone: "(740) 330-5155",
      company: "The Pothole Doctors",
      email: "todd@potholedoctors.com",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      leadSource: "Repair",
      stage: "Working",
    },
    {
      id: "001545464",
      name: "Pothole Doctors",
      phone: "(740) 330-5155",
      company: "The Pothole Doctors",
      email: "todd@potholedoctors.com",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      leadSource: "Repair",
      stage: "Closed-Won",
    },
    {
      id: "001545464",
      name: "Pothole Doctors",
      phone: "(740) 330-5155",
      company: "The Pothole Doctors",
      email: "todd@potholedoctors.com",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      leadSource: "Repair",
      stage: "Meeting Set",
    },
    {
      id: "001545464",
      name: "Pothole Doctors",
      phone: "(740) 330-5155",
      company: "The Pothole Doctors",
      email: "todd@potholedoctors.com",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      leadSource: "Repair",
      stage: "Open",
    },
  ];

  // Column definitions for the leads table
  const leadColumns = [
    {
      key: "checkbox",
      label: "",
      conditional: () => true,
    },
    { key: "id", label: "ID#", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "jobAddress", label: "Job Address", sortable: true },
    { key: "leadSource", label: "Lead Source", sortable: true },
    { key: "stage", label: "Stage", sortable: true },
    {
      key: "actions",
      label: "Actions",
      conditional: () => true,
    },
  ];

  // Action buttons for the table
  const actionButtons = [
    {
      label: "Filter",
      action: "filter",
      variant: "secondary",
      icon: FilterIcon,
    },
    {
      label: "Add Lead",
      action: "add_lead",
      variant: "primary",
      icon: PlusIcon,
    },
  ];

  // Custom cell renderer for stage column
  const renderStageCell = (row, column, value) => {
    if (column.key === "stage") {
      const stageColors = {
        Open: "bg-green-500/20 text-green-400",
        Prospect: "bg-gray-500/20 text-gray-400",
        Working: "bg-orange-500/20 text-orange-400",
        "Closed-Won": "bg-red-500/20 text-red-400",
        "Meeting Set": "bg-blue-500/20 text-blue-400",
      };

      return (
        <span
          className={`px-2 py-1.5 rounded-md text-xs font-medium ${
            stageColors[value] || "bg-gray-500/20 text-gray-400"
          }`}
        >
          {value}
        </span>
      );
    }
    return value;
  };

  // Custom actions renderer
  const renderLeadActions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("View lead:", row);
        }}
        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-colors"
        title="View"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("Edit lead:", row);
        }}
        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-md transition-colors"
        title="Edit"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    </div>
  );

  // Event handlers
  const handleActionButtonClick = (action) => {
    console.log("Action clicked:", action);
    switch (action) {
      case "filter":
        console.log("Opening filter modal...");
        break;
      case "add_lead":
        console.log("Opening add lead form...");
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleSearch = (data, searchTerm) => {
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const handleSort = (data, column, direction) => {
    return [...data].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleRowClick = (row) => {
    console.log("Row clicked:", row);
  };

  const handleRowSelectionChange = (selectedIds) => {
    setSelectedRows(selectedIds);
    console.log("Selected rows:", selectedIds);
  };

  const handleExport = (format, data) => {
    console.log(`Exporting ${format}:`, data);
  };

  // Button configuration for CommonLayout
  const buttons = [
    {
      label: "Lead",
      icon: LeadIcon,
      onClick: () => setActiveTab("lead"),
      isActive: activeTab === "lead",
    },
    {
      label: "Details",
      icon: DetailsIcon,
      onClick: () => setActiveTab("details"),
      isActive: activeTab === "details",
    },
  ];

  return (
    <CommonLayout title="Lead" buttons={buttons} className="mb-6">
      {activeTab === "lead" && (
        <CustomTable
          data={leadsData}
          columns={leadColumns}
          actionButtons={actionButtons}
          onActionButtonClick={handleActionButtonClick}
          onSearch={handleSearch}
          onSort={handleSort}
          onRowClick={handleRowClick}
          onRowSelectionChange={handleRowSelectionChange}
          selectedRows={selectedRows}
          renderCell={renderStageCell}
          renderActions={renderLeadActions}
          showRowNumbers={false}
          stickyHeader={true}
          maxHeight={400}
          searchPlaceholder="Search leads..."
          showExport={false}
          showPagination={true}
          pageSize={10}
          emptyMessage="No leads found"
        />
      )}

      {activeTab === "details" && (
        <div className="text-light">
          <p>Lead details view content goes here...</p>
          {/* Add your details-specific content */}
        </div>
      )}
    </CommonLayout>
  );
};

export default Leads;
