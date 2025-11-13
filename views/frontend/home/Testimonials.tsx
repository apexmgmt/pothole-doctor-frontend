'use client'
import { useRef, useEffect, useState, MutableRefObject } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import Image from 'next/image'

interface Testimonial {
  title: string
  text: string
  name: string
  rating: number
  avatar: string
  bio: string
}

export default function TestimonialsSection() {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const swiperRef = useRef<any>(null)
  const [swiper, setSwiper] = useState<any>(null)

  const testimonials: Testimonial[] = [
    {
      title: '-Fast, Professional, and Reliable',
      text: '“Pothole Doctors came out the same week we called and fixed a dangerous pothole in our parking lot. The crew was professional, efficient, and left everything looking brand new. Our customers noticed the difference right away.”',
      name: 'David M.',
      rating: 5.0,
      avatar: '/images/avatar.webp',
      bio: 'Business Owner'
    },
    {
      title: '-Quality Work That Lasts',
      text: '“We’ve had other companies patch our lot before, but the repairs never lasted. Pothole Doctors did it right the first time. Months later, the surface is still smooth and holding up perfectly. We’ll definitely be using them again.”',
      name: 'Sarah T.',
      rating: 5.0,
      avatar: '/images/avatar.webp',
      bio: 'Property Manager'
    },
    {
      title: '-Driveway Looks Brand New',
      text: '“Pothole Doctors repaired the cracks and potholes in our driveway, and the difference is amazing. It’s smooth, clean, and adds real curb appeal to our home. We couldn’t be happier with the results!”',
      name: 'Karen S.',
      rating: 5.0,
      avatar: '/images/avatar.webp',
      bio: 'Homeowner'
    }
  ]

  useEffect(() => {
    if (swiper && prevRef.current && nextRef.current) {
      swiper.navigation.init()
      swiper.navigation.update()
    }
  }, [swiper])

  const handlePrevClick = () => {
    if (swiper) {
      swiper.slidePrev()
    }
  }

  const handleNextClick = () => {
    if (swiper) {
      swiper.slideNext()
    }
  }

  return (
    <section className='py-10 md:py-20 bg-white'>
      <div className='container !max-w-[1160px] '>
        <h2 className='max-w-[670px] mx-auto text-heading font-semibold text-center text-title mb-10 md:mb-15 font-primary leading-[1.2] uppercase'>
          WHAT OUR CUSTOMERS ARE SAYING
        </h2>

        <div className='relative sm:px-10 lg:px-15 xl:px-[110px]'>
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Autoplay]}
            spaceBetween={50}
            slidesPerView={1}
            onSwiper={setSwiper}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false
            }}
            loop={true}
            className='testimonials-swiper'
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className='px-3'>
                  <h3 className='text-lg md:text-xl text-title leading-tight mb-3 md:mb-5 font-semibold font-primary'>
                    {testimonial.title}
                  </h3>
                  <p className='text-lg md:text-2xl text-title leading-relaxed mb-8 md:mb-10 font-normal font-global'>
                    {testimonial.text}
                  </p>

                  <div className='flex items-center justify-between space-x-4'>
                    <div className='flex items-center gap-3'>
                      <figure className='w-10 h-10 md:w-12 md:h-12 rounded-full '>
                        <Image
                          fill
                          src={testimonial.avatar || '/images/avatar.webp'}
                          alt={testimonial.name}
                          className='h-full w-full object-cover !relative'
                        />
                      </figure>
                      <div className=''>
                        <h4 className='font-medium text-title text-body-text'>{testimonial.name}</h4>
                        <p className='text-text-color text-sm md:text-base'>{testimonial.bio}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 relative'>
                      <div className='absolute bottom-full right-0'>
                        <svg
                          width='118'
                          height='74'
                          viewBox='0 0 118 74'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <g opacity='0.08'>
                            <path d='M58.8705 73.5H82.4192L117.742 0.500145H71.8223L58.8705 73.5Z' fill='#53AA57' />
                            <path
                              d='M0.000427246 73.5H23.5491L58.8721 0.500145H12.9522L0.000427246 73.5Z'
                              fill='#53AA57'
                            />
                          </g>
                        </svg>
                      </div>
                      <svg className='w-5 h-5 text-yellow-400 fill-current' viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                      <span className='text-title font-medium text-body-text'>{testimonial.rating}/5</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='flex items-center justify-center gap-2 mt-5 sm:mt-0 '>
            <button
              ref={prevRef}
              onClick={handlePrevClick}
              className='testimonial-prev sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 z-10 w-10 h-10 lg:w-[50px] lg:h-[50px] bg-white text-title hover:text-white border border-border rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-primary hover:border-primary hover:scale-105 group cursor-pointer'
            >
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M3.33301 10L16.6663 10'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M7.49965 14.1663C7.49965 14.1663 3.33302 11.0977 3.33301 9.99967C3.333 8.90167 7.49967 5.83301 7.49967 5.83301'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>

            <button
              ref={nextRef}
              onClick={handleNextClick}
              className='testimonial-next sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 z-10 w-10 h-10 lg:w-[50px] lg:h-[50px] bg-white text-title hover:text-white border border-border rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-primary hover:border-primary hover:scale-105 group cursor-pointer'
            >
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M16.667 10L3.33368 10'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M12.5004 14.1663C12.5004 14.1663 16.667 11.0977 16.667 9.99967C16.667 8.90167 12.5003 5.83301 12.5003 5.83301'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>
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
  )
}
