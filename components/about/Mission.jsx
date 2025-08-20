import Image from "next/image";

export default function Mission() {
  return (
    <section className="pt-20 pb-[120px] bg-white">
      <div className="container">
        <div className="flex gap-12 items-center">
          <div className="flex-1 max-w-1/2 space-y-6">
            <h2 className="text-heading font-semibold text-title font-primary leading-tight mb-6 uppercase">
              Mission Statement
            </h2>
            <div className="space-y-6 text-body-text text-text-color leading-relaxed">
              <p>
                At Pothole Doctors, we are dedicated to healing America's roads
                through expert pothole repair and crack sealing services. We
                diagnose pavement problems quickly and deliver lasting solutions
                that restore safe, smooth driving surfaces for communities and
                businesses.
              </p>
              <p>
                Our skilled technicians combine proven techniques with quality
                materials to extend pavement life, reduce vehicle damage, and
                enhance road safety. We are committed to responsive service,
                competitive pricing, and workmanship that stands apart.
              </p>
            </div>
          </div>
          <div className="relative flex-1 max-w-1/2 ">
            <Image
              fill
              src="/images/Our-mission-thumb.webp"
              alt="Worker laying pavement stones"
              className="w-full h-full object-cover !relative"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
