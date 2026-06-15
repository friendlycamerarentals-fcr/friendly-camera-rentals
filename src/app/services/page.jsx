import ServicesHero from "@/components/services/ServicesHero";
import ServicesGrid from "@/components/services/ServicesGrid";
import WhyChooseUs from "@/components/services/WhyChooseUs";
import ProcessSection from "@/components/services/ProcessSection";
import BookSlotSection from "@/components/services/BookSlotSection";
import ServicesFAQ from "@/components/services/ServicesFAQ";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <ServicesHero />
      <ServicesGrid />
      <WhyChooseUs />
      <ProcessSection />
      <BookSlotSection />
      <ServicesFAQ />
    </main>
  );
}
