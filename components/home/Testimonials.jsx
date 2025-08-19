"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

export default function TestimonialsSection() {
  const testimonials = [
    {
      text: "The Pothole Doctors transformed our parking lot completely. Their attention to detail and professional approach made the entire process seamless. The quality of their work exceeded our expectations and has lasted for years.",
      name: "Sarah Johnson",
      title: "Property Manager at Westfield Plaza",
      rating: 5.0,
      avatar: "/images/avater.webp",
    },
    {
      text: "Outstanding service from start to finish. They repaired our damaged driveway and sealed all the cracks perfectly. The team was punctual, professional, and cleaned up thoroughly after completion.",
      name: "Mike Rodriguez",
      title: "Homeowner",
      rating: 5.0,
      avatar: "/images/avater.webp",
    },
    {
      text: "We've used The Pothole Doctors for multiple commercial projects. Their expertise in asphalt repair and maintenance is unmatched. Highly recommend for any paving needs.",
      name: "David Chen",
      title: "Facilities Director at TechCorp",
      rating: 5.0,
      avatar: "/images/avater.webp",
    },
  ];

  return (
    <section className="py-15 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-5xl font-semibold text-center text-title mb-16">
          WHAT OUR CUSTOMERS
          <br />
          ARE SAYING
        </h2>

        <div className="relative max-w-4xl mx-auto">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={50}
            slidesPerView={1}
            navigation={{
              prevEl: ".testimonial-prev",
              nextEl: ".testimonial-next",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="testimonials-swiper"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="text-center px-8">
                  <p className="text-xl text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto">
                    {testimonial.text}
                  </p>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center gap-2.5">
                      <figure className="w-12 h-12 rounded-full ">
                        <Image
                          fill
                          src={testimonial.avatar || "/images/avater.webp"}
                          alt={testimonial.name}
                          className="h-full w-full object-cover !relative"
                        />
                      </figure>
                      <div className="text-left">
                        <h4 className="font-semibold text-title text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-text-color">{testimonial.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-8">
                      <svg
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-title font-semibold">
                        {testimonial.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="testimonial-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-lg hover:scale-110 group">
            <svg
              className="w-6 h-6 text-text-color transition-all duration-300 group-hover:text-gray-800 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button className="testimonial-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-primary hover:shadow-xl hover:scale-110 group">
            <svg
              className="w-6 h-6 text-white transition-all duration-300 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .testimonials-swiper .swiper-slide {
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }
        .testimonials-swiper .swiper-slide-active {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
