"use client";
import { useState } from "react";

export default function ServicesSection() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      id: "parking-blocks",
      title: "PARKING BLOCK INSTALLATION",
      description:
        "Fast, durable pothole repairs to keep your pavement safe and smooth.",
      image: "/placeholder-vrz1z.png",
      size: "large",
      position: "left",
      alwaysShowDetails: true,
    },
    {
      id: "pothole-repairs",
      title: "POTHOLE REPAIRS",
      description:
        "We fix damaged catch basins to ensure proper drainage and prevent water damage.",
      image: "/placeholder-wapo0.png",
      size: "small",
      position: "top-right",
    },
    {
      id: "crack-sealing",
      title: "CRACK SEALING",
      description:
        "Professional crack sealing to prevent water infiltration and extend pavement life.",
      image: "/asphalt-crack-sealing.png",
      size: "small",
      position: "top-right-2",
    },
    {
      id: "catch-basin",
      title: "CATCH BASIN REPAIRS",
      description:
        "Expert repair and maintenance of drainage systems to prevent flooding.",
      image: "/concrete-drain-repair.png",
      size: "small",
      position: "bottom-left",
    },
    {
      id: "sealcoating",
      title: "ASPHALT SEALCOATING",
      description:
        "Protective sealcoating to extend the life of your asphalt surfaces.",
      image: "/fresh-sealcoating-asphalt.png",
      size: "small",
      position: "bottom-right",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container">
        <h2 className="text-5xl font-semibold text-center text-title mb-12">
          OUR SERVICES
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
          {/* Large Left Card - Always shows details */}
          <div className="lg:col-span-2 lg:row-span-2 relative rounded-2xl overflow-hidden group">
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url('${services[0].image}')` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-semibold mb-4">
                  {services[0].title}
                </h3>
                <p className="text-lg text-gray-200">
                  {services[0].description}
                </p>
              </div>
            </div>
          </div>

          {/* Small Right Cards - Show details on hover */}
          {services.slice(1).map((service, index) => (
            <div
              key={service.id}
              className="relative rounded-2xl overflow-hidden group cursor-pointer h-[280px] lg:h-auto"
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className="w-full h-full bg-cover bg-center relative"
                style={{ backgroundImage: `url('${service.image}')` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                {/* Always visible title */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">
                    {service.title}
                  </h3>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      hoveredCard === service.id
                        ? "opacity-100 max-h-20 translate-y-0"
                        : "opacity-0 max-h-0 translate-y-2"
                    }`}
                  >
                    <p className="text-sm text-gray-200">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
