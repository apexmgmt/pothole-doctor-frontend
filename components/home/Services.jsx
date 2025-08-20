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
    <section className="pt-30 pb-20 bg-white">
      <div className="container">
        <h2 className="text-[36px] md:text-[42px] lg:text-[52px] font-semibold text-center text-title mb-10 font-primary leading-[1.2]">
          OUR SERVICES
        </h2>

        <div className="grid grid-rows-2 grid-cols-1 lg:grid-cols-4 gap-6 ">
          {/* Large Left Card - Always shows details */}
          <div className="lg:col-span-2 lg:row-span-2 relative rounded-lg overflow-hidden group">
            <div className="">
              <Image
                fill
                src={services[0].image}
                alt=""
                className="h-full w-full !relative object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-[30px] text-white">
              <h3 className="text-[28px] font-semibold mb-4 font-primary">
                {services[0].title}
              </h3>
              <p className="text-base text-[#EEEEEE]">
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
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3
                  className={`text-xl font-semibold font-primary  ${
                    hoveredCard === service.id ? "mb-5" : " mb-0"
                  }`}
                >
                  {service.title}
                </h3>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    hoveredCard === service.id
                      ? "opacity-100 max-h-30 translate-y-0"
                      : "opacity-0 max-h-0 translate-y-full"
                  }`}
                >
                  <p className="text-base text-[#EEEEEE]">
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
