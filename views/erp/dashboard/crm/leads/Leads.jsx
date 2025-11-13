"use client";

import React, { useState } from "react";

import { PlusIcon, UserPlusIcon } from "lucide-react";

import CommonLayout from "@/components/erp/dashboard/crm/CommonLayout";
import CustomTable from "@/components/erp/common/CustomTable";
import FilterDrawer from "@/components/erp/common/FilterDrawer";
import LeadDetails from "@/components/erp/dashboard/crm/leads/LeadDetails";
import { DetailsIcon, LeadIcon } from "@/public/icons";

const Leads = () => {
  const [activeTab, setActiveTab] = useState("lead");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sample lead data with unique IDs and diverse information
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
      id: "001545465",
      name: "John Smith",
      phone: "(555) 123-4567",
      company: "Smith Construction",
      email: "john@smithconstruction.com",
      jobAddress: "123 Main St, Columbus, OH 43215",
      leadSource: "Referral",
      stage: "Prospect",
    },
    {
      id: "001545466",
      name: "Sarah Johnson",
      phone: "(614) 987-6543",
      company: "Johnson Properties",
      email: "sarah@johnsonproperties.com",
      jobAddress: "456 Oak Ave, Cleveland, OH 44101",
      leadSource: "Website",
      stage: "Working",
    },
    {
      id: "001545467",
      name: "Mike Wilson",
      phone: "(513) 456-7890",
      company: "Wilson Enterprises",
      email: "mike@wilsonenterprises.com",
      jobAddress: "789 Pine St, Cincinnati, OH 45202",
      leadSource: "Cold Call",
      stage: "Closed-Won",
    },
    {
      id: "001545468",
      name: "Lisa Brown",
      phone: "(330) 234-5678",
      company: "Brown Development",
      email: "lisa@browndevelopment.com",
      jobAddress: "321 Elm St, Akron, OH 44308",
      leadSource: "Social Media",
      stage: "Meeting Set",
    },
    {
      id: "001545469",
      name: "David Miller",
      phone: "(419) 345-6789",
      company: "Miller & Associates",
      email: "david@millerassociates.com",
      jobAddress: "654 Maple Dr, Toledo, OH 43604",
      leadSource: "Trade Show",
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
    {
      key: "jobAddress",
      label: "Job Address",
      sortable: true,
      whitespace: "normal",
    },
    { key: "leadSource", label: "Lead Source", sortable: true },
    { key: "stage", label: "Stage", sortable: true },
  ];

  // Action buttons for the table (Filter is now built into CustomTable)
  const actionButtons = [
    {
      label: "Add Lead",
      action: "add_lead",
      variant: "primary",
      icon: PlusIcon,
    },
  ];

  // Custom cell renderer for stage column (now handled by default in CustomTable)
  // const renderStageCell = (row, column, value) => {
  //   // This is now handled automatically by CustomTable for columns with 'stage' in the key
  //   return value;
  // };

  // Lead-specific filter configuration
  const leadFilterFields = [
    {
      key: "leadId",
      label: "Lead ID",
      type: "text",
      placeholder: "Enter lead ID",
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
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
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
        { value: "open", label: "Open" },
        { value: "prospect", label: "Prospect" },
        { value: "working", label: "Working" },
        { value: "closed-won", label: "Closed-Won" },
        { value: "meeting-set", label: "Meeting Set" },
      ],
    },
    {
      key: "dateRange",
      label: "Date Range",
      gridCols: 2,
      fields: [
        {
          key: "dateFrom",
          label: "Date From",
          type: "date",
          placeholder: "Date from",
        },
        {
          key: "dateTo",
          label: "Date To",
          type: "date",
          placeholder: "Date to",
        },
      ],
    },
  ];

  const leadFilterButtons = [
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
      case "add_lead":
        console.log("Opening add lead form...");
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleFilterDrawerClose = () => {
    setIsFilterDrawerOpen(false);
  };

  const handleApplyFilters = (filters) => {
    console.log("Applied lead filters:", filters);

    // Handle filter application logic here
  };

  // Search functionality is now handled by default in CustomTable
  // const handleSearch = (data, searchTerm) => {
  //   return data.filter((row) =>
  //     Object.values(row).some((value) =>
  //       String(value).toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //   );
  // };

  // Sorting functionality is now handled by default in CustomTable
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
    <CommonLayout title="Lead" buttons={buttons}>
      {activeTab === "lead" && (
        <CustomTable
          data={leadsData}
          columns={leadColumns}
          actionButtons={actionButtons}
          onActionButtonClick={handleActionButtonClick}
        />
      )}

      {activeTab === "details" && (
        <LeadDetails
          leadData={leadsData[0]} // Pass the first lead as sample data
          onEdit={() => console.log("Edit lead")}
        />
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={handleFilterDrawerClose}
        onApplyFilters={handleApplyFilters}
        title="Filter Leads"
        fields={leadFilterFields}
        buttons={leadFilterButtons}
      />
    </CommonLayout>
  );
};

export default Leads;
