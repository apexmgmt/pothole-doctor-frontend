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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-wider uppercase text-gray-200">
                SURFACE SPECIALISTS
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                THE SPECIALISTS
                <br />
                FOR PAVEMENT
                <br />
                PROBLEMS
              </h1>
            </div>

            <p className="text-lg md:text-xl text-gray-200 max-w-lg leading-relaxed">
              From cracks to complete overhauls, we deliver seamless,
              long-lasting paving solutions with unmatched precision and care.
            </p>
          </div>

          {/* Right Content - Quote Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Free Quote Today
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="streetAddress"
                    placeholder="Your Street Address"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-primary text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  GET STARTED
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
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
