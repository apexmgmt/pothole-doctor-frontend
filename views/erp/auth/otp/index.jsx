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
          Verify Your Email
        </h1>
        <p className="text-gray mb-6">
          We have sent the verification code to your email.
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
      </div>
    </div>
  );
};

export default OTPIndex;
