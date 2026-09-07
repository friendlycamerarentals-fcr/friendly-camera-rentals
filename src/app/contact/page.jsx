import {
  FaPhoneAlt,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact Us | Friendly Camera Rentals",
  description:
    "Get in touch with Friendly Camera Rentals for camera rentals, photography, videography, and editing services.",
};

export default function ContactPage() {
  return (
    <main className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
            Contact Us
          </p>

          <h1 className="font-heading mt-4 text-5xl font-semibold leading-tight md:text-7xl">
            Let's Create Something
            <span className="text-amber-400"> Amazing</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Have questions about rentals, buying, selling, photography, or
            videography? Get in touch with us.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(245,166,35,0.15)] md:p-8">
            <FaPhoneAlt className="mx-auto text-2xl text-amber-400 md:text-3xl" />
            <h3 className="font-heading mt-3 text-2xl font-semibold md:mt-4 md:text-3xl">
              Call Us
            </h3>
            <p className="mt-2 text-zinc-400 md:mt-3">+91 8639852224</p>
          </div>

          <a
            href="https://wa.me/918639852224"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(245,166,35,0.15)] md:p-8"
          >
            <FaWhatsapp className="mx-auto text-2xl text-amber-400 md:text-3xl" />
            <h3 className="font-heading mt-3 text-2xl font-semibold md:mt-4 md:text-3xl">
              WhatsApp
            </h3>
            <p className="mt-2 text-zinc-400 md:mt-3">Chat with us instantly</p>
          </a>

          <a
            href="https://instagram.com/friendly_camera_rentals"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(245,166,35,0.15)] md:p-8"
          >
            <FaInstagram className="mx-auto text-2xl text-amber-400 md:text-3xl" />
            <h3 className="font-heading mt-3 text-2xl font-semibold md:mt-4 md:text-3xl">
              Instagram
            </h3>
            <p className="mt-2 text-zinc-400 md:mt-3">
              @friendly_camera_rentals
            </p>
          </a>
        </div>
      </section>

      {/* Form & Info */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-24 lg:grid-cols-2 lg:px-8">
        <ContactForm />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_15px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_70px_rgba(245,166,35,0.12)] md:p-10">
          <h2 className="font-heading text-4xl font-semibold md:text-5xl">
            Visit Us
          </h2>

          <div className="mt-8 space-y-8">
            <div className="flex gap-4">
              <FaMapMarkerAlt className="mt-1 text-xl text-amber-400" />
              <div>
                <h3 className="font-heading text-2xl">Location</h3>
                <p className="text-zinc-400">Allur, Andhra Pradesh, India</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FaPhoneAlt className="mt-1 text-xl text-amber-400" />
              <div>
                <h3 className="font-heading text-2xl">Phone</h3>
                <p className="text-zinc-400">+91 8639852224</p>
              </div>
            </div>
          </div>

          <div className="mt-10 h-64 overflow-hidden rounded-2xl border border-white/10 bg-black md:h-80 lg:h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3813.654486288411!2d80.05072777499412!3d14.719619574151857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4c877833a392f3%3A0x8a1694339b8f99fc!2sFriendly%20Camera%20Rentals!5e1!3m2!1sen!2sin!4v1788669671659!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
