"use client";

import React, { useState } from "react";
import Image from "next/image";
import Field from "@/components/erp/common/Field";
import CustomButton from "@/components/erp/common/CustomButton";

const LoginIndex = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <>
      <h1 className="text-light-2 text-2xl font-semibold mb-1">
        Welcome to Pothole Doctors!
      </h1>
      <p className="text-gray mb-6">Sign in to your account to begin.</p>

      <Field
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={handle}
        placeholder="m@example.com"
      />
      <Field
        label="Password"
        type="password"
        name="password"
        value={form.password}
        onChange={handle}
        placeholder="Enter password"
      />

      <div className="mt-4">
        <CustomButton
          type="submit"
          variant="primary"
          fullWidth
          className="!py-2"
        >
          Login
        </CustomButton>
      </div>
    </>
  );
};

export default LoginIndex;
