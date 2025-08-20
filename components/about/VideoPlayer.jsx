"use client";

import Image from "next/image";
import { useState, useRef } from "react";

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = async () => {
    if (videoRef.current) {
      try {
        setIsPlaying(true);
        await videoRef.current.play();
      } catch (error) {
        console.error("Error playing video:", error);
        setIsPlaying(false);
      }
    }
  };

  const handleVideoClick = async () => {
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      } catch (error) {
        console.error("Error controlling video:", error);
      }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container !max-w-[1080px]">
        <div
          className="relative aspect-[2.29/1] bg-black rounded-lg overflow-hidden cursor-pointer"
          onClick={!isPlaying ? handlePlayClick : undefined}
        >
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${
              isPlaying ? "block" : "hidden"
            }`}
            onClick={handleVideoClick}
            preload="metadata"
            muted
            playsInline
            controls={false}
            autoPlay={isPlaying}
            onError={(e) => {
              console.error("Video error:", e);
              setIsPlaying(false);
              setVideoError(true);
            }}
            onLoadStart={() => console.log("Video loading started")}
            onCanPlay={() => console.log("Video can play")}
          >
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          {!isPlaying && (
            <>
              <Image
                fill
                src="/images/video-thumb.webp"
                alt="Worker laying pavement stones"
                className="w-full h-full object-cover !relative"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-white text-2xl hover:bg-white transition-colors">
                    <svg
                      width="17"
                      height="18"
                      viewBox="0 0 17 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.0293 7.42529C17.349 8.21824 17.3154 10.1424 15.9688 10.8889L3.84972 17.6066C2.50315 18.353 0.853533 17.3618 0.880402 15.8224L1.12223 1.96814C1.1491 0.428774 2.83231 -0.504244 4.152 0.288709L16.0293 7.42529Z"
                        fill="#53AA57"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-white/[.5] wave-animation"></div>
                  <div className="absolute inset-0 rounded-full border border-white/[.5] wave-animation"></div>
                  <div className="absolute inset-0 rounded-full border border-white/[.5] wave-animation"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
