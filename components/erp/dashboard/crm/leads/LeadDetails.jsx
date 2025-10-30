"use client";

import React from "react";

import EntityDetails from "../../../common/EntityDetails";
import { DatePicker } from "@/components/ui/DatePicker";

const LeadDetails = ({ leadData, onEdit }) => {
  return (
    <>
      <EntityDetails entityData={leadData} entityType="lead" onEdit={onEdit} />
    </>
  );
};

export default LeadDetails;
