import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import LegalSections from "@/components/legal/LegalSections";

export const metadata = {
  title: "Terms & Conditions | Friendly Camera Rentals",
  description:
    "Read the Terms & Conditions for using Friendly Camera Rentals rental services and website.",
};

const sections = [
  {
    title: "Rental Services",
    paragraphs: [
      "Friendly Camera Rentals provides cameras, lenses, accessories, and related photography equipment for rental.",
      "Customers must provide accurate information when making a rental request or booking.",
      "A rental request submitted through the website is not considered confirmed until Friendly Camera Rentals confirms the booking.",
    ],
  },
  {
    title: "Booking & Confirmation",
    paragraphs: [
      "Customers may submit rental requests through the website.",
      "A booking becomes confirmed only after confirmation from Friendly Camera Rentals.",
      "Availability, rental duration, pricing, deposit requirements, and other booking details may be communicated to the customer during the booking process.",
      "Friendly Camera Rentals reserves the right to decline a rental request if the requested equipment is unavailable or if the rental requirements cannot be fulfilled.",
    ],
  },
  {
    title: "Equipment Handling & Care",
    paragraphs: [
      "Customers must handle all rented cameras, lenses, accessories, and other equipment carefully and responsibly.",
      "Customers must use the equipment only for its intended purpose and should follow reasonable operating and safety instructions.",
      "Customers must not intentionally misuse, modify, dismantle, or otherwise handle the equipment in a way that could cause unnecessary damage.",
      "The customer is responsible for keeping the rented equipment safe throughout the rental period.",
      "All rented equipment must be returned in the same condition in which it was provided, except for normal wear and tear.",
    ],
  },
  {
    title: "Damage, Loss & Repair Costs",
    paragraphs: [
      "Customers may be responsible for damage, loss, theft, or destruction of rented equipment occurring during their rental period when caused by misuse, negligence, improper handling, accident, liquid or water exposure, or other circumstances within the customer's responsibility.",
    ],
    list: [
      "Cracked or broken camera bodies",
      "Damaged or broken lenses",
      "Broken LCD screens or viewfinders",
      "Water or liquid damage",
      "Damaged buttons, ports, switches, or controls",
      "Significant scratches, dents, or physical damage",
      "Damaged batteries, chargers, cables, or other accessories",
      "Missing equipment or accessories",
      "Damage that affects the normal operation of the equipment",
    ],
    paragraphsAfter: [
      "Friendly Camera Rentals may inspect equipment when it is returned.",
      "If equipment is found to be damaged, the customer may be responsible for reasonable repair costs.",
      "If the equipment cannot reasonably be repaired, the customer may be responsible for the applicable replacement cost.",
      "The customer should immediately inform Friendly Camera Rentals if rented equipment is accidentally damaged, lost, or stolen.",
    ],
  },
  {
    title: "Equipment Return",
    paragraphs: [
      "Customers must return rented equipment on or before the agreed return date and time.",
      "All equipment and included accessories must be returned together.",
      "Late returns may affect other customers' bookings and may result in additional rental charges where applicable.",
    ],
  },
  {
    title: "Customer Responsibility",
    paragraphs: [
      "Customers are responsible for the equipment from the time it is provided to them until it is returned and accepted by Friendly Camera Rentals.",
      "Customers should take reasonable precautions to prevent theft, loss, accidental damage, or misuse.",
    ],
  },
  {
    title: "Payments & Charges",
    paragraphs: [
      "Applicable rental charges, deposits, repair charges, replacement charges, or other fees will be communicated to the customer as applicable.",
      "Customers are responsible for paying charges associated with their confirmed rental and any applicable damage or replacement costs.",
    ],
  },
  {
    title: "Cancellations",
    paragraphs: [
      "Cancellation and refund conditions may depend on the individual booking.",
      "Customers should contact Friendly Camera Rentals as soon as possible if they need to cancel or modify a booking.",
      "Any applicable cancellation or refund terms will be communicated during the booking process.",
    ],
  },
  {
    title: "Prohibited Use",
    paragraphs: [
      "Customers must not use rented equipment for unlawful activities or in a manner that could intentionally cause damage to the equipment.",
      "Customers must not attempt to sell, transfer ownership of, or permanently modify rented equipment.",
    ],
  },
  {
    title: "Website Information",
    paragraphs: [
      "We aim to keep product information, availability, pricing, and other website information accurate.",
      "However, information may change and availability may vary.",
      "Friendly Camera Rentals may update website content, product information, pricing, or services when necessary.",
    ],
  },
  {
    title: "Changes to These Terms",
    paragraphs: [
      "Friendly Camera Rentals may update these Terms & Conditions from time to time.",
      "Any updated version will be published on this page.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "If you have questions regarding these Terms & Conditions, please contact Friendly Camera Rentals through the Contact Us page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
        </div>

        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-400"
          >
            <FiArrowLeft size={16} />
            Return to Home
          </Link>

          <p className="mt-8 text-sm uppercase tracking-[0.35em] text-amber-400">
            Friendly Camera Rentals
          </p>

          <h1 className="font-heading mt-4 text-5xl font-semibold leading-tight md:text-6xl">
            Terms &amp; Conditions
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Welcome to Friendly Camera Rentals. These Terms &amp; Conditions
            govern your use of our website and our camera rental services. By
            using our website or submitting a rental request, you agree to
            these terms.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
        <LegalSections sections={sections} />
      </section>
    </main>
  );
}
