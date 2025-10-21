"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

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
    console.log("Form submitted:", formData);

    // Navigate to contact page after form submission
    router.push("/contact");
  };

  return (
    <section className="relative flex items-center justify-center overflow-hidden py-20 md:py-42">
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
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-4 md:space-y-6 flex-1 ">
            <div className="space-y-3">
              <p className="text-base font-semibold tracking-wider uppercase gradient-text">
                SURFACE SPECIALISTS
              </p>
              <h1 className="text-large-title font-primary font-bold leading-[1.1]  uppercase">
                Your Prescription for Perfect Pavement
              </h1>
            </div>

            <p className="text-body-text text-[#EEEEEE] max-w-lg leading-relaxed">
              From minor cracks to major repairs, we restore smooth, durable
              surfaces with precision and care.
            </p>
          </div>

          {/* Right Content - Quote Form */}
          <div className="flex-1 w-full md:max-w-[460px]">
            <div className="bg-black/40 backdrop-blur-lg rounded-lg p-5 lg:p-[30px] w-full">
              <h3 className="text-xl lg:text-[28px] font-semibold font-primary text-white mb-4 lg:mb-[30px]">
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
                    className="w-full px-4 lg:px-5 py-2.5 lg:py-4 rounded-lg bg-white/10 border border-[#DBDBDB]/20 text-white focus:outline-none focus:ring focus:ring-primary focus:border-transparent font-normal font-global leading-[1.4]"
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
                    className="w-full px-4 lg:px-5 py-2.5 lg:py-4 rounded-lg bg-white/10 border border-[#DBDBDB]/20 text-white focus:outline-none focus:ring focus:ring-primary focus:border-transparent font-normal font-global leading-[1.4]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className=" bg-primary hover:bg-primary/85 text-white font-semibold py-3 lg:py-[18px] px-5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 text-sm/[1] w-max cursor-pointer"
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
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.54497 6.06194C8.54497 6.06194 13.6611 5.28557 14.4375 6.06196C15.2139 6.83836 14.4375 11.9545 14.4375 11.9545"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
