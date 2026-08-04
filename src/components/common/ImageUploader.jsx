"use client";

import { useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function ImageUploader({
  images = [],
  setImages,
  maxFiles = 10,
}) {
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);

    if (images.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    const imageItems = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...imageItems]);
  };

  const removeImage = (index) => {
    const image = images[index];

    if (image && typeof image !== "string" && image.preview) {
      URL.revokeObjectURL(image.preview);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-3xl border border-dashed border-white/20 bg-zinc-950 px-5 py-6 transition-all duration-300 hover:border-[#F5A623]/40 hover:bg-zinc-900 md:px-8 md:py-8"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-2xl bg-[#F5A623]/10 flex h-16 w-16 items-center justify-center p-3 md:h-auto md:w-auto md:p-4">
            <Upload
              size={28}
              className="text-[#F5A623] w-5 h-5 md:w-7 md:h-7"
            />
          </div>

          <h3 className="mt-3 text-xl font-semibold text-white md:text-lg">
            Upload Images
          </h3>

          <p className="mt-1.5 text-xs text-zinc-500 md:text-sm">
            Click to upload up to {maxFiles} images
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Images Preview */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
          {images.map((image, index) => {
            const imageSrc =
              typeof image === "string"
                ? image.trim() || null
                : image.url || image.preview || null;

            const isLocalPreview =
              typeof imageSrc === "string" &&
              (imageSrc.startsWith("blob:") || imageSrc.startsWith("data:"));

            return (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10"
              >
                {!imageSrc ? (
                  <div className="h-full w-full bg-white/5" />
                ) : isLocalPreview ? (
                  <img
                    src={imageSrc}
                    alt={`Product Image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={imageSrc}
                    alt={`Product Image ${index + 1}`}
                    fill
                    sizes="100px"
                    unoptimized
                    className="object-cover"
                  />
                )}

                {/* Cover Badge */}
                {index === 0 && (
                  <div className="absolute left-2 top-2 rounded-full bg-[#F5A623] px-2 py-1 text-[10px] font-semibold text-black">
                    Cover
                  </div>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-red-400 shadow-[0_0_10px_rgba(0,0,0,0.3)] backdrop-blur-sm opacity-100 transition-all duration-300 md:right-2 md:top-2 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
          <ImageIcon size={40} className="mx-auto text-zinc-600" />

          <p className="mt-3 text-sm text-zinc-500">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
