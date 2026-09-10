import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import LegalSections from "@/components/legal/LegalSections";

export const metadata = {
  title: "Privacy Policy | Friendly Camera Rentals",
  description:
    "Read the Privacy Policy for Friendly Camera Rentals and learn how customer information is collected and used.",
};

const sections = [
  {
    title: "Information We Collect",
    paragraphs: [
      "Depending on how you use our website, we may collect information such as:",
    ],
    list: [
      "Name",
      "Email address",
      "Phone number",
      "Address",
      "Rental and booking information",
      "Product or equipment preferences",
      "Messages or enquiries submitted through the Contact Us form",
      "Account-related information",
      "Information voluntarily provided by you when using our services",
    ],
    paragraphsAfter: [
      "We only collect information that is reasonably necessary to provide and manage our services.",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: ["We may use the information we collect to:"],
    list: [
      "Process rental requests and bookings",
      "Manage customer accounts",
      "Contact customers regarding enquiries or bookings",
      "Provide customer support",
      "Communicate important information regarding rentals",
      "Manage equipment rentals",
      "Improve our website and services",
      "Respond to customer messages",
      "Maintain website security and functionality",
    ],
  },
  {
    title: "Google Sign-In",
    paragraphs: [
      "If you choose to sign in using Google, authentication is handled through Google's authentication services.",
      "We may receive basic account information provided through the authentication process, such as your name, email address, and profile information where applicable.",
      "This information may be used to create or manage your FCR customer account and provide account-related functionality.",
    ],
  },
  {
    title: "Information Sharing",
    paragraphs: [
      "Friendly Camera Rentals does not sell or rent your personal information to third parties.",
      "We may share necessary information with trusted service providers when required to operate our website or provide services requested by you.",
      "Examples may include services used for:",
    ],
    list: [
      "Authentication",
      "Payment processing",
      "Communication",
      "Website hosting",
      "Analytics",
      "Customer service",
      "Rental or booking management",
    ],
    paragraphsAfter: [
      "Third-party service providers may have their own privacy policies governing how they process information.",
    ],
  },
  {
    title: "WhatsApp Communication",
    paragraphs: [
      "If you choose to contact Friendly Camera Rentals through WhatsApp, information you provide through WhatsApp may be processed by WhatsApp according to its own privacy policy and terms.",
      "WhatsApp may be used to communicate regarding rental enquiries, bookings, products, or customer support.",
    ],
  },
  {
    title: "Contact Form Information",
    paragraphs: [
      "When you submit information through the Contact Us form, the information you provide may be used to respond to your enquiry and provide customer support.",
      "We do not use submitted contact information for unrelated purposes without appropriate justification.",
    ],
  },
  {
    title: "Cookies & Similar Technologies",
    paragraphs: [
      "Our website may use cookies or similar technologies to provide essential functionality, maintain sessions, improve website performance, and understand how visitors use the website.",
      "You can manage cookie settings through your browser where supported.",
    ],
  },
  {
    title: "Data Security",
    paragraphs: [
      "We take reasonable measures to protect the information we collect against unauthorized access, misuse, alteration, or disclosure.",
      "However, no internet-based service can guarantee complete security.",
    ],
  },
  {
    title: "Data Retention",
    paragraphs: [
      "We may retain customer and booking information for as long as reasonably necessary to provide services, maintain business records, resolve disputes, comply with applicable requirements, and protect our legitimate interests.",
    ],
  },
  {
    title: "Your Information",
    paragraphs: [
      "If you have questions about the information associated with your account or believe that your information needs to be corrected or updated, you may contact Friendly Camera Rentals.",
      "We will make reasonable efforts to address legitimate requests regarding your information.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "Our website may use third-party services such as:",
    ],
    list: [
      "Google authentication",
      "Payment services",
      "WhatsApp",
      "Hosting services",
      "Analytics services",
      "Other services required to operate the website",
    ],
    paragraphsAfter: [
      "These services may process information according to their own terms and privacy policies.",
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "Our website is not intended to knowingly collect personal information from children without appropriate authorization.",
      "If you believe that a child has provided personal information through our website, please contact us.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    paragraphs: [
      "Friendly Camera Rentals may update this Privacy Policy from time to time.",
      "When changes are made, the updated policy will be published on this page.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "If you have questions or concerns about this Privacy Policy or how your information is handled, please contact Friendly Camera Rentals through the Contact Us page.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Friendly Camera Rentals respects your privacy and is committed to
            protecting the information you provide when using our website and
            services. This Privacy Policy explains what information we may
            collect, how we may use it, and how we handle that information.
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
