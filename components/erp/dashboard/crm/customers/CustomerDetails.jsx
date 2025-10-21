"use client";

import React from "react";

import EntityDetails from "../../../common/EntityDetails";

const CustomerDetails = ({ customerData, onEdit }) => {
  return (
    <EntityDetails
      entityData={customerData}
      entityType="customer"
      onEdit={onEdit}
    />
  );
};

export default CustomerDetails;
