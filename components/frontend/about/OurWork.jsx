import Image from "next/image";

export default function OurWork() {
  return (
    <section className="py-15 md:py-[120px] bg-white">
      <div className="container">
        <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
          <div className="relative order-2 lg:order-1 flex-1 w-full lg:max-w-1/2">
            <Image
              fill
              src="/images/our-work-thumb.webp"
              alt="Worker laying pavement stones"
              className="w-full h-full object-cover !relative"
            />
          </div>
          <div className="space-y-6 order-1 lg:order-2 flex-1 w-full lg:max-w-1/2">
            <h2 className="text-heading font-semibold text-title font-primary leading-tight mb-6 uppercase">
              Our Southern <br /> Ohio Roots
            </h2>
            <p className="text-body-text text-text-color leading-relaxed">
              Based in the heart of Southern Ohio, we understand the unique
              challenges that Midwest weather brings to road surfaces. From
              freeze-thaw cycles that create new potholes overnight to heavy
              trafic that accelerates pavement deterioration.
            </p>
            <p className="text-body-text text-text-color leading-relaxed">
              we've seen it all and developed solutions that work in real-world
              conditions. This local expertise has become the foundation of our
              franchise system.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
