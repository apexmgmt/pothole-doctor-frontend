import React from "react";

import Image from "next/image";

const layout = ({ children }) => {
  return (
    <>
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
          {children}
        </div>
      </div>
    </>
  );
};

export default layout;
