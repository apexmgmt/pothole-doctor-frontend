"use client";

import Image from "next/image";
import { useState } from "react";

export default function HeroSection() {
  const [formData, setFormData] = useState({
    streetAddress: "",
    zipCode: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[v0] Form submitted:", formData);
    // Handle form submission logic here
  };

  return (
    <section className="relative flex items-center justify-center overflow-hidden py-40">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/home-hero.webp"
          fill
          alt=""
          className="h-full w-full !relative object-cover"
        />
        {/* Dark overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-black/40"></div> */}
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-15">
        <div className="flex gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6 flex-1">
            <div className="space-y-3">
              <p className="text-base font-semibold tracking-wider uppercase gradient-text">
                SURFACE SPECIALISTS
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-primary font-bold leading-[1.1]  uppercase">
                Your Prescription for Perfect Pavement
              </h1>
            </div>

            <p className="text-base md:text-lg text-[#EEEEEE] max-w-lg leading-relaxed">
              From minor cracks to major repairs, we restore smooth, durable
              surfaces with precision and care.
            </p>
          </div>

          {/* Right Content - Quote Form */}
          <div className="flex-1 max-w-[460px]">
            <div className="bg-black/20 backdrop-blur-lg rounded-lg p-[30px] w-full">
              <h3 className="text-[28px] font-semibold font-primary text-white mb-[30px]">
                Free Quote Today
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="streetAddress"
                    placeholder="Your Street Address"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-lg bg-white/10 border border-[#DBDBDB]/20 text-white focus:outline-none focus:ring focus:ring-primary focus:border-transparent font-normal font-global leading-[1.4]"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-lg bg-white/10 border border-[#DBDBDB]/20 text-white focus:outline-none focus:ring focus:ring-primary focus:border-transparent font-normal font-global leading-[1.4]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className=" bg-primary hover:bg-primary/85 text-white font-semibold py-[18px] px-5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 text-sm/[1] w-max"
                >
                  GET STARTED
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.9658 6.53339L6.89475 13.6045"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8.54497 6.06194C8.54497 6.06194 13.6611 5.28557 14.4375 6.06196C15.2139 6.83836 14.4375 11.9545 14.4375 11.9545"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
