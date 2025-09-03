"use client";

import React, { useState } from "react";
import Image from "next/image";
import Field from "@/components/erp/common/Field";
import CustomButton from "@/components/erp/common/CustomButton";

const ForgotPassIndex = () => {
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg-2 relative">
      <div className="absolute top-1/3 left-1/2 -translate-1/2 w-1/2 aspect-square pointer-events-none pointer-events-none">
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
      </div>
    </div>
  );
};

export default ForgotPassIndex;
