"use client";

import React from "react";
import EntityDetails from "../../../common/EntityDetails";
import {
  EmailIcon,
  SmsIcon,
  DocumentIcon,
  ContactIcon,
  LocationIcon,
  RulerIcon,
  CalculatorIcon,
  CalendarIcon,
  DollarIcon,
  InvoiceIcon,
  JobsIcon,
  RefundsIcon,
} from "@/public/icons/icons";
import { PlusIcon } from "lucide-react";

const AdvancedCustomerDetails = ({ customerData, onEdit }) => {
  // Custom tabs for customers with additional functionality
  const customTabs = [
    {
      id: "email",
      label: "Email",
      icon: EmailIcon,
      data: [
        {
          id: 1,
          sentBy: customerData?.name || "Customer Service",
          source: customerData?.email || "service@potholedoctors.com",
          subject: "Welcome to our services",
          dateSent: "12-07-2025",
        },
        {
          id: 2,
          sentBy: customerData?.name || "Customer Service",
          source: customerData?.email || "service@potholedoctors.com",
          subject: "Project completion notification",
          dateSent: "12-06-2025",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "sentBy", label: "Sent By", sortable: true },
        { key: "source", label: "Source", sortable: true },
        { key: "subject", label: "Subject", sortable: true },
        { key: "dateSent", label: "Date Sent", sortable: true },
      ],
      actionButtons: [
        {
          label: "Compose & Send Email",
          action: "compose_email",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    {
      id: "sms",
      label: "SMS",
      icon: SmsIcon,
      data: [
        {
          id: 1,
          sentBy: customerData?.name || "Customer Service",
          source: customerData?.phone || "(740) 330-5155",
          subject: "Project update",
          dateSent: "12-07-2025",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "sentBy", label: "Sent By", sortable: true },
        { key: "source", label: "Source", sortable: true },
        { key: "subject", label: "Subject", sortable: true },
        { key: "dateSent", label: "Date Sent", sortable: true },
      ],
      actionButtons: [
        {
          label: "Send SMS",
          action: "send_sms",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    {
      id: "documents",
      label: "Documents",
      icon: DocumentIcon,
      data: [
        {
          id: 1,
          name: `Invoice_${customerData?.id || "001545464"}.pdf`,
          type: "Invoice",
          uploadedBy: customerData?.name || "System",
          dateUploaded: "12-07-2025",
        },
        {
          id: 2,
          name: `Contract_${customerData?.id || "001545464"}.pdf`,
          type: "Contract",
          uploadedBy: customerData?.name || "System",
          dateUploaded: "12-06-2025",
        },
        {
          id: 3,
          name: `Warranty_${customerData?.id || "001545464"}.pdf`,
          type: "Warranty",
          uploadedBy: customerData?.name || "System",
          dateUploaded: "12-05-2025",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "name", label: "Document Name", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "uploadedBy", label: "Uploaded By", sortable: true },
        { key: "dateUploaded", label: "Date Uploaded", sortable: true },
      ],
      actionButtons: [
        {
          label: "Upload Document",
          action: "upload_document",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: ContactIcon,
      data: [
        {
          id: 1,
          name: customerData?.name || "John Doe",
          phone: customerData?.phone || "(740) 330-5155",
          email: customerData?.email || "john@example.com",
          role: "Primary Contact",
        },
        {
          id: 2,
          name: "Jane Smith",
          phone: "(740) 330-5156",
          email: "jane@example.com",
          role: "Secondary Contact",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "name", label: "Name", sortable: true },
        { key: "phone", label: "Phone", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "role", label: "Role", sortable: true },
      ],
      actionButtons: [
        {
          label: "Add Contact",
          action: "add_contact",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: LocationIcon,
      data: [
        {
          id: 1,
          address:
            customerData?.jobAddress ||
            "708-D Fairground Rd, Lucasville, OH 45648",
          type: "Job Site",
          isPrimary: true,
        },
        {
          id: 2,
          address: "123 Business Ave, Columbus, OH 43215",
          type: "Billing Address",
          isPrimary: false,
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        {
          key: "address",
          label: "Address",
          sortable: true,
          whitespace: "normal",
        },
        { key: "type", label: "Type", sortable: true },
        { key: "isPrimary", label: "Primary", sortable: true },
      ],
      actionButtons: [
        {
          label: "Add Address",
          action: "add_address",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    {
      id: "measurements",
      label: "Measurements",
      icon: RulerIcon,
      data: [
        {
          id: 1,
          area: "Main Parking Lot",
          length: "100 ft",
          width: "50 ft",
          totalArea: "5000 sq ft",
          dateMeasured: "12-07-2025",
        },
        {
          id: 2,
          area: "Sidewalk Area",
          length: "200 ft",
          width: "4 ft",
          totalArea: "800 sq ft",
          dateMeasured: "12-06-2025",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "area", label: "Area", sortable: true },
        { key: "length", label: "Length", sortable: true },
        { key: "width", label: "Width", sortable: true },
        { key: "totalArea", label: "Total Area", sortable: true },
        { key: "dateMeasured", label: "Date Measured", sortable: true },
      ],
      actionButtons: [
        {
          label: "Add Measurement",
          action: "add_measurement",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    {
      id: "estimate",
      label: "Estimate",
      icon: CalculatorIcon,
      data: [
        {
          id: 1,
          estimateNumber: `EST-${customerData?.id || "001545464"}`,
          amount: "$5,500.00",
          status: "Approved",
          createdDate: "12-07-2025",
          validUntil: "12-21-2025",
        },
        {
          id: 2,
          estimateNumber: `EST-${customerData?.id || "001545464"}-R1`,
          amount: "$3,200.00",
          status: "Pending",
          createdDate: "12-06-2025",
          validUntil: "12-20-2025",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "estimateNumber", label: "Estimate #", sortable: true },
        { key: "amount", label: "Amount", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "createdDate", label: "Created Date", sortable: true },
        { key: "validUntil", label: "Valid Until", sortable: true },
      ],
      actionButtons: [
        {
          label: "Create Estimate",
          action: "create_estimate",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    // Custom tab for customers - Projects
    {
      id: "projects",
      label: "Projects",
      icon: CalendarIcon,
      data: [
        {
          id: 1,
          projectName: "Parking Lot Repair",
          status: "Completed",
          startDate: "12-01-2025",
          endDate: "12-07-2025",
          amount: "$5,500.00",
        },
        {
          id: 2,
          projectName: "Sidewalk Installation",
          status: "In Progress",
          startDate: "12-08-2025",
          endDate: "12-15-2025",
          amount: "$3,200.00",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "projectName", label: "Project Name", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "startDate", label: "Start Date", sortable: true },
        { key: "endDate", label: "End Date", sortable: true },
        { key: "amount", label: "Amount", sortable: true },
      ],
      actionButtons: [
        {
          label: "Create Project",
          action: "create_project",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    // Custom tab for customers - Payment History
    {
      id: "payments",
      label: "Payments",
      icon: DollarIcon,
      data: [
        {
          id: 1,
          paymentNumber: "PAY-001",
          amount: "$2,750.00",
          method: "Credit Card",
          date: "12-07-2025",
          status: "Completed",
        },
        {
          id: 2,
          paymentNumber: "PAY-002",
          amount: "$1,600.00",
          method: "Check",
          date: "12-06-2025",
          status: "Pending",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "paymentNumber", label: "Payment #", sortable: true },
        { key: "amount", label: "Amount", sortable: true },
        { key: "method", label: "Method", sortable: true },
        { key: "date", label: "Date", sortable: true },
        { key: "status", label: "Status", sortable: true },
      ],
      actionButtons: [
        {
          label: "Record Payment",
          action: "record_payment",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    // Custom tab for customers - Invoices
    {
      id: "invoices",
      label: "Invoices",
      icon: InvoiceIcon,
      data: [
        {
          id: 1,
          invoiceNumber: `INV-${customerData?.id || "001545464"}`,
          amount: "$5,500.00",
          status: "Paid",
          issueDate: "12-07-2025",
          dueDate: "12-21-2025",
        },
        {
          id: 2,
          invoiceNumber: `INV-${customerData?.id || "001545464"}-R1`,
          amount: "$3,200.00",
          status: "Overdue",
          issueDate: "12-06-2025",
          dueDate: "12-20-2025",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "invoiceNumber", label: "Invoice #", sortable: true },
        { key: "amount", label: "Amount", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "issueDate", label: "Issue Date", sortable: true },
        { key: "dueDate", label: "Due Date", sortable: true },
      ],
      actionButtons: [
        {
          label: "Create Invoice",
          action: "create_invoice",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    // Custom tab for customers - Jobs
    {
      id: "jobs",
      label: "Jobs",
      icon: JobsIcon,
      data: [
        {
          id: 1,
          jobNumber: `JOB-${customerData?.id || "001545464"}`,
          jobType: "Parking Lot Repair",
          status: "Completed",
          startDate: "12-01-2025",
          endDate: "12-07-2025",
          amount: "$5,500.00",
        },
        {
          id: 2,
          jobNumber: `JOB-${customerData?.id || "001545464"}-R1`,
          jobType: "Sidewalk Installation",
          status: "In Progress",
          startDate: "12-08-2025",
          endDate: "12-15-2025",
          amount: "$3,200.00",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "jobNumber", label: "Job #", sortable: true },
        { key: "jobType", label: "Job Type", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "startDate", label: "Start Date", sortable: true },
        { key: "endDate", label: "End Date", sortable: true },
        { key: "amount", label: "Amount", sortable: true },
      ],
      actionButtons: [
        {
          label: "Create Job",
          action: "create_job",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
    // Custom tab for customers - Refunds
    {
      id: "refunds",
      label: "Refunds",
      icon: RefundsIcon,
      data: [
        {
          id: 1,
          refundNumber: "REF-001",
          amount: "$500.00",
          reason: "Material defect",
          status: "Processed",
          requestDate: "12-05-2025",
          processedDate: "12-06-2025",
        },
        {
          id: 2,
          refundNumber: "REF-002",
          amount: "$200.00",
          reason: "Service cancellation",
          status: "Pending",
          requestDate: "12-07-2025",
          processedDate: null,
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "refundNumber", label: "Refund #", sortable: true },
        { key: "amount", label: "Amount", sortable: true },
        { key: "reason", label: "Reason", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "requestDate", label: "Request Date", sortable: true },
        { key: "processedDate", label: "Processed Date", sortable: true },
      ],
      actionButtons: [
        {
          label: "Process Refund",
          action: "process_refund",
          variant: "primary",
          // icon: <PlusIcon />,
        },
      ],
    },
  ];

  return (
    <EntityDetails
      entityData={{
        ...customerData,
        totalSpent: "$8,700.00", // Add customer-specific data
        customerSince: "12-01-2025",
      }}
      entityType="customer"
      onEdit={onEdit}
      customTabs={customTabs}
    />
  );
};

export default AdvancedCustomerDetails;
