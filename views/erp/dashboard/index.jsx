"use client";

import React, { useState } from "react";
// import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import CustomTable from "@/components/erp/common/CustomTable";

const DashboardIndex = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample data - Customers table
  const customersData = [
    {
      id: "001545464",
      name: "Ethan Bennett",
      company: "The Pothole Doctors",
      email: "service@potholedoctors.com",
      address: "708-D Fairground Rd, Lucasville, OH 45648",
      dateCreated: "20-07-2025",
      status: "Active",
    },
    {
      id: "001545465",
      name: "Sarah Johnson",
      company: "Road Repair Co",
      email: "sarah@roadrepair.com",
      address: "123 Main St, Columbus, OH 43215",
      dateCreated: "19-07-2025",
      status: "Pending",
    },
    {
      id: "001545466",
      name: "Mike Wilson",
      company: "Asphalt Solutions",
      email: "mike@asphalt.com",
      address: "456 Oak Ave, Cincinnati, OH 45202",
      dateCreated: "18-07-2025",
      status: "Inactive",
    },
  ];

  // Sample data - Jobs table
  const jobsData = [
    {
      id: "00256456",
      wo: "00256456",
      jobName: "The Pothole Doctors",
      date: "17-07-2025",
      service: "Repair",
      jobType: "Physical",
      materialOrdered: "124",
      status: "In Progress",
    },
    {
      id: "00256457",
      wo: "00256457",
      jobName: "Highway Maintenance",
      date: "16-07-2025",
      service: "Maintenance",
      jobType: "Routine",
      materialOrdered: "89",
      status: "Completed",
    },
    {
      id: "00256458",
      wo: "00256458",
      jobName: "Street Patching",
      date: "15-07-2025",
      service: "Patching",
      jobType: "Emergency",
      materialOrdered: "156",
      status: "Scheduled",
    },
  ];

  // Column definitions for Customers table
  const customerColumns = [
    {
      key: "checkbox",
      label: "",
      conditional: () => true, // Always show checkbox for this example
    },
    { key: "id", label: "Account", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: false },
    { key: "dateCreated", label: "Date Created", sortable: true },
    { key: "status", label: "Status", sortable: true },
    {
      key: "actions",
      label: "Actions",
      conditional: () => true,
    },
  ];

  // Column definitions for Jobs table
  const jobColumns = [
    {
      key: "checkbox",
      label: "",
      conditional: () => true, // Always show checkbox for this example
    },
    { key: "wo", label: "WO", sortable: true },
    { key: "jobName", label: "Job Name", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "service", label: "Service", sortable: true },
    { key: "jobType", label: "Job Type", sortable: true },
    { key: "materialOrdered", label: "Material Ordered", sortable: true },
    { key: "status", label: "Status", sortable: true },
    {
      key: "actions",
      label: "Actions",
      conditional: () => true,
    },
  ];

  // Action buttons for Customers table
  const customerActionButtons = [
    {
      label: "+ Add Customer",
      action: "add_customer",
      variant: "primary",
      // icon: PlusIcon,
    },
  ];

  // Action buttons for Jobs table
  const jobActionButtons = [
    {
      label: "Filter",
      action: "filter_jobs",
      variant: "secondary",
    },
    {
      label: "+ Add Job",
      action: "add_job",
      variant: "primary",
      // icon: PlusIcon,
    },
  ];

  // Custom cell renderer for status
  const renderStatusCell = (row, column, value) => {
    if (column.key === "status") {
      const statusColors = {
        Active: "text-green-500",
        Pending: "text-gray",
        Inactive: "text-red-500",
        "In Progress": "text-orange-500",
        Completed: "text-green-600",
        Scheduled: "text-blue-500",
      };

      return (
        <span
          className={`px-2 py-1.5 rounded-md text-xs font-medium bg-border/40 ${
            statusColors[value] || "text-gray-500"
          }`}
        >
          {value}
        </span>
      );
    }
    return value;
  };

  // Custom actions renderer for Customers table
  const renderCustomerActions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("Edit customer:", row);
        }}
        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-colors"
        title="Edit"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("Delete customer:", row);
        }}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
        title="Delete"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );

  // Custom actions renderer for Jobs table
  const renderJobActions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("View job details:", row);
        }}
        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-colors"
        title="View"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
          console.log("Edit job:", row);
        }}
        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-md transition-colors"
        title="Edit"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
  const handleActionButtonClick = (action, row = null) => {
    console.log("Action clicked:", action, row);

    switch (action) {
      case "add_customer":
        console.log("Adding new customer...");
        break;
      case "add_job":
        console.log("Adding new job...");
        break;
      case "filter_jobs":
        console.log("Filtering jobs...");
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleExport = (format, data) => {
    console.log(`Exporting ${format}:`, data);
    // Implement your export logic here
  };

  // Custom export options with conditionals
  const customExportOptions = [
    {
      label: "Excel",
      value: "Excel",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      conditional: () => true, // Always show Excel export
    },
    {
      label: "PDF",
      value: "PDF",
      icon: (
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
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      conditional: () => false, // Hide PDF export for this example
    },
  ];

  // Jobs table export options - different conditionals
  const jobsExportOptions = [
    {
      label: "Excel",
      value: "Excel",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      conditional: () => true, // Always show Excel export
    },
    {
      label: "PDF",
      value: "PDF",
      icon: (
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
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      conditional: () => true, // Show PDF export for jobs table
    },
  ];

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

  return (
    <div className="p-6 space-y-4">
      {/* <h1 className="text-2xl font-bold text-light">Table Examples</h1> */}

      {/* Customers Table */}
      <div>
        <h2 className="text-xl font-semibold text-light mb-4">
          Customers Table
        </h2>
        <CustomTable
          data={customersData}
          columns={customerColumns}
          actionButtons={customerActionButtons}
          onActionButtonClick={handleActionButtonClick}
          onExport={handleExport}
          exportOptions={customExportOptions}
          onSearch={handleSearch}
          onSort={handleSort}
          onRowClick={handleRowClick}
          onRowSelectionChange={handleRowSelectionChange}
          selectedRows={selectedRows}
          renderCell={renderStatusCell}
          renderActions={renderCustomerActions}
          showRowNumbers={false}
          stickyHeader={true}
          maxHeight={400}
          className="mb-6"
        />
      </div>

      {/* Jobs Table */}
      <div>
        <h2 className="text-xl font-semibold text-light mb-4">Jobs Table</h2>
        <CustomTable
          data={jobsData}
          columns={jobColumns}
          actionButtons={jobActionButtons}
          onActionButtonClick={handleActionButtonClick}
          onExport={handleExport}
          exportOptions={jobsExportOptions}
          onSearch={handleSearch}
          onSort={handleSort}
          onRowClick={handleRowClick}
          renderCell={renderStatusCell}
          renderActions={renderJobActions}
          showRowNumbers={false}
          stickyHeader={true}
          maxHeight={400}
          className="mb-6"
        />
      </div>

      {/* Minimal Table Example */}
      <div>
        <h2 className="text-xl font-semibold text-light mb-4">Minimal Table</h2>
        <CustomTable
          data={customersData.slice(0, 2)}
          columns={customerColumns.slice(0, 3)}
          showSearch={false}
          showExport={false}
          showPagination={false}
          showRowSelection={false}
          showSorting={false}
          className="mb-6"
        />
      </div>

      {/* Loading State Example */}
      <div>
        <h2 className="text-xl font-semibold text-light mb-4">Loading State</h2>
        <CustomTable
          data={[]}
          columns={customerColumns}
          loading={true}
          className="mb-6"
        />
      </div>

      {/* Empty State Example */}
      <div>
        <h2 className="text-xl font-semibold text-light mb-4">Empty State</h2>
        <CustomTable
          data={[]}
          columns={customerColumns}
          emptyMessage="No data found!"
          className="mb-6"
        />
      </div>
    </div>
  );
};

export default DashboardIndex;
