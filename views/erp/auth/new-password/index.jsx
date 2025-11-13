"use client";

import React, { useState } from "react";
import Image from "next/image";
import CustomButton from "@/components/erp/common/CustomButton";
import Field from "@/components/erp/common/Field";

const NewPassIndex = () => {
  const [form, setForm] = useState({ password: "", newPassword: "" });
  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <>
      <h1 className="text-light-2 text-2xl font-semibold mb-1">
        Create New Password
      </h1>
      <p className="text-gray mb-6">
        Your new password must be different from previously used password
      </p>

      <div className="max-w-md">
        <Field
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handle}
          placeholder="********"
        />
        <Field
          label="New Password"
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handle}
          placeholder="********"
        />
        <div className="mt-4">
          <CustomButton variant="primary" fullWidth>
            Confirm
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default NewPassIndex;
