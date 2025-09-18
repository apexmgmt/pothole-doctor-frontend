"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CommonLayout from "../CommonLayout";
import CustomTable from "../../../common/CustomTable";
import FilterDrawer from "../../../common/FilterDrawer";
import { DetailsIcon, FilterIcon, UserIcon } from "@/public/icons/icons";
import { PlusIcon } from "lucide-react";
import AdvancedCustomerDetails from "./AdvancedCustomerDetails";

const Customers = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("customers");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sample customer data with unique IDs and diverse information
  const customersData = [
    {
      id: "001545464",
      name: "Pothole Doctors",
      phone: "(740) 330-5155",
      company: "The Pothole Doctors",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      leadSource: "Repair",
      stage: "Job Completed",
    },
    {
      id: "001545465",
      name: "John Smith",
      phone: "(555) 123-4567",
      company: "Smith Construction",
      jobAddress: "123 Main St, Columbus, OH 43215",
      leadSource: "Referral",
      stage: "Quote Voided",
    },
    {
      id: "001545466",
      name: "Sarah Johnson",
      phone: "(614) 987-6543",
      company: "Johnson Properties",
      jobAddress: "456 Oak Ave, Cleveland, OH 44101",
      leadSource: "Website",
      stage: "Quote In Progress",
    },
    {
      id: "001545467",
      name: "Mike Wilson",
      phone: "(513) 456-7890",
      company: "Wilson Enterprises",
      jobAddress: "789 Pine St, Cincinnati, OH 45202",
      leadSource: "Cold Call",
      stage: "Job in progress",
    },
    {
      id: "001545468",
      name: "Lisa Brown",
      phone: "(330) 234-5678",
      company: "Brown Development",
      jobAddress: "321 Elm St, Akron, OH 44308",
      leadSource: "Social Media",
      stage: "Job Completed",
    },
    {
      id: "001545469",
      name: "David Miller",
      phone: "(419) 345-6789",
      company: "Miller & Associates",
      jobAddress: "654 Maple Dr, Toledo, OH 43604",
      leadSource: "Trade Show",
      stage: "Quote In Progress",
    },
  ];

  // Column definitions for the customers table
  const customerColumns = [
    {
      key: "checkbox",
      label: "",
      conditional: () => true,
    },
    { key: "id", label: "ID#", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "jobAddress", label: "Job Address", sortable: true },
    { key: "leadSource", label: "Lead Source", sortable: true },
    { key: "stage", label: "Stage", sortable: true },
    {
      key: "actions",
      label: "Action",
      conditional: () => true,
    },
  ];

  // Action buttons for the table (Filter is now built into CustomTable)
  const actionButtons = [
    {
      label: "Add Customer",
      action: "add_customer",
      variant: "primary",
      // icon: PlusIcon,
    },
  ];

  // Custom cell renderer for stage column (now handled by default in CustomTable)
  // const renderStageCell = (row, column, value) => {
  //   // This is now handled automatically by CustomTable for columns with 'stage' in the key
  //   return value;
  // };

  // Custom actions renderer
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

  // Customer-specific filter configuration
  const customerFilterFields = [
    {
      key: "customerId",
      label: "Customer ID",
      type: "text",
      placeholder: "Enter customer ID",
    },
    { key: "name", label: "Name", type: "text", placeholder: "Enter name" },
    {
      key: "phone",
      label: "Phone",
      type: "text",
      placeholder: "Enter phone number",
    },
    {
      key: "company",
      label: "Company",
      type: "text",
      placeholder: "Enter company name",
    },
    {
      key: "jobAddress",
      label: "Job Address",
      type: "text",
      placeholder: "Enter job address",
    },
    {
      key: "leadSource",
      label: "Lead Source",
      type: "select",
      placeholder: "Select lead source",
      options: [
        { value: "repair", label: "Repair" },
        { value: "referral", label: "Referral" },
        { value: "website", label: "Website" },
        { value: "cold-call", label: "Cold Call" },
        { value: "social-media", label: "Social Media" },
        { value: "trade-show", label: "Trade Show" },
      ],
    },
    {
      key: "stage",
      label: "Stage",
      type: "select",
      placeholder: "Select stage",
      options: [
        { value: "job-completed", label: "Job Completed" },
        { value: "quote-voided", label: "Quote Voided" },
        { value: "quote-in-progress", label: "Quote In Progress" },
        { value: "job-in-progress", label: "Job In Progress" },
      ],
    },
    { key: "lastContactDate", label: "Last Contact Date", type: "date" },
    {
      key: "totalJobs",
      label: "Total Jobs",
      type: "number",
      placeholder: "Enter minimum jobs",
    },
    {
      key: "totalRevenue",
      label: "Total Revenue ($)",
      type: "number",
      placeholder: "Enter minimum revenue",
    },
  ];

  const customerFilterButtons = [
    { label: "Clear", action: "clear", variant: "outline" },
    { label: "Apply Filters", action: "apply", variant: "primary" },
  ];

  // Event handlers
  const handleActionButtonClick = (action) => {
    console.log("Action clicked:", action);
    switch (action) {
      case "filter":
        setIsFilterDrawerOpen(true);
        break;
      case "add_customer":
        router.push("/erp/crm/customers/add-customer");
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleFilterDrawerClose = () => {
    setIsFilterDrawerOpen(false);
  };

  const handleApplyFilters = (filters) => {
    console.log("Applied customer filters:", filters);
    // Handle filter application logic here
  };

  // Search and sorting functionality is now handled by default in CustomTable
  // const handleSearch = (data, searchTerm) => {
  //   return data.filter((row) =>
  //     Object.values(row).some((value) =>
  //       String(value).toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //   );
  // };

  // const handleSort = (data, column, direction) => {
  //   return [...data].sort((a, b) => {
  //     const aVal = a[column];
  //     const bVal = b[column];

  //     if (aVal < bVal) return direction === "asc" ? -1 : 1;
  //     if (aVal > bVal) return direction === "asc" ? 1 : -1;
  //     return 0;
  //   });
  // };

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
      label: "Customers",
      icon: UserIcon,
      onClick: () => setActiveTab("customers"),
      isActive: activeTab === "customers",
    },
    {
      label: "Details",
      icon: DetailsIcon,
      onClick: () => setActiveTab("details"),
      isActive: activeTab === "details",
    },
  ];

  return (
    <CommonLayout title="Customer" buttons={buttons}>
      {activeTab === "customers" && (
        <CustomTable
          data={customersData}
          columns={customerColumns}
          actionButtons={actionButtons}
          onActionButtonClick={handleActionButtonClick}
        />
      )}

      {activeTab === "details" && (
        <AdvancedCustomerDetails
          customerData={customersData[0]} // Pass the first customer as sample data
          onEdit={() => console.log("Edit customer")}
        />
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={handleFilterDrawerClose}
        onApplyFilters={handleApplyFilters}
        title="Filter Customers"
        fields={customerFilterFields}
        buttons={customerFilterButtons}
      />
    </CommonLayout>
  );
};

export default Customers;
