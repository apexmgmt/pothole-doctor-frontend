export default function Vision() {
  const visionValuesData = [
    {
      title: "Expertise",
      description:
        "We bring specialized knowledge and proven techniques to every repair job",
    },
    {
      title: "Responsiveness",
      description:
        "Quick diagnosis and timely repairs that minimize disruption",
    },
    {
      title: "Quality",
      description:
        "We use premium materials and proven methods that deliver lasting results",
    },
    {
      title: "Safety",
      description:
        "Every repair prioritizes the safety of our customers, the public, and our crew",
    },
    {
      title: "Community Focus",
      description:
        "We work closely with local governments, businesses, and property owners to maintain the roads that drive economic growth and quality of life",
      wide: true,
    },
  ];

  return (
    <section className="py-20 bg-primary-foreground  text-center">
      <div className="container !max-w-[850px]">
        <h2 className="text-heading font-semibold text-title font-primary leading-tight mb-6 uppercase">
          VISION STATEMENT
        </h2>
        <p className="text-lg text-text-color max-w-[712px] mx-auto leading-relaxed">
          To be the trusted road repair specialists in every community we serve,
          known for transforming damaged pavement into safe, durable surfaces.
          We envision a future where preventive maintenance and expert repairs
          keep roads in optimal condition, reducing costly replacements and
          creating safer transportation.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-10 text-start">
          {visionValuesData.map((item, index) => {
            const isLastItem = index === visionValuesData.length - 1;
            const isOddTotal = visionValuesData.length % 2 !== 0;
            const shouldSpanTwo = isLastItem && isOddTotal;

            return (
              <div
                key={index}
                className={`bg-white p-6 rounded-lg hover:shadow-md transition-shadow ${
                  shouldSpanTwo ? "md:col-span-2" : ""
                }`}
              >
                <h3 className="text-[28px] font-primary font-semibold text-title mb-[18px]">
                  {item.title}
                </h3>
                <p className="text-text-color text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
