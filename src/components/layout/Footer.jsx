import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaInstagram, FaPhoneAlt } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

const links = [
  { name: "Home", href: "/" },
  { name: "Rental", href: "/rental" },
  { name: "Buy", href: "/buy" },
  { name: "Sell", href: "/sell" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Image
              src="/logo.png"
              alt="FCR Logo"
              width={100}
              height={100}
              className="mb-4"
            />

            <h3 className="text-xl font-bold text-white">
              Friendly Camera Rentals
            </h3>

            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Rent, Buy, and Sell professional cameras, lenses, and accessories.
              We also provide photography, videography, and editing services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-[#F5A623]">
              Quick Links
            </h4>

            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 transition hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-[#F5A623]">
              Services
            </h4>

            <ul className="space-y-3 text-zinc-400">
              <li>Camera Rentals</li>
              <li>Lens Rentals</li>
              <li>Accessories</li>
              <li>Photography</li>
              <li>Videography</li>
              <li>Photo Editing</li>
              <li>Video Editing</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-[#F5A623]">
              Contact
            </h4>

            <div className="space-y-4 text-zinc-400">
              <div className="flex items-center gap-3">
                <MdLocationOn className="text-[#F5A623]" />
                <span>Allur, Andhra Pradesh</span>
              </div>

              <a
                href="tel:+918639852224"
                className="flex items-center gap-3 hover:text-white"
              >
                <FaPhoneAlt className="text-[#F5A623]" />
                <span>+91 8639852224</span>
              </a>

              <a
                href="https://wa.me/918639852224"
                target="_blank"
                className="flex items-center gap-3 hover:text-white"
              >
                <FaWhatsapp className="text-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://instagram.com/friendly_camera_rentals"
                target="_blank"
                className="flex items-center gap-3 hover:text-white"
              >
                <FaInstagram className="text-pink-500" />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Friendly Camera Rentals. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
