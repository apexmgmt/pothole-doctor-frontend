"use client";
import Image from "next/image";
import { useState } from "react";

export default function ServicesSection() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      id: "parking-blocks",
      title: "Parking block installation",
      description:
        "We install sturdy parking blocks to protect vehicles, buildings, and landscaping from accidental damage.",
      image: "/images/service1.webp",
    },
    {
      id: "pothole-repairs",
      title: "POTHOLE REPAIRS",
      description:
        "We restore damaged pavement with durable pothole repairs that improve safety and extend surface life.",
      image: "/images/service2.webp",
    },
    {
      id: "crack-sealing",
      title: "CRACK SEALING",
      description:
        "Our crack sealing service prevents water infiltration and stops small cracks from turning into major pavement issues.",
      image: "/images/service3.webp",
    },
    {
      id: "catch-basin",
      title: "CATCH BASIN REPAIRS",
      description:
        "Our team ensures proper drainage and stability with expert catch basin restoration and rebuilding.",
      image: "/images/service4.webp",
    },
    {
      id: "sealcoating",
      title: "ASPHALT SEALCOATING",
      description:
        "A protective sealcoat shields asphalt from weather, traffic, and UV damage while enhancing curb appeal.",
      image: "/images/service5.webp",
    },
  ];

  return (
    <section className="pt-15 lg:pt-30 pb-20 bg-white">
      <div className="container">
        <h2 className="text-heading font-semibold text-center text-title mb-6 md:mb- 10 font-primary leading-[1.2] uppercase">
          OUR SERVICES
        </h2>

        <div className="grid lg:grid-rows-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 ">
          {/* Large Left Card - Always shows details */}
          <div className="sm:col-span-2 row-span-2 relative rounded-lg overflow-hidden group">
            <div className="">
              <Image
                fill
                src={services[0].image}
                alt=""
                className="h-full w-full !relative object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-[30px] text-white">
              <h3 className="text-lg sm:text-[28px] font-semibold mb-4 font-primary">
                {services[0].title}
              </h3>
              <p className="text-sm sm:text-base text-[#EEEEEE]">
                {services[0].description}
              </p>
            </div>
          </div>

          {/* Small Right Cards - Show details on hover */}
          {services.slice(1).map((service, index) => (
            <div
              key={service.id}
              className="relative rounded-lg overflow-hidden group"
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="">
                <Image
                  fill
                  src={service.image}
                  alt=""
                  className="h-full w-full !relative object-cover"
                />
              </div>

              {/* Always visible title */}
              <div className="absolute bottom-0 left-0 right-0 p-4 xl:p-5 text-white">
                <h3
                  className={`text-lg xl:text-xl font-semibold font-primary leading-[1.1] mb-5 md:mb-2 xl:mb-5 ${
                    hoveredCard === service.id ? " " : " !md:mb-0"
                  }`}
                >
                  {service.title}
                </h3>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    hoveredCard === service.id
                      ? "md:opacity-100 md:max-h-30 md:translate-y-0"
                      : "md:opacity-0 md:max-h-0 md:translate-y-full"
                  }`}
                >
                  <p className="text-sm xl:text-base text-[#EEEEEE]">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
