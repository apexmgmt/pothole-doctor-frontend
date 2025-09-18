"use client";

import React, { useState } from "react";
import CommonLayout from "../crm/CommonLayout";
import CustomTable from "../../common/CustomTable";
import FilterDrawer from "../../common/FilterDrawer";
import AddEstimateModal from "./AddEstimateModal";
import { PlusIcon } from "lucide-react";

const Estimates = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isAddEstimateModalOpen, setIsAddEstimateModalOpen] = useState(false);

  // Sample estimates data matching the image
  const estimatesData = [
    {
      id: "001545464",
      title: "Pothole Doctors",
      date: "20-07-2025",
      company: "The Pothole Doctors",
      customer: "Ethan Bennett",
      jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
      serviceType: "Repair",
      status: "In progress",
    },
    {
      id: "001545465",
      title: "Driveway Repair",
      date: "19-07-2025",
      company: "Smith Construction",
      customer: "John Smith",
      jobAddress: "123 Main St, Columbus, OH 43215",
      serviceType: "Sealcoating",
      status: "Pending",
    },
    {
      id: "001545466",
      title: "Parking Lot Maintenance",
      date: "18-07-2025",
      company: "Johnson Properties",
      customer: "Sarah Johnson",
      jobAddress: "456 Oak Ave, Cleveland, OH 44101",
      serviceType: "Crack Filling",
      status: "Pending",
    },
    {
      id: "001545467",
      title: "Commercial Asphalt",
      date: "17-07-2025",
      company: "Wilson Enterprises",
      customer: "Mike Wilson",
      jobAddress: "789 Pine St, Cincinnati, OH 45202",
      serviceType: "Repair",
      status: "In progress",
    },
    {
      id: "001545468",
      title: "Residential Driveway",
      date: "16-07-2025",
      company: "Brown Development",
      customer: "Lisa Brown",
      jobAddress: "321 Elm St, Akron, OH 44308",
      serviceType: "Pothole Filling",
      status: "Pending",
    },
    {
      id: "001545469",
      title: "Industrial Parking",
      date: "15-07-2025",
      company: "Miller & Associates",
      customer: "David Miller",
      jobAddress: "654 Maple Dr, Toledo, OH 43604",
      serviceType: "Repair",
      status: "In progress",
    },
  ];

  // Column definitions for the estimates table
  const estimateColumns = [
    {
      key: "checkbox",
      label: "",
      conditional: () => true,
    },
    { key: "id", label: "ID#", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    {
      key: "jobAddress",
      label: "Job Address",
      sortable: true,
      whitespace: "normal",
    },
    { key: "serviceType", label: "Service Type", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  // Action buttons for the table
  const actionButtons = [
    {
      label: "Add Job",
      action: "add_job",
      variant: "primary",
      icon: PlusIcon,
    },
  ];

  // Estimate-specific filter configuration
  const estimateFilterFields = [
    {
      key: "location",
      label: "Location",
      type: "select",
      placeholder: "Select location",
      options: [
        { value: "columbus", label: "Columbus" },
        { value: "cleveland", label: "Cleveland" },
        { value: "cincinnati", label: "Cincinnati" },
        { value: "akron", label: "Akron" },
        { value: "toledo", label: "Toledo" },
      ],
    },
    {
      key: "estimateType",
      label: "Estimate Type",
      type: "select",
      placeholder: "Select estimate type",
      options: [
        { value: "residential", label: "Residential" },
        { value: "commercial", label: "Commercial" },
        { value: "industrial", label: "Industrial" },
        { value: "municipal", label: "Municipal" },
      ],
    },
    {
      key: "salesRep",
      label: "Sales Rep",
      type: "select",
      placeholder: "Select sales rep",
      options: [
        { value: "john-doe", label: "John Doe" },
        { value: "jane-smith", label: "Jane Smith" },
        { value: "mike-wilson", label: "Mike Wilson" },
        { value: "sarah-johnson", label: "Sarah Johnson" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",
      options: [
        { value: "in-progress", label: "In progress" },
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "dateRange",
      label: "Date Range",
      gridCols: 2,
      fields: [
        { key: "startDate", label: "Start date", type: "date" },
        { key: "endDate", label: "End date", type: "date" },
      ],
    },
  ];

  const estimateFilterButtons = [
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
      case "add_job":
        setIsAddEstimateModalOpen(true);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleFilterDrawerClose = () => {
    setIsFilterDrawerOpen(false);
  };

  const handleApplyFilters = (filters) => {
    console.log("Applied estimate filters:", filters);
    // Handle filter application logic here
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

  const handleSaveEstimate = (estimateData) => {
    console.log("New estimate saved:", estimateData);
    // Here you would typically add the new estimate to your data
    // For now, we'll just log it
  };

  return (
    <CommonLayout title="Estimate">
      <CustomTable
        data={estimatesData}
        columns={estimateColumns}
        actionButtons={actionButtons}
        onActionButtonClick={handleActionButtonClick}
        onRowClick={handleRowClick}
        onRowSelectionChange={handleRowSelectionChange}
        onExport={handleExport}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={handleFilterDrawerClose}
        onApplyFilters={handleApplyFilters}
        title="Filter Estimates"
        fields={estimateFilterFields}
        buttons={estimateFilterButtons}
      />

      {/* Add Estimate Modal */}
      <AddEstimateModal
        isOpen={isAddEstimateModalOpen}
        onClose={() => setIsAddEstimateModalOpen(false)}
        onSave={handleSaveEstimate}
      />
    </CommonLayout>
  );
};

export default Estimates;
