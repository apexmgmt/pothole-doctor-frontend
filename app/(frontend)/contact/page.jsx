"use client";

import ContactSection from "@/components/frontend/contact/Contact";
import MapSection from "@/components/frontend/contact/Map";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <ContactSection />
      <MapSection />
    </div>
  );
}
