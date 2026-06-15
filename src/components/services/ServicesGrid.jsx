"use client";

import ServiceCard from "./ServiceCard";

import { FiCamera, FiVideo, FiEdit3, FiPrinter } from "react-icons/fi";

import { MdOutlinePhotoLibrary, MdOutlineMovieCreation } from "react-icons/md";

import { TbAlbum } from "react-icons/tb";
import { BsGlobe } from "react-icons/bs";

const services = [
  {
    title: "Photography",
    description:
      "Professional photography services for weddings, events, portraits, products and commercial shoots.",
    icon: FiCamera,
    image: "/images/photography.jpeg",
  },

  {
    title: "Videography",
    description:
      "High-quality cinematic videography for weddings, events and businesses.",
    icon: FiVideo,
    image: "/images/videography.webp",
  },

  {
    title: "Reels Creation",
    description:
      "Creative Instagram reels and social media content designed for engagement.",
    icon: MdOutlineMovieCreation,
    image: "/images/reelscreation.webp",
  },

  {
    title: "Photo Editing",
    description:
      "Professional retouching, color correction and image enhancement services.",
    icon: MdOutlinePhotoLibrary,
    image: "/images/photoediting.jpg",
  },

  {
    title: "Video Editing",
    description:
      "Cinematic editing with transitions, color grading and sound design.",
    icon: FiEdit3,
    image: "/images/videoediting.webp",
  },

  {
    title: "Photo Printing",
    description:
      "Premium quality photo printing in multiple sizes and finishes.",
    icon: FiPrinter,
    image: "/images/photoprinting.webp",
  },

  {
    title: "Album Design & Printing",
    description:
      "Luxury photo album design with premium printing and elegant layouts.",
    icon: TbAlbum,
    image: "/images/albumdesign.jpg",
  },

  {
    title: "3D Invitation Websites",
    description:
      "Interactive digital invitations for weddings, birthdays and events.",
    icon: BsGlobe,
    image: "/images/3d-inviation.png",
  },
];

export default function ServicesGrid() {
  return (
    <section id="services" className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            WHAT WE OFFER
          </span>

          <h2 className="mt-5 font-heading text-3xl font-bold text-white md:text-5xl">
            Our Creative Services
          </h2>

          <p className="mt-4 text-zinc-400">
            From capturing memories to creating digital experiences, we provide
            complete creative solutions under one roof.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
