import { FaCamera, FaVideo, FaPhotoVideo, FaShoppingBag } from "react-icons/fa";

import { MdOutlineCameraAlt, MdOutlineEdit } from "react-icons/md";

import { LuCamera, LuPackage } from "react-icons/lu";

const services = [
  {
    icon: FaCamera,
    title: "Camera Rentals",
    description: "Professional DSLR and mirrorless cameras for every shoot.",
  },
  {
    icon: LuCamera,
    title: "Lens Rentals",
    description: "Wide-angle, portrait, telephoto, and cinematic lenses.",
  },
  {
    icon: LuPackage,
    title: "Accessories",
    description: "Tripods, gimbals, lights, batteries, and more.",
  },
  {
    icon: MdOutlineCameraAlt,
    title: "Photography",
    description: "Professional photography services for all occasions.",
  },
  {
    icon: FaVideo,
    title: "Videography",
    description: "Capture stunning videos with cinematic quality.",
  },
  {
    icon: MdOutlineEdit,
    title: "Photo Editing",
    description: "Professional retouching and color correction.",
  },
  {
    icon: FaPhotoVideo,
    title: "Video Editing",
    description: "Cinematic edits, reels, and highlight videos.",
  },
  {
    icon: FaShoppingBag,
    title: "Buy & Sell",
    description: "Buy used gear or sell your camera equipment.",
  },
];

export default services;
