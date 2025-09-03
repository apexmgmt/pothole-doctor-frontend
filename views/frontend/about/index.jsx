import About from "@/components/frontend/about/About";
import Mission from "@/components/frontend/about/Mission";
import OurWork from "@/components/frontend/about/OurWork";
import Services from "@/components/frontend/about/Services";
import VideoPlayer from "@/components/frontend/about/VideoPlayer";
import Vision from "@/components/frontend/about/Vision";
import React from "react";

const AboutIndex = () => {
  return (
    <>
      <About />
      <Services />
      <VideoPlayer />
      <Mission />
      <Vision />
      <OurWork />
    </>
  );
};

export default AboutIndex;
