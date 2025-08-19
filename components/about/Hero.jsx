import Image from "next/image";

export default function Hero() {
  return (
    <section className="py-15 bg-white">
      <div className="container">
        <div className="flex items-center gap-12">
          <div className="flex-1 max-w-1/2">
            <h5 className="text-base font-semibold text-primary tracking-wide uppercase mb-4">
              ABOUT US
            </h5>
            <h1 className="text-heading font-semibold text-title font-primary leading-tight mb-6">
              BUILDING STRONG FOUNDATIONS
            </h1>
            <div className="space-y-6 text-body-text text-text-color leading-relaxed">
              <p>
                Welcome to{" "}
                <span className="font-medium text-title">
                  The Pothole Doctors
                </span>
                , where passion meets precision in every paving project. With
                years of experience and a deep commitment to quality, we've
                become a trusted name in the paving industry from residential
                driveways to commercial lots.
              </p>
              <p>
                Whether you're envisioning a sleek, modern finish or a durable,
                long-lasting foundation, we're here to deliver craftsmanship
                that stands the test of time.
              </p>
            </div>
          </div>
          <div className="flex-1 max-w-1/2">
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
