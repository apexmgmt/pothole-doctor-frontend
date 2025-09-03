import Image from "next/image";

export default function About() {
  return (
    <section className="py-10 md:py-15 bg-white">
      <div className="container">
        <div className="flex items-center gap-8 lg:gap-12 flex-col-reverse lg:flex-row">
          <div className="flex-1 w-full lg:max-w-1/2">
            <h5 className="text-base font-semibold text-primary tracking-wide uppercase mb-2 md:mb-4">
              ABOUT US
            </h5>
            <h1 className="text-heading font-semibold font-primary text-title mb-4  md:mb-6 leading-[1.2] uppercase">
              Repairing Roads. Restoring Confidence
            </h1>
            <div className="md:space-y-6 space-y-3 text-body-text text-text-color leading-relaxed">
              <p>
                Founded in Southern Ohio, Pothole Doctors began with a simple
                mission: to provide communities with expert pothole repair and
                crack sealing services that actually last. What started as a
                local solution to a universal problem has grown into a proven
                business model that's now expanding through franchise
                opportunities across the region and beyond.
              </p>
              <p>
                Our founders recognized that most road repairs were temporary
                fixes that failed within months, costing property owners and
                municipalities both time and money. By combining specialized
                equipment, premium materials, and proven techniques, we
                developed a systematic approach that extends pavement life and
                delivers lasting value to our customers.
              </p>
            </div>
          </div>
          <div className="flex-1 w-full lg:max-w-1/2">
            <Image
              fill
              src="/images/about-hero.webp"
              alt="Workers laying paving stones"
              className="w-full h-full object-cover !relative"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
