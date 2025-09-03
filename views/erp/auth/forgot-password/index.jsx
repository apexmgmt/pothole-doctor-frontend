"use client";

import React, { useState } from "react";
import Image from "next/image";
import Field from "@/components/erp/common/Field";
import CustomButton from "@/components/erp/common/CustomButton";

const ForgotPassIndex = () => {
  const [email, setEmail] = useState("");
  return (
    <>
      <h1 className="text-light-2 text-xl md:text-2xl font-semibold mb-2.5">
        Forgot Password
      </h1>
      <p className="text-sm text-gray mb-6">
        Lost your password? Please enter your email address.
      </p>

      <div className="max-w-md">
        <Field
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="m@example.com"
        />
        <div className="mt-4">
          <CustomButton
            type="button"
            variant="primary"
            fullWidth
            className="!py-2"
          >
            Reset Password
          </CustomButton>
        </div>
        <div className="mt-3">
          <CustomButton
            type="button"
            variant="secondary"
            fullWidth
            className="!py-2"
          >
            Login
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default ForgotPassIndex;
