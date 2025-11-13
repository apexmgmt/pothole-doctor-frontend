"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import CustomButton from "@/components/erp/common/CustomButton";

const OTPIndex = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const setAt = (i, v) => {
    setCode((p) => p.map((x, idx) => (idx === i ? v.slice(-1) : x)));
    if (v && i < code.length - 1) {
      inputRefs.current[i + 1].focus();
    }
  };
  return (
    <>
      <h1 className="text-light-2 text-2xl font-semibold mb-1">
        Verify Your Email
      </h1>
      <p className="text-gray mb-6">
        We have sent the verification code to the email
        service@potholedoctors.com
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex gap-2">
          {code.map((v, i) => (
            <div className="flex-1" key={i}>
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                value={v}
                onChange={(e) => setAt(i, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !e.target.value && i > 0) {
                    inputRefs.current[i - 1].focus();
                  }
                }}
                className="w-12 h-12 text-center text-light bg-bg-2 border border-border rounded-lg text-xl outline-none"
              />
            </div>
          ))}
        </div>
        <CustomButton variant="secondary" className=" whitespace-nowrap">
          Resend code
        </CustomButton>
      </div>

      <CustomButton variant="primary" fullWidth className="!py-2">
        Confirm
      </CustomButton>
    </>
  );
};

export default OTPIndex;
