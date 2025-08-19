"use client";

import Image from "next/image";

export default function WorkProcessSection() {
  return (
    <section className="py-15 bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-semibold text-title mb-6">
            OUR PROCESS
          </h2>
          <p className="text-xl text-text-color max-w-3xl mx-auto">
            We follow a simple yet effective process to deliver quality paving
            solutions on time and within budget.
          </p>
        </div>

        {/* Process Grid */}
        <div className="relative">
          {/* Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Column - Steps 01 & 02 */}
            <div className="space-y-8">
              {/* Step 01 */}
              <div className="bg-primary-foreground rounded-2xl p-8 border border-green-100">
                <div className="text-4xl font-semibold text-primary mb-4">
                  01
                </div>
                <h3 className="text-2xl font-semibold text-title mb-3">
                  CONSULTATION
                </h3>
                <p className="text-text-color text-lg">
                  Understanding your project needs
                </p>
              </div>

              {/* Step 02 */}
              <div className="bg-primary-foreground rounded-2xl p-8 border border-green-100">
                <div className="text-4xl font-semibold text-primary mb-4">
                  02
                </div>
                <h3 className="text-2xl font-semibold text-title mb-3">
                  SITE INSPECTION
                </h3>
                <p className="text-text-color text-lg">
                  Detailed assessment & planning
                </p>
              </div>
            </div>

            {/* Center Column - Image */}
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  fill
                  src="/images/work-process.webp"
                  alt="Professional worker laying paving stones"
                  className="w-full max-w-md !relative"
                />
              </div>
            </div>

            {/* Right Column - Steps 03 & 04 */}
            <div className="space-y-8">
              {/* Step 03 */}
              <div className="bg-primary-foreground rounded-2xl p-8 border border-green-100">
                <div className="text-4xl font-semibold text-primary mb-4">
                  03
                </div>
                <h3 className="text-2xl font-semibold text-title mb-3">
                  CUSTOM QUOTE
                </h3>
                <p className="text-text-color text-lg">
                  Transparent and fair pricing
                </p>
              </div>

              {/* Step 04 */}
              <div className="bg-primary-foreground rounded-2xl p-8 border border-green-100">
                <div className="text-4xl font-semibold text-primary mb-4">
                  04
                </div>
                <h3 className="text-2xl font-semibold text-title mb-3">
                  FINAL CHECK
                </h3>
                <p className="text-text-color text-lg">
                  Quality assurance & client approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
