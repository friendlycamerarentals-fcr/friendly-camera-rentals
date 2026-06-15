// src/app/sell/page.jsx

import SellHero from "@/components/sell/SellHero";
import SellBenefits from "@/components/sell/SellBenefits";
import SellForm from "@/components/sell/SellForm";
import ProcessTimeline from "@/components/sell/ProcessTimeline";
import FAQSection from "@/components/sell/FAQSection";

export const metadata = {
  title: "Sell Camera Equipment | Friendly Camera Rentals",
  description:
    "Sell your used cameras, lenses, drones, and accessories with Friendly Camera Rentals.",
};

export default function SellPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <SellHero />

      {/* Benefits Section */}
      <SellBenefits />

      {/* Sell Form */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-[#F5A623]">
            Sell Your Gear
          </span>

          <h2 className="mt-4 font-heading text-3xl font-bold md:text-5xl">
            Get the Best Value for Your Equipment
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Submit your equipment details and our team will review your request
            and contact you with the best market offer.
          </p>
        </div>

        <SellForm />
      </section>

      {/* Process Timeline */}
      <ProcessTimeline />

      {/* FAQ */}
      <FAQSection />
    </main>
  );
}
