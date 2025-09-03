import HeroSection from "@/components/frontend/home/Hero";
import ServicesSection from "@/components/frontend/home/Services";
import TestimonialsSection from "@/components/frontend/home/Testimonials";
import WorkProcessSection from "@/components/frontend/home/WorkProcess";
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
