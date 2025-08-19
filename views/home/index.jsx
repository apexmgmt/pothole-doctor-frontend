import HeroSection from "@/components/home/Hero";
import ServicesSection from "@/components/home/Services";
import TestimonialsSection from "@/components/home/Testimonials";
import WorkProcessSection from "@/components/home/WorkProcess";
import React from "react";

const HomeIndex = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <WorkProcessSection />
    </>
  );
};

export default HomeIndex;
