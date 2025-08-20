"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

export default function TestimonialsSection() {
  const testimonials = [
    {
      title: "-Fast, Professional, and Reliable",
      text: "“Pothole Doctors came out the same week we called and fixed a dangerous pothole in our parking lot. The crew was professional, efficient, and left everything looking brand new. Our customers noticed the difference right away.”",
      name: "David M.",
      rating: 5.0,
      avatar: "/images/avater.webp",
      bio: "Business Owner",
    },
    {
      title: "-Quality Work That Lasts",
      text: "“We’ve had other companies patch our lot before, but the repairs never lasted. Pothole Doctors did it right the first time. Months later, the surface is still smooth and holding up perfectly. We’ll definitely be using them again.”",
      name: "Sarah T.",
      rating: 5.0,
      avatar: "/images/avater.webp",
      bio: "Property Manager",
    },
    {
      title: "-Driveway Looks Brand New",
      text: "“Pothole Doctors repaired the cracks and potholes in our driveway, and the difference is amazing. It’s smooth, clean, and adds real curb appeal to our home. We couldn’t be happier with the results!”",
      name: "Karen S.",
      rating: 5.0,
      avatar: "/images/avater.webp",
      bio: "Homeowner",
    },
  ];

  return (
    <section className="py-15 bg-white">
      <div className="container !max-w-[1160px] ">
        <h2 className="max-w-[670px] mx-auto text-heading font-semibold text-center text-title mb-15 font-primary leading-[1.2] uppercase">
          WHAT OUR CUSTOMERS ARE SAYING
        </h2>

        <div className="relative px-[110px]">
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
                <div className="px-8">
                  <h3 className="text-xl text-title leading-tight mb-5 font-semibold font-primary">
                    -Fast, Professional, and Reliable
                  </h3>
                  <p className="text-2xl text-title leading-relaxed mb-10 font-normal font-global">
                    {testimonial.text}
                  </p>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center gap-3">
                      <figure className="w-12 h-12 rounded-full ">
                        <Image
                          fill
                          src={testimonial.avatar || "/images/avater.webp"}
                          alt={testimonial.name}
                          className="h-full w-full object-cover !relative"
                        />
                      </figure>
                      <div className="">
                        <h4 className="font-medium text-title text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-text-color text-base">
                          {testimonial.bio}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <div className="absolute bottom-full right-0">
                        <svg
                          width="118"
                          height="74"
                          viewBox="0 0 118 74"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.08">
                            <path
                              d="M58.8705 73.5H82.4192L117.742 0.500145H71.8223L58.8705 73.5Z"
                              fill="#53AA57"
                            />
                            <path
                              d="M0.000427246 73.5H23.5491L58.8721 0.500145H12.9522L0.000427246 73.5Z"
                              fill="#53AA57"
                            />
                          </g>
                        </svg>
                      </div>
                      <svg
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-title font-medium text-lg">
                        {testimonial.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="testimonial-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[50px] h-[50px] bg-white text-title hover:text-white border border-border rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-primary hover:border-primary hover:scale-105 group cursor-pointer">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33301 10L16.6663 10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7.49965 14.1663C7.49965 14.1663 3.33302 11.0977 3.33301 9.99967C3.333 8.90167 7.49967 5.83301 7.49967 5.83301"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <button className="testimonial-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-[50px] h-[50px] bg-white text-title hover:text-white border border-border rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-primary hover:border-primary hover:scale-105 group cursor-pointer">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.667 10L3.33368 10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12.5004 14.1663C12.5004 14.1663 16.667 11.0977 16.667 9.99967C16.667 8.90167 12.5003 5.83301 12.5003 5.83301"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
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
