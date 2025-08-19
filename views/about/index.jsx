import Hero from "@/components/about/Hero";
import Mission from "@/components/about/Mission";
import OurWork from "@/components/about/OurWork";
import Services from "@/components/about/Services";
import VideoPlayer from "@/components/about/VideoPlayer";
import Vision from "@/components/about/Vision";
import React from "react";

const AboutIndex = () => {
  return (
    <>
      <Hero />
      <Services />
      <VideoPlayer />
      <Mission />
      <Vision />
      <OurWork />
    </>
  );
};

export default AboutIndex;
