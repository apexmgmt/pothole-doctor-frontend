'use client'

import Image from 'next/image'

const WorkProcessSection: React.FC = () => {
  return (
    <section className='pt-10 md:pt-20 pb-15 md:pb-30 bg-white'>
      <div className='container'>
        {/* Header */}
        <div className='text-center mb-10 max-w-xl mx-auto'>
          <h2 className='text-heading font-semibold text-center text-title mb-6 font-primary leading-[1.2] uppercase'>
            OUR PROCESS
          </h2>
          <p className='text-body-text text-text-color '>
            We follow a simple yet effective process to deliver quality paving solutions on time and within budget.
          </p>
        </div>

        {/* Process Grid */}
        <div className='relative'>
          {/* Grid Container */}
          <div className='grid lg:grid-rows-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 items-center'>
            {/* Step 01 */}
            <div className='bg-primary-foreground rounded-lg p-5 xl:p-[30px] h-full'>
              <div className='text-[34px] md:text-[38px] xl:text-[44px] font-primary font-semibold text-primary mb-4 xl:mb-6 leading-[1]'>
                01
              </div>
              <h3 className='text-lg xl:text-xl font-semibold text-title mb-1.5 xl:mb-4 leading-[1.2] font-primary'>
                CONSULTATION
              </h3>
              <p className='text-text-color text-base leading-relaxed'>
                We start by carefully inspecting your pavement to identify cracks, potholes, and underlying issues. Our
                team assesses the root cause so the repair is more than just a quick patch.
              </p>
            </div>

            {/* Center Column - Image */}
            <div className='row-span-2 hidden lg:block'>
              <Image
                fill
                src='/images/work-process.webp'
                alt='Professional worker laying paving stones'
                className='w-full max-w-md !relative'
              />
            </div>

            {/* Step 02 */}
            <div className='bg-primary-foreground rounded-lg p-5 xl:p-[30px] h-full'>
              <div className='text-[34px] md:text-[38px] xl:text-[44px] font-primary font-semibold text-primary mb-4 xl:mb-6 leading-[1]'>
                02
              </div>
              <h3 className='text-lg xl:text-xl font-semibold text-title mb-1.5 xl:mb-4 leading-[1.2] font-primary'>
                SITE INSPECTION
              </h3>
              <p className='text-text-color text-base leading-relaxed'>
                Every surface is different. We create a tailored repair plan that outlines the best methods and
                materials for a long-lasting solution — whether it’s a minor patch or a full resurfacing.
              </p>
            </div>

            {/* Step 03 */}
            <div className='bg-primary-foreground rounded-lg p-5 xl:p-[30px] h-full'>
              <div className='text-[34px] md:text-[38px] xl:text-[44px] font-primary font-semibold text-primary mb-4 xl:mb-6 leading-[1]'>
                03
              </div>
              <h3 className='text-lg xl:text-xl font-semibold text-title mb-1.5 xl:mb-4 leading-[1.2] font-primary'>
                CUSTOM QUOTE
              </h3>
              <p className='text-text-color text-base leading-relaxed'>
                We prepare the area by cleaning debris, loose asphalt, and damaged material to ensure proper adhesion
                and a flawless finish.
              </p>
            </div>

            {/* Step 04 */}
            <div className='bg-primary-foreground rounded-lg p-5 xl:p-[30px] h-full'>
              <div className='text-[34px] md:text-[38px] xl:text-[44px] font-primary font-semibold text-primary mb-4 xl:mb-6 leading-[1]'>
                04
              </div>
              <h3 className='text-lg xl:text-xl font-semibold text-title mb-1.5 xl:mb-4 leading-[1.2] font-primary'>
                FINAL CHECK
              </h3>
              <p className='text-text-color text-base leading-relaxed'>
                Using proven techniques and high-quality materials, our crew restores your surface. From pothole filling
                to crack sealing, we guarantee durability and safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WorkProcessSection
