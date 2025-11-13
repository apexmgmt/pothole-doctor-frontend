import About from "@/views/frontend/about/About";
import Mission from "@/views/frontend/about/Mission";
import OurWork from "@/views/frontend/about/OurWork";
import Services from "@/views/frontend/about/Services";
import VideoPlayer from "@/views/frontend/about/VideoPlayer";
import Vision from "@/views/frontend/about/Vision";

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
