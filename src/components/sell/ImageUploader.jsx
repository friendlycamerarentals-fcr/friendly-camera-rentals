"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "sonner";

export default function ImageUploader({ images, setImages, maxImages = 5 }) {
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const selectedFiles = Array.from(files);

    if (images.length + selectedFiles.length > maxImages) {
      toast.warning(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const previews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);

    toast.success(
      `${validFiles.length} image${
        validFiles.length > 1 ? "s" : ""
      } uploaded successfully.`,
    );
  };

  const handleChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index) => {
    const image = images[index];

    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));

    toast.info("Image removed successfully.");
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div>
        <h3 className="text-lg font-semibold text-white">
          Upload Product Images
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          Upload up to {maxImages} images.
        </p>
      </div>

      {/* Upload Box */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="cursor-pointer rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.03] p-10 text-center transition-all duration-300 hover:border-[#F5A623]/50 hover:bg-[#F5A623]/5"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5A623]/10 text-[#F5A623]">
          <FiUpload size={28} />
        </div>

        <h4 className="mt-4 text-lg font-semibold text-white">
          Drag & Drop Images
        </h4>

        <p className="mt-2 text-sm text-zinc-400">
          Click to browse or drag images here
        </p>

        <p className="mt-1 text-xs text-zinc-500">JPG • PNG • WEBP</p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleChange}
        />
      </motion.div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.preview}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-all duration-300 group-hover:opacity-100"
                >
                  <FiX size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
