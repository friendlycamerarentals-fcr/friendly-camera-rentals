"use client";

import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";

const ALLOWED_IMAGE_HOSTNAMES = [
  "lh3.googleusercontent.com",
  "res.cloudinary.com",
];

function isValidImageUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const parsed = new URL(url);

    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      ALLOWED_IMAGE_HOSTNAMES.includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export default function ProfileAvatar({ src, alt = "User avatar", size = 40 }) {
  const hasValidImage = isValidImageUrl(src);
  const iconSize = Math.max(24, Math.floor(size * 0.55));

  return hasValidImage ? (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full border border-white/10 object-cover"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full border border-white/10 bg-zinc-950"
    >
      <FaUserCircle size={iconSize} className="text-[#F5A623]" />
    </div>
  );
}
