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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg-2 relative">
      <div className="absolute top-1/3 left-1/2 -translate-1/2 w-1/2 aspect-square pointer-events-none">
        <Image
          src="/images/dashboard/pattern.webp"
          fill
          alt=""
          className=" !raletive"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none">
        <Image
          src="/images/dashboard/auth-gradient.webp"
          fill
          alt=""
          className=" !raletive"
        />
      </div>

      <div className="w-full max-w-[405px] rounded-2xl bg-bg shadow-[0_18px_60px_-4px_rgba(24,39,75,0.1)] p-6 backdrop-blur-2xl">
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
      </div>
    </div>
  );
};

export default NewPassIndex;
