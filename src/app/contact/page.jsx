import {
  FaPhoneAlt,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

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
            Have questions about rentals, buying, selling,
            photography, or videography? Get in touch with us.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Call */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(245,166,35,0.15)]">
            <FaPhoneAlt className="mx-auto text-3xl text-amber-400" />

            <h3 className="font-heading mt-4 text-3xl font-semibold">
              Call Us
            </h3>

            <p className="mt-3 text-zinc-400">
              +91 8639852224
            </p>
          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/918639852224"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(245,166,35,0.15)]"
          >
            <FaWhatsapp className="mx-auto text-3xl text-amber-400" />

            <h3 className="font-heading mt-4 text-3xl font-semibold">
              WhatsApp
            </h3>

            <p className="mt-3 text-zinc-400">
              Chat with us instantly
            </p>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/friendly_camera_rentals"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(245,166,35,0.15)]"
          >
            <FaInstagram className="mx-auto text-3xl text-amber-400" />

            <h3 className="font-heading mt-4 text-3xl font-semibold">
              Instagram
            </h3>

            <p className="mt-3 text-zinc-400">
              @friendly_camera_rentals
            </p>
          </a>
        </div>
      </section>

      {/* Form & Info */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-24 lg:grid-cols-2 lg:px-8">
        {/* Contact Form */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_15px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_70px_rgba(245,166,35,0.12)] md:p-10">
          <h2 className="font-heading text-4xl font-semibold md:text-5xl">
            Send a Message
          </h2>

          <p className="mt-3 text-zinc-400">
            We'd love to hear from you.
          </p>

          <form className="mt-8 space-y-5">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition-all duration-300 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,166,35,0.2)]"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition-all duration-300 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,166,35,0.2)]"
            />

            <textarea
              rows={5}
              placeholder="Your Message"
              className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition-all duration-300 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,166,35,0.2)]"
            />

            <button
              type="submit"
              className="rounded-full bg-amber-500 px-8 py-4 font-semibold text-black shadow-[0_8px_30px_rgba(245,166,35,0.35)] transition-all duration-300 hover:scale-105 hover:bg-amber-400 hover:shadow-[0_12px_40px_rgba(245,166,35,0.5)] cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Business Info */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_15px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_70px_rgba(245,166,35,0.12)] md:p-10">
          <h2 className="font-heading text-4xl font-semibold md:text-5xl">
            Visit Us
          </h2>

          <div className="mt-8 space-y-8">
            <div className="flex gap-4">
              <FaMapMarkerAlt className="mt-1 text-xl text-amber-400" />

              <div>
                <h3 className="font-heading text-2xl">
                  Location
                </h3>

                <p className="text-zinc-400">
                  Allur, Andhra Pradesh, India
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FaPhoneAlt className="mt-1 text-xl text-amber-400" />

              <div>
                <h3 className="font-heading text-2xl">
                  Phone
                </h3>

                <p className="text-zinc-400">
                  +91 8639852224
                </p>
              </div>
            </div>
          </div>

          {/* Google Map Placeholder */}
          <div className="mt-10 flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-black text-zinc-500">
            Google Map Coming Soon
          </div>
        </div>
      </section>
    </main>
  );
}